'use client';

import { useBaseContext } from '@/app/contexts/base_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import { baseUrl } from '@/app/helpers/baseUrl';
import { capitalize } from '@/app/helpers/capitalize';
import { checkAddon } from '@/app/helpers/checkAddon';

import { api_crud, revenue_page, route_user_page } from '@/app/src/constants';
import CustomDrawer from '@/app/src/custom_drawer';
import { SectionHeader } from '@/app/src/section_header';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import { RaisedButton } from '@/app/widgets/raised_button';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';

// Types
interface MonetizeProps {
  siteInfo: BrandType;
  user: UserTypes;
}

interface AdSection {
  sectionName: string;
  enabled: boolean;
  adCode?: string;
}

interface MonetizationSettings {
  adsFrequency?: number;
  adSections?: AdSection[];
}

interface BrandMonetizationData {
  id: string | number;
  inhouseMonetization: string;
  googleMonetization: string;
  inHouse?: MonetizationSettings;
  adsense?: MonetizationSettings;
}

export default function Monetize({ siteInfo, user }: MonetizeProps) {
  const router = useRouter();
  const { addRouteData } = useBaseContext();

  const [panelConfig, setPanelConfig] = useState({
    isOpen: false,
    type: '', // "inhouse", "google"
  });

  const [monetizationState, setMonetizationState] = useState({
    inhouse: user?.brand?.inhouseMonetization || 'inactive',
    google: user?.brand?.googleMonetization || 'inactive',
  });

  const [monetizationSettings, setMonetizationSettings] = useState({
    inhouse: user?.brand?.inHouse || { adsFrequency: 2 },
    adsense: user?.brand?.adsense || {
      adSections: user?.brand?.adsense?.adSections || [],
    },
  });

  const canMonetize = checkAddon({
    data: user?.subscription,
    addon: 'can_monetize',
  }).available;

  const openPanel = (type: string) => setPanelConfig({ isOpen: true, type });
  const closePanel = () => setPanelConfig({ isOpen: false, type: '' });

  const toggleMonetization = (type: string) => {
    if (!siteInfo.allowMonetization) {
      toast.error('Monetization is not allowed');
      return;
    }
    if (!canMonetize) {
      toast.error(`${user?.subscription?.title} can't monetize please upgrade`);
      addRouteData({
        isOpen: true,
        id: 'subscription',
        href: route_user_page({
          subBase: siteInfo?.slug!,
          action: 'index',
          base: 'index',
        }),
        type: 'user',
        position: 1,
        action: 'index',
        base: 'subscription',
        title: 'Subscription',
        searchParams: { type: 'user' },
        isHeightFull: 'yes',
        isWidthFull: 'yes',
      });
      return;
    }
    openPanel(type);
  };

  const saveChanges = async () => {
    try {
      let brandMod: BrandMonetizationData = {
        id: user?.brand?.id as any,
        inhouseMonetization: monetizationState.inhouse,
        googleMonetization: monetizationState.google,
        inHouse: monetizationSettings.inhouse,
        adsense: monetizationSettings.adsense,
      };

      if (panelConfig.type === 'inhouse') {
        const newStatus = monetizationState.inhouse === 'active' ? 'inactive' : 'active';
        brandMod.inhouseMonetization = newStatus;
        setMonetizationState((prev) => ({ ...prev, inhouse: newStatus }));
      } else if (panelConfig.type === 'google') {
        const newStatus = monetizationState.google === 'active' ? 'inactive' : 'active';
        brandMod.googleMonetization = newStatus;
        setMonetizationState((prev) => ({ ...prev, google: newStatus }));
      }

      const url = await api_crud({
        subBase: siteInfo.slug,
        table: 'brands',
        action: 'crud_patch',
        id: user.brand?.id!,
        method: 'patch',
      });

      const finalUrl = await baseUrl(url);
      const response = await fetch(finalUrl, {
        method: 'PATCH',
        headers: await modHeaders('patch'),
        body: JSON.stringify({ data: brandMod, table: 'brands', id: user.brand?.id! }),
      });

      const { status, msg } = await response.json();

      if (status) {
        toast.success('Settings saved successfully');
        closePanel();
      } else {
        toast.error(msg || 'Failed to save settings');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred. Please try again or contact support.');
    }
  };

  return (
    <div className="w-full">
      <SectionHeader title="Monetize">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full p-4">
          <MonetizationCard
            title={`${capitalize(siteInfo?.name || '')} Monetization`}
            description={`Make money from ${siteInfo.name} as people read your blog posts or view your products.`}
            isActive={monetizationState.inhouse === 'active'}
            onToggle={() => toggleMonetization('inhouse')}
            onSetup={() => {
              addRouteData({
                isOpen: true,
                id: 'static',
                type: 'user',
                position: 1,
                action: 'static',
                base: 'pages',
                title: 'Default Static Pages',
                searchParams: { type: 'user' },
              });
            }}
            onDashboard={() => {
              addRouteData({
                isOpen: true,
                slug: `${revenue_page({
                  subBase: siteInfo.slug!,
                  action: 'withdraw',
                  type: 'blog',
                })}`,
                action: 'withdraw',
                type: 'blog',
                base: 'revenue',
                position: 1,
              });
            }}
            features={[
              'You will earn mille each time your content receives views',
              'Only unique views are counted for fair earnings',
              'Convert views to cash at current rates',
              'Get paid for every 1,000 views across all content',
              'CPM rates adjust based on market conditions',
              'Final payment determined when you convert mille',
            ]}
          />

          <MonetizationCard
            title="Google Adsense Monetization"
            description="Make money from Google as people read your blog posts from your custom domain."
            isActive={monetizationState.google === 'active'}
            onToggle={() => toggleMonetization('google')}
            onSetup={() => {
              addRouteData({
                isOpen: true,
                id: 'static',
                type: 'user',
                position: 1,
                action: 'static',
                base: 'pages',
                title: 'Default Static Pages',
                searchParams: { type: 'user' },
              });
            }}
            onDashboard={() => {
              window.open('https://www.google.com/adsense', '_blank');
            }}
            features={[
              'Display ads on your blog posts and earn revenue',
              'Ensure compliance with Google Adsense policies',
              'Monitor earnings through the Adsense dashboard',
              'Optimize ad placements for maximum revenue',
              'Receive payments once you reach the threshold',
            ]}
          />
        </div>
      </SectionHeader>

      <CustomDrawer
        direction="right"
        isWidthFull={false}
        isHeightFull={true}
        showHeader={true}
        isOpen={panelConfig.isOpen}
        onClose={closePanel}
        header="MONETIZATION SETTINGS"
      >
        {panelConfig.type === 'inhouse' && (
          <ToggleConfirmPanel
            title={`${capitalize(siteInfo?.name || '')} Monetization`}
            description={`${
              monetizationState.inhouse === 'active' ? 'Disable' : 'Enable'
            } in-house monetization for your site.`}
            onConfirm={saveChanges}
            onCancel={closePanel}
          />
        )}

        {panelConfig.type === 'google' && (
          <ToggleConfirmPanel
            title="Google Adsense Monetization"
            description={`${
              monetizationState.google === 'active' ? 'Disable' : 'Enable'
            } Google Adsense monetization for your site.`}
            onConfirm={saveChanges}
            onCancel={closePanel}
          />
        )}
      </CustomDrawer>
    </div>
  );
}

// MonetizationCard remains unchanged
function MonetizationCard({
  title,
  description,
  isActive,
  onToggle,
  onSetup,
  onDashboard,
  features,
}: {
  title: string;
  description: string;
  isActive: boolean;
  onToggle: () => void;
  onSetup: () => void;
  onDashboard: () => void;
  features: string[];
}) {
  return (
    <CustomCard
      className="flex flex-col h-full"
      childrenClass="flex flex-col flex-1 p-4"
      title={title}
      topRightWidget={
        <ToggleSwitch
          className="text-xs"
          name={`toggle-${title.toLowerCase().replace(/\s+/g, '-')}`}
          label=""
          onChange={onToggle}
          checked={isActive}
        />
      }
      bottomWidget={
        <div className="flex flex-row gap-4 w-full">
          <CustomButton onClick={onSetup}>Setup</CustomButton>
          <CustomButton onClick={onDashboard}>Dashboard</CustomButton>
        </div>
      }
    >
      <div className="flex flex-col text-xs flex-1">
        <div className="text-xs font-bold mb-2">{description}</div>
        <ul className="mt-2 space-y-2 list-disc list-inside text-xs marker:text-red-500">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>
    </CustomCard>
  );
}

// ToggleConfirmPanel remains unchanged
function ToggleConfirmPanel({
  title,
  description,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <p className="mb-6">{description}</p>
      <div className="flex justify-end gap-4">
        <CustomButton onClick={onCancel}>Cancel</CustomButton>
        <RaisedButton onClick={onConfirm}>Confirm</RaisedButton>
      </div>
    </div>
  );
}
