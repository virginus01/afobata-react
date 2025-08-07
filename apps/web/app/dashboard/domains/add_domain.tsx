import { useDynamicContext } from '@/app/contexts/dynamic_context';
import { useUserContext } from '@/app/contexts/user_context';
import { lowercase } from '@/app/helpers/lowercase';
import { modHeaders } from '@/app/helpers/modHeaders';
import { api_add_or_update_domain } from '@/app/routes/api_routes';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomCard from '@/app/widgets/custom_card';
import FormInput from '@/app/widgets/hook_form_input';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import React, { useEffect } from 'react';
import slugify from 'slugify';
import { toast } from 'sonner';

interface DomainProps {
  name: string;
  id: string;
}

export default function AddDomain({
  domains,
  onAdd,
}: {
  domains?: DomainProps[];
  onAdd: (domain: DomainProps) => void;
}) {
  const { essentialData } = useUserContext();
  const [domain, setDomain] = React.useState({
    name: '',
    type: '',
    apexDomain: '',
    domain: '',
  });
  const { refreshPage } = useDynamicContext();
  const { user, siteInfo, brand } = essentialData;

  const [submitting, setSubmitting] = React.useState(false);

  useEffect(() => {
    const { name, type, apexDomain } = domain;
    let finalDomain = name;

    if (type === 'sub' && apexDomain) {
      finalDomain = `${name}.${apexDomain}`;
    }

    setDomain((prev) => ({ ...prev, domain: finalDomain }));
  }, [domain.name, domain.type, domain.apexDomain]);

  const isValidDomain = (value: string) => {
    // Simple domain validator (doesn't support full IDNs or all TLDs)
    const regex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
    return regex.test(value);
  };

  const handleAddDomain = async () => {
    if (domain.type === 'sub' && !domain.apexDomain) {
      toast.error('Please select a parent domain for subdomain.');
      return;
    }
    if (!domain.name) {
      toast.error('Please enter a domain name.');
      return;
    }
    if (!domain.type) {
      toast.error('Please select a domain type (Addon or Sub).');
      return;
    }
    if (!isValidDomain(domain.domain)) {
      toast.error('Please enter a valid domain name.');
      return;
    }

    try {
      setSubmitting(true);

      const url = await api_add_or_update_domain({
        subBase: siteInfo.slug!,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify({ ...domain, userId: user.id, brandId: brand.id }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
      }

      const { data, msg, status } = await response.json();

      if (status) {
        toast.success('Domain updated successfully.');
        refreshPage(['domains']);
        onAdd(data);
      } else {
        toast.error(msg);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unknown error occurred.';
      console.error('Error adding domain:', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-2 py-5 flex flex-col sm:flex-row gap-4 w-full">
      <CustomCard title="Custom Domain" className="p-1 w-full">
        <div
          className={`grid gap-4 w-full grid-cols-1 sm:grid-cols-${domain.type === 'sub' ? 3 : 2}`}
        >
          <SearchableSelect
            label="Domain Type"
            showSearch={false}
            defaultValues={[domain.type]}
            items={[
              { label: 'Addon Domain', value: 'addon' },
              { label: 'Sub Domain', value: 'sub' },
            ]}
            onSelect={(e: any) => setDomain({ ...domain, type: e })}
          />

          <FormInput
            controlled={false}
            label="Domain Name"
            value={domain.name}
            placeholder="Enter domain name"
            onBlur={(e) =>
              setDomain({
                ...domain,
                name:
                  domain.type === 'sub'
                    ? slugify(e.target.value, { lower: true, strict: true, trim: true })
                    : lowercase(e.target.value),
              })
            }
            name="name"
          />

          {domain.type === 'sub' && (
            <SearchableSelect
              label="Parent Domain"
              showSearch={false}
              defaultValues={[domain.apexDomain]}
              items={(domains ?? []).map((d) => ({
                label: d.name,
                value: d.name,
              }))}
              onSelect={(v: any) => setDomain({ ...domain, apexDomain: v })}
            />
          )}
        </div>
      </CustomCard>

      <CustomCard title="Domain Action" className="p-1 w-full sm:w-1/3">
        {domain?.domain && <div className="pb-4">Domain: {domain.domain}</div>}
        <CustomButton submitting={submitting} submittingText="Adding..." onClick={handleAddDomain}>
          Add
        </CustomButton>
      </CustomCard>
    </div>
  );
}
