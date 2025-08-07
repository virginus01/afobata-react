'use client';

import React, { useMemo, memo, Suspense } from 'react';
import { getComponent } from '@/app/renderer/components_map';
import { clvalue } from '@/app/helpers/clvalue';
import { combineClasses } from '@/app/helpers/combineClasses';

// Loading fallback component
const ComponentSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`${className} animate-pulse`}>
    <div className="bg-gray-200 rounded-md h-32 w-full"></div>
    <div className="space-y-2 mt-4">
      <div className="bg-gray-200 rounded h-4 w-3/4"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  </div>
);

const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  componentKey,
  siteInfo,
  user,
  auth,
  navigation = [],
  classes,
  component,
  data,
  pageEssentials,
  onCallback,
  viewType,
  rates,
}) => {
  const allClasses = combineClasses(classes);

  const extractedPreference: any = useMemo(() => {
    return clvalue({ items: component.preferences ?? [], brand: siteInfo, data });
  }, [component.preferences, siteInfo, data]);

  // Handle custom components
  if (component.type === 'custom_component') {
    return (
      <Suspense fallback={<ComponentSkeleton className={allClasses ?? 'w-full'} />}>
        <section className={allClasses ?? 'w-full'} key={component.id}>
          <div dangerouslySetInnerHTML={{ __html: component.data || '' }}></div>
        </section>
      </Suspense>
    );
  }

  // Get the dynamic component
  const DynamicComponent = getComponent(componentKey as keyof ComponentMap);

  if (!DynamicComponent) {
    console.warn(`Component not found: ${componentKey}`);
    return (
      <div className={`${allClasses} p-4 text-red-500 border border-red-300 rounded`}>
        {`Component ${componentKey} not found`}
      </div>
    );
  }

  const bgImage = extractedPreference.bg_image ?? '';

  return (
    <Suspense fallback={<ComponentSkeleton className={allClasses} />}>
      <div
        className={`${allClasses}`}
        key={component.id}
        style={
          bgImage
            ? {
                backgroundImage: `url(${bgImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        <DynamicComponent
          siteInfo={siteInfo}
          user={user}
          data={data}
          auth={auth}
          rates={rates}
          navigation={navigation}
          config={{}}
          defaultData={[]}
          className=""
          component={component}
          preference={extractedPreference}
          type=""
          pageEssentials={pageEssentials}
          onDone={onCallback}
          viewType={viewType}
        />
      </div>
    </Suspense>
  );
};

export default memo(ComponentRenderer);
