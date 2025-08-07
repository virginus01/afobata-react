'use client';
import React, { useEffect, useState } from 'react';
import { SelectField } from '@/app/widgets/widgets';
import { api_get_product, api_get_products, api_get_sps } from '@/app/src/constants';

import { convertCommaToArray } from '@/app/helpers/convertCommaToArray';
import { extractAndFormatNumbers } from '@/app/helpers/extractAndFormatNumbers';
import { isNull } from '@/app/helpers/isNull';

import { useUserContext } from '@/app/contexts/user_context';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useBaseContext } from '@/app/contexts/base_context';
import FormInput from '@/app/widgets/hook_form_input';

type ValidationRule = {
  required?: boolean;
  message?: string;
};

type ValidationRules = {
  [key: string]: ValidationRule;
};

export const validationRules: ValidationRules = {
  sp: { required: true, message: 'Network is required' },
  productId: { required: true, message: 'Data Plan is required' },
  beneficiaryMobileNumbers: {
    required: true,
    message: 'Mobile Number(s) is required',
  },
};

interface DataSubFormProps {
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any,
  ) => void;
  handleSelectChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  errors: any;
  data: boolean;
}

const DataSubForm: React.FC<DataSubFormProps> = ({
  handleInputChange,
  handleSelectChange,
  errors,
}) => {
  const [sp, setSp] = useState<ServiceProviderTypes[]>([]);
  const [products, setProducts] = useState<ProductTypes[]>([]);
  const [spId, setSpId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [mobileNumbers, setMobileNumbers] = useState<string>('');
  const [mobileNumbersArray, setMobileNumbersArray] = useState<string[]>([]);
  const [product, setProduct] = useState<ProductTypes | null>(null);
  const { userId, user, essentialData } = useUserContext();

  useEffect(() => {
    const getSps = async () => {
      try {
        const url = await api_get_sps({ type: 'data' });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });

        const res = await response.json();
        if (res.success && !isNull(res.data)) {
          setSp(res.data);
        }
      } catch (error) {
        console.error(error as string);
      }
    };

    getSps();
  }, [user]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const url = await api_get_products({
          userId: 'admin',
          productType: 'data',
          spId: spId,
          subBase: essentialData?.siteInfo?.slug ?? '',
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });

        const res = await response.json();
        if (res.success && !isNull(res.data)) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error(error as string);
      }
    };
    if (spId) {
      getProducts();
    }
  }, [spId, user, essentialData?.siteInfo.slug]);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const url = await api_get_product({
          id: productId,
          subBase: essentialData?.siteInfo?.slug ?? '',
        });

        const response = await fetch(url, {
          method: 'GET',
          headers: await modHeaders('get'),
        });

        const res = await response.json();
        if (res.success && !isNull(res.data)) {
          setProduct(res.data);
          handleInputChange({
            target: { name: 'subTotal', value: res.data.price },
          });

          handleInputChange({
            target: { name: 'productData', value: res.data },
          });
        }
      } catch (error) {
        console.error(error as string);
      }
    };
    if (productId) {
      getProduct();
    }
  }, [productId, handleInputChange, user, essentialData?.siteInfo.slug]);

  let network_options: any[] = [
    {
      value: '',
      label: 'Select A Network',
    },
  ];

  if (sp) {
    sp.forEach((item: ServiceProviderTypes) => {
      network_options.push({
        value: item.id,
        label: item.others.title || item.name,
      });
    });
  }

  let products_options: any[] = [
    {
      value: '',
      label: 'Select Data Plan',
    },
  ];

  if (!isNull(products)) {
    products.forEach((item: ProductTypes) => {
      products_options.push({
        value: item.id,
        label: `${item.spName} ${item.title}`,
        disabled: false,
      });
    });
  } else {
    products_options.push({
      value: '0',
      label: spId ? 'loading' : 'please select network',
      disabled: true,
    });
  }

  const extractNumbers = (text: any) => {
    const cleanedNumbers = extractAndFormatNumbers(text);
    setMobileNumbers(cleanedNumbers);
    const numToArry = convertCommaToArray(cleanedNumbers);
    setMobileNumbersArray(numToArry);
    handleInputChange({
      target: { name: 'beneficiaryMobileNumbers', value: cleanedNumbers },
    });
  };

  return (
    <div className="p-0">
      <SelectField
        name="sp"
        onChange={(e) => {
          handleSelectChange(e);
          setSpId(e.target.value);
        }}
        label="Select Network"
        id="sp"
        options={network_options}
        error={errors.sp}
      />
      <SelectField
        name="productId"
        onChange={(e) => {
          handleSelectChange(e);
          setProductId(e.target.value);
        }}
        label="Select Data Plan"
        id="productId"
        options={products_options}
        error={errors.productId}
      />

      <FormInput
        onBlur={(e) => {
          extractNumbers(e.target.value);
        }}
        onChange={(e) => setMobileNumbers(e.target.value)}
        value={mobileNumbers}
        placeholder="seperate with comma (,) if more than 1"
        name="beneficiaryMobileNumbers"
        label="Enter Mobile Number(s)"
        id="Beneficiary-Mobile-Numbers"
        rows={1}
        error={errors.beneficiaryMobileNumbers}
      />

      <FormInput
        value={(
          parseInt(product?.price?.toString() || '0') * mobileNumbersArray.length || 0
        ).toFixed(2)}
        disabled={true}
        name="amount"
        onChange={handleInputChange}
        label="Amount to pay"
        id="amount"
        error={errors.amount}
      />
    </div>
  );
};

export default DataSubForm;
