import React, { memo, useState } from 'react';
import FormInput from '@/app/widgets/hook_form_input';
import { api_brand_setup, api_crud, centralDomain } from '@/src/constants';
import { Brand } from '@/app/models/Brand';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomDrawer from '@/src/custom_drawer';
import BrandTypeSelection from '@/app/widgets/brand_switch';
import { useUserContext } from '@/app/contexts/user_context';
import slugify from 'slugify';
import { isNull } from '@/helpers/isNull';
import { toast } from 'sonner';
import { modHeaders } from '@/helpers/modHeaders';
import { getDId } from '@/helpers/getDId';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { lowercase } from '@/helpers/lowercase';

interface BrandSetupProps {
  siteInfo: Brand;
  user: UserTypes;
  userBrand: any;
  navigation: any;
}

const BrandSetup: React.FC<BrandSetupProps> = () => {
  const [isBrandTypeSelectorOpen, setIsBrandTypeSelectorOpen] = useState(false);
  const [brandData, setBrandData] = useState<{
    name: string;
    slug: string;
    type: string;
    category?: string;
  }>({} as any);
  const [type, setType] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refreshPage } = useDynamicContext();
  const { updateEssentialData, essentialData } = useUserContext();
  const router = useRouter();

  let siteInfo = essentialData?.siteInfo ?? {};
  let navigation = essentialData?.nav ?? {};
  let user = essentialData?.user ?? {};

  const filteredProfiles = navigation?.allNavs?.filter(
    (profile: any) => profile.availableToBrands === true,
  );

  const handleSubmit = async () => {
    if (isNull(brandData.name)) {
      toast.error('Business Name is required');
      return;
    }

    if (isNull(brandData.slug)) {
      toast.error('Url is required');
      return;
    }

    if (isNull(brandData.type)) {
      toast.error('Business Type is required');
      return;
    }

    setIsSubmitting(true);

    const userId = user?.id;

    if (!userId) {
      toast.error('User ID not found');
      return;
    }

    const hash = getDId({ userId, brandId: siteInfo.id! });

    const body = {
      userId,
      name: brandData.name,
      id: userId,
      hash,
      email: user.email,
      slug: brandData.slug,
      domain: lowercase(`${brandData.slug}.${siteInfo.addonForSubDomains ?? centralDomain}`),
      icon: siteInfo.icon,
      logo: siteInfo.logo,
      uid: user?.auth?.id,
      brandId: siteInfo.id,
      profiles: ['custom'],
      type: brandData.type,
    };

    const url = await api_brand_setup({
      subBase: siteInfo?.slug ?? '',
    });

    const res = await fetch(url, {
      method: 'PUT',
      headers: await modHeaders('put'),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(res.statusText);
      toast.error('error occured');
      return;
    }

    const { data, status, msg } = await res.json();

    if (status) {
      refreshPage(['users', 'user', 'brand', 'brands'], true);
      updateEssentialData({
        ...essentialData,
        brand: { ...essentialData?.brand, ...data },
      });
      toast.success('Brand Successfully created');
    } else {
      toast.error(msg);
      router.refresh();
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center px-2 py-5">
        <div className="w-full max-w-xl space-y-6">
          <div className="text-1xl font-bold">{`You're almost done!`}</div>
          <p className="text-gray-600">Tell us a little bit about your business.</p>

          <div>
            <FormInput
              label="Business Name"
              animate={true}
              controlled={false}
              type="text"
              placeholder="Enter business domain"
              name={'name'}
              defaultValue={`${user.lastName}'s platform`}
              onChange={(e) => {
                const slug = slugify(e.target.value, {
                  lower: true,
                  strict: true,
                  trim: true,
                });
                setBrandData({ ...brandData, slug } as any);
              }}
              onBlur={(e) => {
                setBrandData({ ...brandData, name: e.target.value } as any);
              }}
            />
          </div>

          <div>
            <FormInput
              label="Url eg: chiomy-store"
              animate={true}
              controlled={false}
              type="text"
              placeholder="Enter business domain"
              name={'slug'}
              value={brandData.slug}
              after={siteInfo.addonForSubDomains ?? centralDomain}
              onBlur={(e) => {
                const slug = slugify(e.target.value, {
                  lower: true,
                  strict: true,
                  trim: true,
                });
                setBrandData({ ...brandData, slug } as any);
              }}
            />

            <p className="text-xs text-gray-500 mt-1">
              You can upgrade your domain to <code className="font-mono">.com</code> or
              <code className="font-mono">.com.ng</code> or any domain of your choice later.
            </p>
          </div>

          <div className="hover:cursor-pointer" onClick={() => setIsBrandTypeSelectorOpen(true)}>
            <div className="w-full border border-gray-300 rounded-sm flex justify-between">
              <div className="py-2 px-2 ">{type?.name ?? 'none'}</div>
              <div className="bltext-xs text-gray-800 bg-gray-300 py-2 px-6">change</div>
            </div>
          </div>

          {type.brandShortDesc && (
            <p className="text-xs text-gray-500 mt-1">{type.brandShortDesc}</p>
          )}

          <CustomButton
            submittingText="Setting up your business"
            submitting={isSubmitting}
            className="py-3 w-full"
            onClick={handleSubmit}
          >
            Continue
          </CustomButton>
        </div>
      </div>
      <CustomDrawer
        direction="right"
        isWidthFull={true}
        isHeightFull={true}
        showHeader={true}
        isOpen={isBrandTypeSelectorOpen}
        onClose={() => setIsBrandTypeSelectorOpen(false)}
        header="Switch Business Type"
      >
        <BrandTypeSelection
          siteInfo={siteInfo as any}
          user={user as any}
          upload={false}
          title="What type of business do you want to set up?"
          subtitle="Select the type of business you want to run. The platform features will be tailored to your selection. Below are the business types most people successfully profit from"
          profiles={filteredProfiles}
          selectedProfile={brandData?.type ?? ''}
          onSelectProfile={(newType) => {
            setBrandData({ ...brandData, type: newType.id ?? '' } as any);
            setType(newType);
            setIsBrandTypeSelectorOpen(false);
          }}
          onSubmit={() => {
            setIsBrandTypeSelectorOpen(false);
          }}
          submitting={false}
          submitted={false}
        />
      </CustomDrawer>
    </>
  );
};

export default memo(BrandSetup);
