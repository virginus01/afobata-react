'use client';
import { getCookie } from '@/app/actions';
import { getParents } from '@/app/helpers/getParents';
import { modHeaders } from '@/app/helpers/modHeaders';
import { isNull } from '@/app/helpers/isNull';
import { setClientCookie } from '@/app/helpers/setClientCookie';
import { api_update_views } from '@/app/routes/api_routes';
import indexedDB from '@/app/utils/indexdb';
import { CustomButton } from '@/app/widgets/custom_button';
import { RaisedButton } from '@/app/widgets/raised_button';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export const PostInhouseAds: React.FC<{
  siteInfo: BrandType;
  data: DataType;
  style: 1 | 2 | 3;
}> = ({ siteInfo, data }) => {
  const [brandLink, setBrandLink] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchBrandLink = async () => {
      try {
        // Get parent information
        const { parent } = await getParents({ subBase: siteInfo.slug });
        if (parent?.domain) {
          const link = `https://${parent.domain}/signup`;
          setBrandLink(link);
        }

        // Create a unique identifier for this view
        const indexId = `${siteInfo.id}-${data.id}`;

        // Check all three storage methods
        const existingCookieViews = (await getCookie('views')) || [];
        const viewCookieExists = existingCookieViews.includes(indexId);
        const viewLocalStorageExists = localStorage.getItem(`view-${indexId}`);
        const viewIndexedDBExists = await indexedDB.queryData({
          table: 'views',
          conditions: { id: indexId },
        });

        // If view doesn't exist in any storage, update views
        if (
          isNull(viewCookieExists) &&
          isNull(viewLocalStorageExists) &&
          isNull(viewIndexedDBExists)
        ) {
          // Call API to update views
          const url = await api_update_views({ subBase: siteInfo?.slug! });
          await fetch(url, {
            method: 'POST',
            headers: await modHeaders('post'),
            body: JSON.stringify({
              ...data,
              userId: siteInfo.ownerData?.id,
              brandId: siteInfo.id,
            }),
          });

          // Store the view information in all three storage methods
          const updatedCookieViews = [...existingCookieViews, indexId];
          setClientCookie('views', JSON.stringify(updatedCookieViews));
          localStorage.setItem(`view-${indexId}`, 'true');
          await indexedDB.saveOrUpdateData({
            table: 'views',
            data: { id: indexId, slug: data.slug },
          });
        }
      } catch (error) {
        console.error('Error updating view:', error);
      }
    };

    fetchBrandLink();
  }, [siteInfo.id, data, siteInfo.ownerData?.id, siteInfo.slug]);

  if (siteInfo.inhouseMonetization && siteInfo.inhouseMonetization === 'active') {
    return <></>;
  }

  return (
    <div>
      <div className="flex flex-col space-y-3 border border-red-500 p-2">
        <div className="text-sm">
          Did you know the owner of {siteInfo?.name} earns money just from you viewing this page
          right now? You can do the same — earn from page views too.
        </div>

        <div className="flex justify-center">
          <CustomButton
            onClick={() =>
              window.open(
                `${brandLink}?from=${siteInfo?.id}&ref=${siteInfo?.ownerData?.id}`,
                '_blank',
              )
            }
            className="animate-pulse w-auto"
          >
            Get started and start earning now
          </CustomButton>
        </div>
      </div>
    </div>
  );
};
