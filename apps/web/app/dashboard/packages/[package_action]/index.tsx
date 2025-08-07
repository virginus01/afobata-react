'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api_create_and_update_plan, api_get_packages, package_page } from '@/app/src/constants';
import { DeleteButton, RaisedButton } from '@/app/widgets/widgets';
import { isNull } from '@/app/helpers/isNull';
import LoadingScreen from '@/app/src/loading_screen';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEdit, FaEye, FaList } from 'react-icons/fa';
import { SectionHeader } from '@/app/src/section_header';
import { PRIMARY_COLOR } from '@/app/src/constants';
import { useUserContext } from '@/app/contexts/user_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import LoadingBar from '@/app/widgets/loading';
import { useBaseContext } from '@/app/contexts/base_context';
import { AddonOverview } from '@/dashboard/packages/[package_action]/package_overview';
import PackageForm from '@/dashboard/packages/[package_action]/package_form';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

export default function PackageActionIndex({
  initialColumns,
  params,
}: {
  initialColumns: string[];
  params: any;
}) {
  const searchParams = useSearchParams();
  const id = searchParams.get('id') || '';

  const router = useRouter();
  const [item, setItem] = useState<ProductTypes | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useUserContext();
  const [initialRows, setInitialRows] = useState<any[][]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [action, setAction] = useState(params.package_action);
  const { userId, setUserId } = useUserContext();
  const [actionTitle, setActionTitle] = useState('Dashboard');
  const { isUserLoaded } = useUserContext();
  const [columns, setColumns] = useState<string[]>(initialColumns || []);
  const { siteInfo } = useGlobalEssential();

  useEffect(() => {
    if (action === 'overview') {
      setActionTitle('Package');
    } else if (action === 'add') {
      setActionTitle('Add Package');
    } else if (action === 'edit') {
      setActionTitle('Edit Package');
    }
  }, [action]);

  useEffect(() => {
    async function getPackages() {
      try {
        const url = await api_get_packages({
          userId,
          subBase: siteInfo.slug ?? '',
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const res = await response.json();

        if (res.status) {
          setInitialRows([]);
          setColumns([]);
          const newRows = res.data.map((item: any) => [item.title, item.slug, item]);

          setColumns((prev) => [...prev, 'title']);
          setColumns((prev) => [...prev, 'slug']);
          setColumns((prev) => [...prev, 'action']);

          setInitialRows(newRows);
        } else {
          setInitialRows([]);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    }

    if (action === 'overview' && user && isUserLoaded) {
      getPackages();
    }
  }, [user, action, isSidebarOpen, isUserLoaded, userId, siteInfo.slug]);

  useEffect(() => {
    async function getItem() {
      try {
        const url = await api_get_packages({
          id,
          subBase: siteInfo.slug ?? '',
          userId: user?.id!,
        });
        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const res = await response.json();

        if (!isNull(res.data)) {
          setItem(res.data);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    }
    if (action === 'edit' && isUserLoaded) {
      getItem();
    }
  }, [id, action, isUserLoaded, user, siteInfo.slug]);

  useEffect(() => {
    if ((action === 'edit' && (!user || !item)) || (action === 'overview' && !user)) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [user, item, action, initialRows]);

  const RightButton: React.FC = () => (
    <RaisedButton
      size="auto"
      color="auto"
      icon={<FaList />}
      iconPosition="before"
      onClick={() =>
        router.push(
          `${package_page({
            action: 'overview',
            subBase: siteInfo.slug!,
          })}`,
        )
      }
    >
      {actionTitle}s
    </RaisedButton>
  );

  if (loading) {
    return <LoadingScreen />;
  } else if (action === 'edit') {
    return (
      <div className="m-1">
        <SectionHeader
          title={`Edit ${actionTitle}`}
          className={`mt-2 border-b-4 border-${PRIMARY_COLOR}`}
          rightWidget={<RightButton />}
        >
          <div className="">
            <AddAndEditAddon data={item!} action={action!} actionTitle={actionTitle} />
          </div>
        </SectionHeader>
      </div>
    );
  } else if (action === 'overview' && initialRows && Array.isArray(initialRows)) {
    return (
      <>
        <AddonOverview actionTitle={actionTitle} initialRows={initialRows} columns={columns} />
      </>
    );
  } else {
    return (
      <div className="m-1">
        {' '}
        <SectionHeader
          title={`Add ${action}`}
          className={`mt-2 border-b-4 border-${PRIMARY_COLOR}`}
          rightWidget={<RightButton />}
        >
          <div className="">
            <AddAndEditAddon action={action!} actionTitle={actionTitle} />
          </div>
        </SectionHeader>
      </div>
    );
  }
}

interface AddonProps {
  data?: ProductTypes;
  action: string;
  actionTitle: string;
  siteInfo?: any;
}

export function AddAndEditAddon({ data, action, actionTitle, siteInfo }: AddonProps) {
  const { user, setUser } = useUserContext();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductTypes>({
    id: data?.id || '',
  });
  const { isPending } = useBaseContext();
  const [iniAddons, setIniAddons] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);

    try {
      const postFormData = {
        ...formData,
        price: formData.price,
        addons: iniAddons,
        userId: user?.id,
      };

      const url = await api_create_and_update_plan({
        subBase: siteInfo.slug!,
      });
      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(postFormData),
      });

      if (!response.ok) {
        console.error(response.statusText);
        console.error('Network response was not ok');
      }

      const res = await response.json();

      if (res.success) {
        setSubmitted(true);
        toast.success('Item created successfully');
      } else {
        toast.error(res.msg);
        setSubmitted(false);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
      setSubmitted(false);
    } finally {
      setSubmitting(false);
    }
  };

  const options = [
    { value: 'no', label: 'No' },
    { value: 'yes', label: 'Yes' },
  ];

  return (
    <div className="relative w-full h-full min-h-[150vh]">
      <PackageForm
        setIniAddons={setIniAddons}
        iniAddons={iniAddons}
        action={action}
        actionTitle={actionTitle}
        onSubmit={handleSubmit}
        formData={formData!}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        data={data!}
        submitting={submitting}
        options={options}
      />
    </div>
  );
}
