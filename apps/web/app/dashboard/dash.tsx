'use client';

import { isNull } from '@/app/helpers/isNull';
import { useUserContext } from '@/app/contexts/user_context';
import CreatorDashboard from '@/app/special_widgets/user_widgets/creator_dashboard';
import ClientView from '@/app/views/client_view';
import { useEffect, useState } from 'react';
import indexedDB from '@/app/utils/indexdb';
import { General } from '@/dashboard/general';

//some

export default function Dash({
  user,
  auth,
  siteInfo,
  defaultProfile,
  defaultData,
}: {
  user: UserTypes;
  auth: AuthModel;
  siteInfo: BrandType;
  defaultProfile: string;
  defaultData: any;
}) {
  const { selectedProfile } = useUserContext();
  const [homeData, setHomeData] = useState({});

  useEffect(() => {
    const getCachedHomeData = async () => {
      if (!['store', 'blog'].includes(user.selectedProfile || '')) return;

      const homeD: any = await indexedDB.queryData({
        table: 'home_data',
        conditions: {},
        tag: siteInfo.id,
      });
      if (!isNull(homeD.data) && !isNull(homeD.rendererData) && !isNull(homeD.pageEssentials)) {
        setHomeData(homeD);
      }
    };
    getCachedHomeData();
  }, []);

  let profile = selectedProfile || defaultProfile || 'user';

  if (siteInfo.type !== 'creator') {
    profile = siteInfo.type || 'user';
  }

  return (
    <div className="border-l-2 pb-48 ">
      <General user={user} siteInfo={siteInfo} auth={auth}>
        <div className="flex flex-col space-y-5">
          {['creator'].includes(user.selectedProfile || '') && (
            <>
              <CreatorDashboard
                user={user}
                siteInfo={siteInfo}
                iniStat={(defaultData?.stat || {}) as any}
              />
            </>
          )}

          {['store', 'blog'].includes(user.selectedProfile || '') && (
            <>
              <ClientView
                params={['home']}
                siteInfo={{ ...siteInfo, type: user?.selectedProfile ?? siteInfo.type }}
                auth={user?.auth ?? {}}
                table={'pages'}
                rates={{}}
                onCallback={() => {}}
              />
            </>
          )}
        </div>
      </General>
    </div>
  );
}
