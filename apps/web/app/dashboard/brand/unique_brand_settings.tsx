import { extractServiceData } from '@/app/helpers/extractServiceData';

const UnigueBrandSettings = ({
  brandKey,
  user,
  siteInfo,
  pages = [],
  handleUniqueBrandSettings,
  data,
}: {
  brandKey: string;
  user: UserTypes;
  siteInfo: BrandType;
  pages: PageModel[];
  data: BrandType;
  handleUniqueBrandSettings: (key: string, name: string, value: any) => void;
}) => {
  let serviceSettings: any = data.serviceSettings || [];
  let serviceData: any = extractServiceData(serviceSettings, brandKey);
  let homePageId = serviceData.homepage;

  let items: DropdownItem[] = [];

  pages.map((page: PageModel) => {
    items.push({
      id: page.id,
      value: page.id!,
      label: page.title!,
    });
  });

  return <></>;
};

export default UnigueBrandSettings;
