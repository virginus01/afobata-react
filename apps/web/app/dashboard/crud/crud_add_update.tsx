'use client';

import React, { useLayoutEffect, useState } from 'react';
import { toast } from 'sonner';
import { api_crud } from '@/app/src/constants';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/app/src/section_header';
import { modHeaders } from '@/app/helpers/modHeaders';
import { packageCheckpoint } from '@/app/helpers/packageCheckpoint';
import { beforeUpdate } from '@/app/helpers/beforeUpdate';
import { findMissingFields } from '@/app/helpers/findMissingFields';
import { isNull } from '@/app/helpers/isNull';
import { mergeMatchingKeys } from '@/app/helpers/mergeMatchingKeys';
import { randomNumber } from '@/app/helpers/randomNumber';

import PostForm from '@/dashboard/crud/form';
import slugify from 'slugify';

import { clearCache } from '@/app/actions';
import indexedDB from '@/app/utils/indexdb';
import { useBaseContext } from '@/app/contexts/base_context';
import LoadingScreen from '@/app/src/loading_screen';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { ConfirmModal } from '@/app/widgets/confirm';
import { Data } from '@/app/models/Data';
import { useDynamicContext } from '@/app/contexts/dynamic_context';

// Validation schema with added field validations
const validationSchema = Yup.object({
  title: Yup.string()
    .required('Please input title')
    .min(3, 'Title must be at least 3 characters long'),
  slug: Yup.string()
    .required('Please input slug')
    .matches(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be in a valid format (lowercase, hyphens allowed)',
    ),
  description: Yup.string()
    .required('Please input description')
    .min(3, 'Description must be at least 3 characters long'),
  price: Yup.number().when('base', {
    is: (base: string) => base === 'products',
    then: (schema) =>
      schema
        .required('Invalid email address')
        .required('Please input price')
        .min(0, 'Price cannot be negative'),
  }),
  formerPrice: Yup.number().min(0, 'Former price cannot be negative'),
});

export default function CrudAddorUpdate({
  params,
  user,
  siteInfo,
  defaultData,
  type,
  categories,
  auth,
  searchParams = {},
  baseData = {} as BaseDataType,
  id,
  onSave,
}: {
  params: { action: string; base: string };
  user: UserTypes;
  siteInfo: BrandType;
  defaultData: any;
  type: string;
  categories: CategoryModel[];
  auth: AuthModel;
  searchParams: any;
  baseData: BaseDataType;
  id: string;
  onSave: (data: Data) => void;
}) {
  const router = useRouter();
  const [action, setAction] = useState(params.action);
  const [base, setBase] = useState(params.base);
  const [actionTitle, setActionTitle] = useState('Dashboard');
  const [submitted, setSubmitted] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { removeRouteData } = useBaseContext();
  const [isLoading, setIsLoading] = useState(true);
  const [parentData, setParentData] = useState<DataType>({});
  const [parentId, setParentId] = useState(searchParams.parentId || defaultData?.parentId!);
  const [itemId, setItemId] = useState(searchParams.id || defaultData?.id || id);
  const [isModalVisible, setModalVisible] = useState(false);
  const [defaultDataInstance, setDefaultDataInstance] = useState<Data>(new Data());
  const { fetchData, refreshPage, refreshKey } = useDynamicContext();

  const methods = useForm<DataType | any>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: {
      ...beforeUpdate(defaultData, true),
      canonicalSlug: defaultData?.canonicalSlug || defaultData?.slug || '',
      action,
      base,
      password: randomNumber(8),
      wordsPerTopic: 150,
      numTopics: 5,
      numChapters: 10,
      wordsLength: 500,
      AddTC: '',
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
    getValues,
  } = methods;

  const values = getValues();

  useLayoutEffect(() => {
    if (isNull(itemId) && isNull(parentId)) {
      setIsLoading(false);
      console.info('nothing to fetch');
      return;
    }

    const getLiveData = async () => {
      if (!itemId) return;

      try {
        const result: any = await fetchData({
          table: params.base,
          tag: itemId,
          conditions: { id: itemId },
          limit: 1,
          sortOptions: {},
          brandSlug: siteInfo?.slug!,
        });

        if (!isNull(result)) {
          const activeInstance: any = mergeMatchingKeys(defaultDataInstance, result[0]);
          const da = beforeUpdate(activeInstance, true);
          Object.keys(da).forEach((key) => {
            if (key in defaultDataInstance) {
              setValue(key, da[key]);
            }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const getParentData = async () => {
      if (!parentId) return;

      try {
        const result: any = await fetchData({
          table: params.base,
          tag: parentId,
          conditions: { id: parentId },
          limit: 1,
          sortOptions: {},
          brandSlug: siteInfo?.slug!,
        });

        if (!isNull(result)) {
          setParentData(result[0]);
          if (action === 'add') {
            const parentInstance: any = mergeMatchingKeys(defaultDataInstance, result[0]);
            const dap = beforeUpdate(parentInstance, true);
            Object.keys(dap).forEach((key) => {
              if (key in defaultDataInstance) {
                setValue(key, dap[key]);
              }
            });
            setValue('id', '');
            setValue('slug', '');
            setValue('title', '');
            setValue('subTitle', parentInstance.title ?? '');
            setValue('parentId', parentInstance.id ?? '');
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getLiveData();
    getParentData();
  }, [params.action, params.base, itemId, parentId, refreshKey]);

  const onSubmit = async (values: DataType) => {
    setSubmitting(true);

    if (isNull(baseData.table)) {
      toast.error('update table missing');
      return;
    }

    const slug = slugify(values.slug || values.title || '', {
      strict: true,
      lower: true,
    });

    const missing = findMissingFields({ status: values.status, slug });

    if (missing) {
      toast.error(`${missing} required`);
      return;
    }

    const finalData = mergeMatchingKeys(defaultDataInstance, values);

    try {
      const formDataWithMultiple: any = {
        ...finalData,
        base: base,
        action: action,
        createNew: defaultData?.slug ? false : true,
        slug,
        type: type,
        isFree: isNull(parseInt(String(values.price ?? 0))),
        userId: user?.id,
        brandId: user?.brand?.id,
        parentBrandId: siteInfo.id,
        table: baseData.table,
        currency: user.defaultCurrency,
        currencySymbol: user.currencyInfo?.currencySymbol,
        status: values.status,
        meta: {
          authorName: user.name ?? `${user.firstName} ${user.lastName}`,
          brandName: user?.brand?.name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          currency: user?.defaultCurrency ?? '',
        },
      };

      const pCheckpoint = await packageCheckpoint({ data: formDataWithMultiple, siteInfo });

      if (!pCheckpoint) {
        toast.error("You can't add package");
        return;
      }

      let url = '';
      let method: any = 'PUT';

      let newId = itemId || values.id || randomNumber(10);

      if (values.id && action === 'edit') {
        url = await api_crud({
          subBase: siteInfo.slug!,
          method: 'patch',
          action: 'crud_patch',
          id: newId,
          table: baseData.table!,
        });
        method = 'PATCH';
      } else {
        url = await api_crud({
          subBase: siteInfo.slug!,
          method: 'put',
          action: 'crud_put',
          id: newId,
          table: baseData.table!,
        });
      }

      const response = await fetch(url, {
        method,
        headers: await modHeaders(method),
        body: JSON.stringify({
          data: { ...formDataWithMultiple, id: newId },
          table: baseData.table ?? '',
          id: newId,
        }),
      });

      if (!response.ok) {
        console.error(response.statusText);
        console.error('Network response was not ok');
      }

      const { data, status, msg } = await response.json();

      if (status) {
        toast.success(msg);
        clearCache(baseData?.table!);

        if (values.id && action === 'edit') {
          indexedDB.saveOrUpdateDataWithId({
            table: baseData?.table ?? '',
            data,
            id,
            tag: values.id,
          });
          refreshPage([baseData?.table ?? '']);
        } else {
          refreshPage([baseData?.table ?? '']);
        }

        onSave(data);
        router.refresh();
        removeRouteData();
      } else {
        toast.error(msg);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedClick = async (status: string) => {
    const isValid = await trigger();
    if (isValid) setModalVisible(true);
  };

  return (
    <div className="relative">
      <SectionHeader title={actionTitle}>
        {isLoading ? (
          <LoadingScreen />
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col space-y-5">
              <PostForm
                id={values?.id ?? ''}
                parentId={parentId}
                baseData={baseData}
                searchParams={searchParams}
                siteInfo={siteInfo}
                parentData={parentData}
                user={user}
                categories={categories}
                submitted={submitted}
                action={action}
                base={base}
                actionTitle={actionTitle}
                type={type}
                setValue={setValue}
                methods={methods}
                values={getValues()}
                errors={errors}
                submitting={submitting}
                handleProceedClick={handleProceedClick}
              />
            </form>
          </FormProvider>
        )}
      </SectionHeader>
      {isModalVisible && (
        <ConfirmModal
          info="Are you sure you want to update this?"
          onContinue={() => {
            setModalVisible(false);
            handleSubmit(onSubmit)();
          }}
          onCancel={() => {
            setModalVisible(false);
          }}
          url=""
          headerText="Confirm"
        />
      )}
    </div>
  );
}
