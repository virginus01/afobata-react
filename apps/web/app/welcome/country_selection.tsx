'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/app/widgets/searchable_select';
import { emptySelect } from '@/app/src/constants';
import { isNull } from '@/app/helpers/isNull';
import FormInput from '@/app/widgets/hook_form_input';
import { CustomButton } from '@/app/widgets/custom_button';
import { getDynamicData } from '@/helpers/getDynamicData';
import { show_error } from '@/helpers/show_error';

interface CountrySelectionProps {
  siteInfo: BrandType;
  auth?: AuthModel;
  user?: UserTypes;
  iniCountries?: CountryType[];
  onDone: (data: Record<string, any>) => void;
}

export const CountrySelection: React.FC<CountrySelectionProps> = ({
  siteInfo,
  iniCountries,
  onDone,
}) => {
  const [geo, setGeo] = useState<GeoInfo>({});
  const [countries, setCountries] = useState<CountryType[]>(iniCountries || []);
  const [country, setCountry] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [countryInfo, setCountryInfo] = useState<Partial<CountryType>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Memoized function to fetch countries
  const fetchCountries = useCallback(async () => {
    try {
      // Fetch IP/Geo information

      // Fetch countries
      const { status, data, msg } = await getDynamicData({
        subBase: siteInfo.slug!,
        table: 'countries',
        conditions: {},
        limit: 1000,
        page: 1,
      });

      if (status && data) {
        const processedCountries: CountryType[] = data.map((country: any) => ({
          id: country.id,
          currency: country.currency,
          name: country.name,
          value: country.id,
          label: country.name,
        }));

        setCountries(processedCountries);
        setIsLoading(false);
      } else {
        show_error(msg, 'Error fetching countries');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
      show_error('Network error', 'Failed to load countries');
      setIsLoading(false);
    }
  }, [siteInfo.slug]);

  // Fetch countries on component mount
  useEffect(() => {
    if (isNull(countries)) {
      fetchCountries();
    }
  }, [fetchCountries, countries]);

  useEffect(() => {
    const getGeo = async () => {
      const cachedVisitorInfo: GeoInfo = {};
      if (cachedVisitorInfo) {
        setGeo(cachedVisitorInfo);
        setCountry((cachedVisitorInfo.country || 'ng').toLowerCase());
      }
    };
    getGeo();
  }, [countries]);

  // Update country info when country changes
  useEffect(() => {
    const cInfo = countries.find((c) => c.id === country);
    if (cInfo) {
      setCountryInfo(cInfo);
    }
  }, [country, countries]);

  // Handle continue action with improved validation
  const handleContinue = () => {
    if (isNull(countryInfo.currency) || isNull(countryInfo.id)) {
      toast.error('Please select a valid country');
      return;
    }

    onDone({
      ...countryInfo,
      ...geo,
      country: countryInfo.id,
    });
  };

  // Render loading state
  if (isNull(countries)) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading countries... Please wait</p>
      </div>
    );
  }

  return (
    <div className="p-1 space-y-4">
      <SearchableSelect
        labelClass="brand-bg"
        label="Select your country"
        items={emptySelect.concat(countries as any)}
        onSelect={(selectedCountry: any) => {
          setCountry(selectedCountry);
        }}
        allowMultiSelect={false}
        selectPlaceholder="Select Country"
        defaultValues={[country]}
      />

      <FormInput
        labelClass="brand-bg"
        id="currency"
        disabled
        name="currency"
        controlled={false}
        label="Currency"
        value={countryInfo.currency || ''}
      />

      <FormInput
        labelClass="brand-bg"
        id="city"
        name="city"
        controlled={false}
        label="City"
        onBlur={(e) => {
          setCity(e.target.value);
        }}
        value={city ?? (geo.city || '')}
      />

      <CustomButton onClick={handleContinue}>Continue</CustomButton>
    </div>
  );
};
