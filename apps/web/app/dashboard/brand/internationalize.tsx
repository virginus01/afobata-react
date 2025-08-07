'use client';

import { isNull } from '@/app/helpers/isNull';
import FormInput from '@/app/widgets/hook_form_input';
import { Card } from '@/components/ui/card';
import { getDictionary } from '@/lib/dictionaries';
import React, { useEffect, useState } from 'react';

const Shimmer = () => (
  <div className="p-2 space-y-4">
    {Array(3)
      .fill(null)
      .map((_, index) => (
        <div key={index} className="space-y-2 animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-8 bg-gray-300 rounded w-full"></div>
        </div>
      ))}
  </div>
);

const Internationalize = ({ user, siteInfo }: { user: any; siteInfo: any }) => {
  const [dict, setDict] = useState<Record<string, string>>({});
  const [updatedDict, setUpdatedDict] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDict = async () => {
      const data = await getDictionary('en');

      setDict(data);
      setUpdatedDict(data);

      if (data) {
        setLoading(false);
        console.info(data);
      } else {
        console.error('no language data');
      }
    };
    fetchDict();
  }, []);

  const handleChange = (key: string, value: string) => {
    setUpdatedDict((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {};

  if (loading) {
    return <Shimmer />;
  }

  return (
    <Card className="brand-bg-card brand-text-card bg-white m-1 h-full mt-5 border border-none">
      <div className="p-2 space-y-6 py-8">
        {Object.keys(updatedDict).map((key) => (
          <div key={key} className="space-y-1">
            <FormInput
              showPrefix={false}
              defaultValue={updatedDict[key]}
              controlled={false}
              name={key}
              label={key}
              onBlur={(e) => handleChange(key, e.target.value)}
            />
          </div>
        ))}

        <button
          onClick={handleSave}
          className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </Card>
  );
};

export default Internationalize;
