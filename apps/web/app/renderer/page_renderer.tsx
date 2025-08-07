'use client';
import React, { memo, useMemo } from 'react';
import PageLayout from '@/app/page_layout';
import { combineClasses } from '@/app/helpers/combineClasses';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import ComponentRenderer from '@/app/renderer/component_renderer';

interface PageRendererProps {
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
  rendererData: PageBuilderData;
  data?: PageModel;
  navigation: NavigationState[];
  pageEssentials: any;
  onCallback?: (data: any) => void;
  viewType?: 'view' | 'modal';
  plateForm: string;
  rates: any;
}

interface SectionRendererProps {
  components: ViewRenderData[];
  siteInfo: any;
  user: any;
  auth: any;
  data: any;
  rates: any;
  wrapperClassName?: string;
  filterParentId?: boolean;
  navigation: NavigationState[];
  pageEssentials: any;
  onCallback?: (data: any) => void;
  viewType?: 'view' | 'modal';
}

const SectionRenderer = memo(
  ({
    components = [],
    siteInfo,
    user,
    auth,
    data,
    wrapperClassName = '',
    filterParentId = true,
    navigation = [],
    pageEssentials,
    onCallback,
    viewType,
    rates,
  }: SectionRendererProps) => {
    const filteredComponents = useMemo(() => {
      return filterParentId ? components.filter((s) => !s.parentId) : components;
    }, [filterParentId, components]);

    return filteredComponents.map((component) => {
      const rows = filterParentId ? components.filter((s) => s.parentId === component.id) : [];

      if (!components?.length) {
        return <div key={'none'}></div>;
      }

      const sectionClasses = combineClasses(
        components.find((s) => !s.parentId)?.sectionClasses || {},
      );

      return (
        <section
          key={component.id}
          className={`${wrapperClassName} ${
            rows.length > 0 && 'flex flex-col sm:flex-row'
          } ${sectionClasses}`}
        >
          <ComponentRenderer
            key={`component-${component.id}`}
            component={component as any}
            componentKey={component.key as keyof ComponentMap}
            siteInfo={siteInfo}
            data={data}
            user={user}
            auth={auth}
            rates={rates}
            classes={component.classes}
            pageEssentials={pageEssentials}
            onCallback={onCallback}
            viewType={viewType}
          />

          {rows.map((row, i) => (
            <ComponentRenderer
              key={`row-${i}`}
              data={data}
              component={row as any}
              componentKey={row.key as keyof ComponentMap}
              siteInfo={siteInfo}
              user={user}
              auth={auth}
              rates={rates}
              classes={row.classes}
              navigation={navigation ?? []}
              pageEssentials={pageEssentials}
              onCallback={onCallback}
              viewType={viewType}
            />
          ))}
        </section>
      );
    });
  },
);

const PageRenderer = memo(
  ({
    siteInfo,
    user,
    auth,
    rendererData = {} as PageBuilderData,
    navigation,
    data,
    pageEssentials,
    onCallback,
    viewType,
    plateForm,
    rates,
  }: PageRendererProps) => {
    const grouped = useMemo(() => {
      function groupComponentsBySection(pageData: any) {
        if (!pageData?.layout || !Array.isArray(pageData?.sections)) return {};
        return pageData.sections.reduce((grouped: any, component: any) => {
          (grouped[component.section] ||= []).push(component);
          return grouped;
        }, {});
      }
      return groupComponentsBySection(rendererData);
    }, [rendererData]);

    const wrapperClass = '';

    const bgImage = getImgUrl({
      id: data?.bg_image?.id || '',
      height: 500,
      width: 500,
      ext: 'webp',
    });

    return (
      <div
        key="view_renderer"
        style={
          bgImage
            ? {
                backgroundImage: `url(${bgImage})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
              }
            : undefined
        }
        className="dark:bg-none flex w-screen h-screen"
      >
        <PageLayout
          showFooter={plateForm === 'web'}
          showHeader={plateForm === 'web'}
          siteInfo={siteInfo}
          className=""
          viewType={viewType}
          auth={auth}
          rates={rates}
          headerContent={
            !['app', 'pwa'].includes(plateForm) &&
            grouped.header &&
            rendererData.layout.hasHeader && (
              <SectionRenderer
                components={grouped.header}
                siteInfo={siteInfo}
                user={user}
                auth={auth}
                data={data}
                rates={rates}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
          beforeContent={
            grouped.before &&
            rendererData.layout.hasBefore && (
              <SectionRenderer
                components={grouped.before}
                siteInfo={siteInfo}
                data={data}
                user={user}
                auth={auth}
                rates={rates}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
          leftSidebarContent={
            grouped.left &&
            rendererData.layout.leftSidebar && (
              <SectionRenderer
                components={grouped.left}
                siteInfo={siteInfo}
                user={user}
                data={data}
                rates={rates}
                auth={auth}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
          mainContent={
            grouped.main && (
              <SectionRenderer
                components={grouped.main}
                siteInfo={siteInfo}
                user={user}
                data={data}
                auth={auth}
                rates={rates}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
          rightSidebarContent={
            grouped.right &&
            rendererData.layout.rightSidebar && (
              <SectionRenderer
                components={grouped.right}
                siteInfo={siteInfo}
                user={user}
                data={data}
                auth={auth}
                rates={rates}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
          afterContent={
            grouped.after &&
            rendererData.layout.hasAfter && (
              <SectionRenderer
                components={grouped.after}
                siteInfo={siteInfo}
                user={user}
                data={data}
                auth={auth}
                rates={rates}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
          footerContent={
            !['app', 'pwa'].includes(plateForm) &&
            grouped.footer &&
            rendererData.layout.hasFooter && (
              <SectionRenderer
                components={grouped.footer}
                siteInfo={siteInfo}
                user={user}
                data={data}
                rates={rates}
                auth={auth}
                wrapperClassName={wrapperClass}
                navigation={navigation}
                pageEssentials={pageEssentials}
                onCallback={onCallback}
                viewType={(plateForm || viewType) as any}
              />
            )
          }
        />
      </div>
    );
  },
);

export default memo(PageRenderer);
