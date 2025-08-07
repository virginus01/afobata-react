import { addToCurrentDate } from '@/app/helpers/addToCurrentDate';
import { isNull } from '@/app/helpers/isNull';
import { randomNumber } from '@/app/helpers/randomNumber';
import { generateSub } from '@/app/api/plan/plan';
import { Order } from '@/app/models/Order';
import {
  fetchDataWithConditions,
  updateDataWithConditions,
  upsert,
} from '@/app/api/database/mongodb';
import { get_user } from '@/api/user';
import { cache } from 'react';
import { convertDateTime } from '@/app/helpers/convertDateTime';
import { FREE_PACKAGE_ID } from '@/app/src/constants';

export async function fulFill_subscriptions({
  order,
  siteInfo,
  user,
}: {
  order: Order;
  siteInfo: BrandType;
  user: UserTypes;
}) {
  try {
    if (isNull(order.userId)) {
      console.error('user id missing');
      return { status: order.status };
    }

    let expiresAt = addToCurrentDate({ days: order?.duration?.value || 0 });

    const subData: any = await generateSub({
      data: {
        brandId: siteInfo?.id,
        userId: order?.userId,
        expiresAt,
        packageId: order?.productId,
      },
      siteInfo,
    });

    if (isNull(subData) || !subData.status) {
      console.error(subData?.msg + ' error generating subscription');
      return { status: false, msg: `failed to fullfill package subscription ${order?.productId}` };
    }

    const id = randomNumber(10);
    const saveSub = await upsert({ ...subData.data, id }, 'subscriptions', true, {});

    if (!saveSub.status) {
      console.error(saveSub?.msg + ' error generating subscription');
      return { status: false, msg: `failed to save subscription data for ${order?.productId} ` };
    }

    const sUpdate = await updateDependants({ user, subscriptionId: id });
    return { status: sUpdate.status ? 'processed' : order.status, id };
  } catch (error) {
    console.error(`Failed to fulfill ${order.type} order:`, error);
    return { status: order.status };
  }
}

async function updateDependants({
  user,
  subscriptionId,
}: {
  user: UserTypes;
  subscriptionId: string;
}) {
  const [update, updateBrands] = await Promise.all([
    updateDataWithConditions({
      collectionName: 'users',
      conditions: {
        $or: [{ id: user?.id! }, { bossId: user?.id! }],
      },
      updateFields: { subscriptionId },
    }),
    updateDataWithConditions({
      collectionName: 'brands',
      conditions: {
        $or: [{ id: user?.brand?.id! }, { parentCompanyId: user?.brand?.id! }],
      },
      updateFields: { subscriptionId },
    }),
  ]);

  if (!(update.status && updateBrands.status)) {
    console.error('error updating subscription dependants');
  }

  return { status: update.status && updateBrands.status };
}

export const getSubscription = cache(
  async (
    id?: string,
  ): Promise<{
    subscription?: UserTypes;
    msg?: string;
    status: boolean;
    brand?: BrandType;
  }> => {
    try {
      let subscriptionId = id;

      if (isNull(subscriptionId)) {
        return { status: false, msg: 'subscriptionId data null' };
      }

      let sub: SubscriptionModel = {} as any;

      const result: SubscriptionModel[] = await fetchDataWithConditions('subscriptions', {
        id: subscriptionId,
      });

      if (!isNull(result)) {
        sub = result[0];

        if (convertDateTime() > convertDateTime(sub.expiresAt)) {
          let expiresAt = addToCurrentDate({ years: 100 });

          const { data: user } = await get_user({ id: sub.userId });
          const siteInfo: BrandType = await fetchDataWithConditions('brands', {
            id: user?.brandId,
          });

          const subData: any = await generateSub({
            data: {
              brandId: siteInfo?.id,
              userId: sub.userId,
              expiresAt,
              packageId: FREE_PACKAGE_ID,
            },
            siteInfo,
          });

          if (!isNull(subData)) {
            const id = randomNumber(10);
            const saveSub = await upsert({ ...subData?.data, id }, 'subscriptions', true, {});

            if (!saveSub.status) {
              console.error(saveSub?.msg ?? 'error generating subscription');
            }

            await updateDependants({ user: user ?? {}, subscriptionId: id });

            sub = subData;
          }
        }
      }

      return {
        subscription: sub,
        status: true,
        msg: '',
      };
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return { status: false, msg: 'error getting current user' };
    }
  },
);
