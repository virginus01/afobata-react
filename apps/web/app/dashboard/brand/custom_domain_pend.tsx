'use client';
import { isNull } from '@/app/helpers/isNull';

import { modHeaders } from '@/app/helpers/modHeaders';
import { show_error } from '@/app/helpers/show_error';

import CustomDrawer from '@/app/src/custom_drawer';
import { SectionHeader } from '@/app/src/section_header';
import { CustomButton } from '@/app/widgets/custom_button';
import React, { useEffect, useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

import { toast } from 'sonner';
import { api_refresh_domain_status, api_brand_domain_connection } from '@/app/src/constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ExternalLink, Edit, RotateCw, Check, X, Globe } from 'lucide-react';
import { CustomBadge } from '@/app/widgets/badge';
import { clearCache } from '@/app/actions';
import { useRouter } from 'next/navigation';
import FormInput from '@/app/widgets/hook_form_input';
import { getPath, getSubDomain } from '@/app/api/domains/helper';

export function CustomDomainPend({ user, siteInfo }: { user: UserTypes; siteInfo: BrandType }) {
  const userBrand = user.brand;
  const [preferred, setPreferred] = useState(userBrand?.preferred);
  const domain = userBrand?.domain;
  const subDomain = userBrand?.subDomain
    ? getSubDomain({ siteInfo, subDomain: userBrand?.subDomain })
    : '';
  const path = userBrand?.slug ? getPath({ siteInfo, path: userBrand?.slug }) : '';

  return (
    <div className="flex flex-col flex-grow-0 m-2">
      <SectionHeader title={'Custom Domain Management'} bg="bg-gray-200" rounded="rounded-md">
        <div className="mx-0 mb-20 flex flex-col justify-between space-y-3">
          <CustomDomainCard
            title="path"
            siteInfo={siteInfo!}
            user={user!}
            domain={path}
            type="path"
            isConnected={true}
            isActive={true}
            preferred={preferred || 'path'}
            setPreferred={setPreferred}
          />
          <CustomDomainCard
            title="sub domain"
            siteInfo={siteInfo!}
            user={user!}
            domain={subDomain}
            type="sub_domain"
            isConnected={subDomain ? true : false}
            isActive={subDomain ? true : false}
            preferred={preferred || 'path'}
            setPreferred={setPreferred}
          />
          <CustomDomainCard
            title="custom domain"
            domain={
              userBrand?.pendingDomain || userBrand?.domainInfo?.domain || userBrand?.domain || ''
            }
            siteInfo={siteInfo!}
            user={user!}
            type="custom_domain"
            isConnected={userBrand?.domainInfo?.isConnected!}
            isActive={userBrand?.domainInfo?.isActive!}
            preferred={preferred || 'path'}
            setPreferred={setPreferred}
          />
        </div>
      </SectionHeader>
    </div>
  );
}

export function CustomDomainCard({
  user,
  siteInfo,
  type,
  title,
  domain = 'none',
  isConnected,
  isActive,
  preferred,
  setPreferred,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  domain: string;
  type: string;
  title: string;
  isConnected: boolean;
  isActive: boolean;
  preferred: string;
  setPreferred: (text: string) => void;
}) {
  const userBrand = user.brand;

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [mType, setMtype] = useState('sub_domain');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubmitting(true);
    }, 6000000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const refreshVerification = async () => {
      try {
        const url = await api_refresh_domain_status({
          subBase: siteInfo.slug!,
        });

        const response = await (
          await fetch(url, {
            method: 'GET',
            headers: await modHeaders(),
          })
        ).json();

        const { data, status } = response;
        if (status) {
          setSubmitting(false);
        }
      } catch (error: any) {
        show_error('error refreshing', error.toString());
      } finally {
        setSubmitting(false);
      }
    };

    refreshVerification();
  }, [submitting, submitted, domain, user.id, siteInfo.slug, user.brand?.id]);

  const StatusIndicator = ({ status, label }: { status: boolean; label: string }) => (
    <div className="flex items-center gap-2">
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div
              className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center',
                status ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600',
              )}
            >
              {status ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {label} is currently {status ? 'active' : 'inactive'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
  return (
    <>
      <Card className="brand-bg-card brand-text-card bg-card/50 hover:bg-card/80 transition-colors border border-none">
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-2">
                  {domain ? (
                    <Link
                      href={`${
                        process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
                      }${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium hover:underline inline-flex items-center"
                    >
                      {domain}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  ) : (
                    <span className=" text-muted-foreground text-xs sm:text-sm">
                      Not configured
                    </span>
                  )}
                  <CustomBadge
                    variant="secondary"
                    className="font-normal text-xs"
                    text={title}
                    size="xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSubmitting(true);
                  }}
                  disabled={submitting}
                  className="h-8 text-xs"
                >
                  <RotateCw className={cn('h-3 w-3 mr-1', submitting && 'animate-spin')} />
                  {submitting ? '' : ''}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setMtype(type);
                    setIsPanelOpen(true);
                  }}
                  className="h-8"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Status Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <StatusIndicator status={isConnected} label="Connected" />
                <StatusIndicator status={isActive} label="Active" />
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium cursor-pointer" htmlFor="preferred">
                  Preferred
                </label>
                <Switch
                  id="preferred"
                  checked={type === preferred}
                  onCheckedChange={() => setPreferred(type)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <CustomDrawer
        direction="right"
        isWidthFull={false}
        isHeightFull={true}
        showHeader={true}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false);
        }}
        header="Domain Management"
      >
        <DoaminForm
          user={user}
          siteInfo={siteInfo}
          type={mType}
          title=""
          setIsPanelOpen={setIsPanelOpen}
        />
      </CustomDrawer>
    </>
  );
}

export function DoaminForm({
  user,
  siteInfo,
  type,
  title,
  setIsPanelOpen,
}: {
  user: UserTypes;
  siteInfo: BrandType;
  type: string;
  title: string;
  setIsPanelOpen: (isOpen: boolean) => void;
}) {
  const userBrand = user.brand;
  const [domain, setDomain] = useState(
    userBrand?.pendingDomain || userBrand?.domainInfo?.domain || userBrand?.domain,
  );
  const [subDomain, setSubDomain] = useState(userBrand?.subDomain);
  const [subDomainShow, setSubDomainShow] = useState('');
  const [path, setPath] = useState(userBrand?.slug);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const get_sub_domain = async () => {
      if (isNull(subDomain)) return;
      const subD = getSubDomain({ siteInfo, subDomain: subDomain ?? '' });
      setSubDomainShow(subD);
    };
    get_sub_domain();
  }, [subDomain, siteInfo]);

  async function handleSubmit() {
    if (!user || !userBrand || !siteInfo) {
      return toast.error('Required user, brand, or site information is missing.');
    }

    const formData = {
      domain: type === 'custom_domain' ? domain : '',
      subDomain: type === 'sub_domain' ? subDomain : '',
      path: type === 'path' ? path : '',
      type,
      userId: user.id,
      brandId: userBrand.id,
    };

    // Validation logic
    switch (type) {
      case 'path':
        if (!path) {
          toast.error('No path entered.');
          return;
        }
        break;
      case 'sub_domain':
        if (!subDomain) {
          toast.error('No subdomain entered.');
          return;
        }
        break;
      case 'custom_domain':
        if (!domain) {
          toast.error('No domain entered.');
          return;
        }
        break;
      default:
        toast.error('Invalid type selected.');
        return;
    }

    try {
      setSubmitting(true);

      const url = await api_brand_domain_connection({
        subBase: siteInfo.slug!,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status) {
        toast.success('Domain updated successfully.');
        clearCache('user');
        clearCache('users');
        router.refresh();
        if (['path', 'sub_domain'].includes(type)) {
          setIsPanelOpen(false);
        }
      } else {
        toast.error(data.msg);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred.';
      show_error('Error updating data', errorMessage);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg-gray-50 p-6 rounded-lg shadow-md mx-2 my-5">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Enter your{' '}
            {type === 'custom_domain'
              ? 'Custom Domain'
              : type === 'sub_domain'
                ? 'Sub Domain'
                : 'Path'}
          </label>
          <div className="relative">
            <>
              <FormInput
                name="t"
                value={type === 'custom_domain' ? domain : type === 'sub_domain' ? subDomain : path}
                id={'domain'}
                onChange={(e) => {
                  if (type === 'custom_domain') {
                    setDomain(e.target.value);
                  } else if (type === 'sub_domain') {
                    setSubDomain(e.target.value);
                  } else {
                    setPath(e.target.value);
                  }
                }}
              />
            </>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {type === 'custom_domain' ? (
              <>
                {domain && (
                  <>
                    People will be able to visit your site via:{' '}
                    <span className="font-semibold text-gray-800 dark:text-white">{domain}</span>
                  </>
                )}
              </>
            ) : type === 'sub_domain' ? (
              <>
                {' '}
                {subDomain && (
                  <>
                    People will be able to visit your site via:{' '}
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {subDomainShow}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                {path && (
                  <>
                    People will be able to visit your site via:{' '}
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {siteInfo.domain}/{path}
                    </span>
                  </>
                )}
              </>
            )}
          </p>
        </div>

        {type === 'custom_domain' && (
          <>
            <DomainSetupWidget brand={userBrand!} />
          </>
        )}
        <div className="flex justify-end pt-8 w-auto">
          <CustomButton
            onClick={handleSubmit}
            submitting={submitting}
            submitted={submitted}
            submittingText="Submitting..."
            iconPosition="after"
            icon={<FaPaperPlane />}
          >
            submit
          </CustomButton>
        </div>
      </div>
    </>
  );
}

const DomainSetupWidget: React.FC<{ brand: BrandType }> = ({ brand }) => {
  if (brand.domainInfo?.isConnected) {
    return;
  }

  const ns = brand.domainInfo?.nameServers || [];
  return (
    <div className="p-4 border rounded-lg shadow-md bg-gray-300 max-w-md my-5 pb-20">
      <h2 className="text-lg font-semibold mb-3">Domain Setup Configuration</h2>

      <i className="text-sm">
        Please go to your domain registerar and fill in the data to verify you&apos;re the rightfull
        owner of the domain
      </i>

      <div>
        {!isNull(ns) && (
          <div className="bg-gray-100 p-3 rounded-md text-sm my-5">
            <div className="text-sm text-gray-600 flex flex-col space-y-4">
              <p>NS1: {ns[0]}</p>
              <p>NS2: {ns[1]}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
