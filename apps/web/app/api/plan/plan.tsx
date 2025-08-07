import { fetchDataWithConditions, updateData, upsert } from '@/app/api/database/mongodb';
import { invalid_response } from '@/app/helpers/invalid_response';

import { convertDateTime } from '@/app/helpers/convertDateTime';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { generateSubId } from '@/app/helpers/generateSubId';
import { get_plan_data } from '@/app/helpers/get_plan_data';
import {
  getAvailableAddonsStatus,
  getAvailableAddonsValues,
} from '@/app/helpers/getAvailableAddonsStatus';

import { isNull } from '@/app/helpers/isNull';

import { getBrandInfo } from '@/api/brand/brand';

export async function get_plan({
  userId,
  siteInfo,
  brandId,
}: {
  userId?: string;
  siteInfo: BrandType;
  brandId: string;
}) {
  try {
    // Check if userId (user ID) is provided
    if (isNull(userId)) {
      return { status: false, msg: 'User ID is missing', data: {} };
    }

    // Prepare conditions to find existing subscription
    const expireAtDate = convertDateTime();
    const conditions = {
      userId,
      expiresAt: { $gt: expireAtDate },
    };

    const sortOptions = { level: -1 };

    // Fetch existing subscription, if any
    let [sub] = await fetchDataWithConditions('subscriptions', conditions, sortOptions);

    if (isNull(sub)) {
      return { status: false, data: {} };
    }

    let planData: any = {};

    let [planProduct] = await fetchDataWithConditions('products', {
      $or: [{ id: sub.packageId }],
    });

    if (isNull(planProduct)) {
      [planProduct] = await fetchDataWithConditions('products', {
        $and: [{ type: 'package' }, { $or: [{ price: 0 }, { price: '0' }] }],
      });
    }

    planData = planProduct ?? {};

    // Prepare plan details
    const plan = get_plan_data(planData);

    let id = generateSubId({
      userId: userId!,
      brandId,
      planId: planData.id!,
    });
    // Construct subscription object
    const subscriptionInfo: SubscriptionModel = {
      id: id!,
      ...plan,
      packageId: planData.id,
      level: parseInt(planData.level),
      title: planData.title,
      userId: userId!,
    };

    // If no subscription exists, create one with the starter package
    if (isNull(sub)) {
      return { data: {}, status: false };
    } else {
      // Return existing subscription data
      return { data: { ...subscriptionInfo }, status: true };
    }
  } catch (error) {
    console.error(error);
    return { data: {}, status: false };
  }
}

export async function server_create_sub({
  formData,
}: {
  formData: { userId: string; packageId: string; expiresAt: Date; brandId: string };
}) {
  try {
    const { userId, packageId, expiresAt, brandId } = formData;

    if (
      [
        isNull(userId, 'userId'),
        isNull(packageId, 'packageId'),
        isNull(String(expiresAt), 'expiresAt'),
        isNull(brandId, 'brandId'),
      ].includes(true)
    ) {
      return invalid_response('some fields missing at create sub', 200);
    }

    const siteInfo = await getBrandInfo();

    if (isNull(siteInfo)) {
      return invalid_response('no site info found at subscription creation api', 200);
    }

    // const newSub = await generate_sub({ subscriptionInfo, siteInfo });

    // await updateData({
    //   data: { subExpireAt: convertDateTime(data.expiresAt) },
    //   table: 'users',
    //   id: data.userId,
    //   siteInfo,
    // });

    // return api_response({ data: newSub, status: !isNull(newSub) });
  } catch (error) {
    console.error(error);
    return invalid_response('error creating subscription');
  }
}

export async function generateSub({ data, siteInfo }: { data: any; siteInfo: BrandType }) {
  try {
    let missingFields = findMissingFields({
      brand: data.brandId,
      packageId: data?.packageId,
      userId: data.userId,
      expiresAt: String(data.expiresAt),
    });

    // Check for missing fields
    if (missingFields) {
      return {
        status: false,
        msg: `The following fields are missing: ${missingFields} at create subscription`,
      };
    }
    // Fetch the starter package plan
    let planData = [];

    // If a subscription exists, get the associated plan

    [planData] = await fetchDataWithConditions('products', { id: data?.packageId });

    if (isNull(planData)) {
      return { status: false, msg: `no package found for ${data?.packageId}` };
    }

    // Prepare plan details
    const plan = get_plan_data(planData);

    let id = generateSubId({
      userId: data.userId!,
      brandId: data.brandId ?? '',
      planId: planData.id!,
    });

    const availableAdons = getAvailableAddonsStatus(planData?.addons ?? []);
    const availableAdonsStatuses = getAvailableAddonsValues(planData?.addons ?? []);

    // Construct subscription object
    const subscriptionInfo: SubscriptionModel = {
      id: id!,
      addons: { ...availableAdons, ...availableAdonsStatuses },
      packageId: planData.id,
      level: parseInt(planData.level ?? 1),
      title: planData.title,
      userId: data.userId!,
      brandId: data.brandId,
      expiresAt: convertDateTime(data.expiresAt),
      planExpiresAt: data.expiresAt,
    };

    // Check if the insertion was successful
    if (subscriptionInfo) {
      return { status: true, data: subscriptionInfo };
    } else {
      console.error('failed to create subscription');
      return {};
    }
  } catch (error) {
    console.error(error);
    return {};
  }
}
