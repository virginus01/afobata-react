import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Plus } from 'lucide-react';
import { useBaseContext } from '@/app/contexts/base_context';
import { crud_page } from '@/app/routes/page_routes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import IconButton from '@/app/widgets/icon_button';
import { isNull } from '@/app/helpers/isNull';
import { staticPages } from '@/static_resources';
import { Data } from '@/app/models/Data';

// Type definitions
interface PageModel {
  id?: string;
  slug?: string;
  title?: string;
  description?: string;
  exists?: boolean;
}

const ShimmerCard = () => (
  <Card className="brand-bg-card brand-text-card animate-pulse bg-gray-200 p-4 border border-none">
    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4" />
    <div className="h-6 bg-gray-400 rounded" />
  </Card>
);

const StaticPages = ({
  existingPages = [],
  siteInfo,
  user,
  id,
  iniSearchParams,
}: {
  existingPages: Data[];
  siteInfo: BrandType;
  user: UserTypes;
  id: string;
  iniSearchParams: any;
}) => {
  const { addRouteData } = useBaseContext();
  const [loading, setIsLoading] = useState(false);

  const recommendedPagesData = staticPages
    .map((sPage) => {
      const slug = `${iniSearchParams.type ?? 'user'}-${sPage.slug}`;
      const canonicalSlug = sPage?.canonicalSlug || sPage?.slug;

      let checkExist = null;

      if (!isNull(existingPages)) {
        checkExist = existingPages.find((page) => page.slug === slug);
      }

      const exists = !!checkExist;

      if (sPage.for.includes(user?.brand?.type ?? '') || sPage.for.length === 0) {
        return { ...sPage, ...checkExist, canonicalSlug, slug, exists };
      } else {
        return null;
      }
    })
    .filter(Boolean) as PageModel[]; // Filter out null values

  const othersPagesData: PageModel[] = []; // This was declared but never populated in original code

  const handleEdit = (data: PageModel) => {
    addRouteData({
      isOpen: true,
      action: 'edit',
      base: 'pages',
      type: iniSearchParams.type,
      title: `Build ${data.title ?? ''} Page`,
      rates: {},
      defaultData: data,
      slug: crud_page({
        subBase: siteInfo.slug!,
        base: 'pages',
        action: 'edit',
        type: iniSearchParams.type,
        searchParams: {
          slug: data.slug!,
          id: data.id!,
          type: iniSearchParams.type!,
        },
      }),
      id: data.id!,
      searchParams: {
        slug: data.slug!,
        id: data.id!,
        type: iniSearchParams.type!,
      },
      className: '',
    });
  };

  const handleAdd = (pageData: DataType) => {
    delete pageData.id;
    addRouteData({
      isOpen: true,
      action: 'add',
      base: 'pages',
      type: iniSearchParams.type!,
      title: 'Build Page',
      rates: {},
      defaultData: pageData,
      slug: crud_page({
        subBase: siteInfo.slug!,
        base: 'pages',
        action: 'add',
        type: iniSearchParams.type!,
        searchParams: { slug: pageData?.slug ?? '' },
      }),
      searchParams: { slug: pageData?.slug ?? '', type: iniSearchParams.type! },
      className: '',
    });
  };

  const renderPageCards = (pagesData: PageModel[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {loading
        ? Array(4)
            .fill(0)
            .map((_, index) => <ShimmerCard key={index} />)
        : pagesData.map((pageData, i) => {
            if (isNull(pageData)) return null;
            return (
              <Card key={i} className="relative ease-in border border-none">
                <CardContent className="p-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-xs font-bold">{pageData.title}</div>
                      <p className="text-sm text-gray-500 mb-2">{pageData.slug}</p>
                    </div>
                    {pageData.exists ? (
                      <IconButton
                        variant="outline"
                        size="xs"
                        onClick={() => handleEdit(pageData)}
                        className="flex items-center gap-1"
                        color="auto"
                        icon={<Edit className="w-4 h-4" />}
                      >
                        Edit
                      </IconButton>
                    ) : (
                      <IconButton
                        variant="outline"
                        size="xs"
                        color="danger"
                        filled="danger"
                        onClick={() => handleAdd(pageData)}
                        className="flex items-center gap-1"
                        icon={<Plus className="w-4 h-4" />}
                      >
                        Add
                      </IconButton>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{pageData.description}</p>
                </CardContent>
              </Card>
            );
          })}
    </div>
  );

  return (
    <Tabs defaultValue="recommended" className="w-full space-y-4 p-2 ease-in h-full">
      <TabsList className="flex justify-start gap-2">
        <TabsTrigger value="recommended">Recommended</TabsTrigger>
        <TabsTrigger value="others">Others</TabsTrigger>
      </TabsList>

      <TabsContent value="recommended">{renderPageCards(recommendedPagesData)}</TabsContent>

      <TabsContent value="others">{renderPageCards(othersPagesData)}</TabsContent>
    </Tabs>
  );
};

export default StaticPages;
