'use client';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { CustomButton, SearchableSelect } from '@/app/widgets/widgets';
import { FaPaperPlane, FaPlus, FaTimes } from 'react-icons/fa';
import { capitalize } from '@/app/helpers/capitalize';
import { isAdmin } from '@/app/helpers/isAdmin';
import { isNull } from '@/app/helpers/isNull';
import { organizeCategoriesHierarchically } from '@/app/helpers/organizeCategoriesHierarchically';

import { toast } from 'sonner';
import { UseFormReturn, useWatch } from 'react-hook-form';
import FormInput from '@/app/widgets/hook_form_input';
import { ConfirmModal } from '@/app/widgets/confirm';
import CustomDrawer from '@/app/src/custom_drawer';
import { FileSelector } from '@/app/media/file_selector';
import { emptySelect, mode } from '@/app/src/constants';
import ToggleRowSelect from '@/app/widgets/select_toggle';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUploadGallary from '@/app/media/editor_image_gallary';
import PageBuilder from '@/dashboard/page_builder/builder';
import { LayoutGrid, MousePointerClick, Move, PencilIcon } from 'lucide-react';
import IconButton from '@/app/widgets/icon_button';
import CustomCard from '@/app/widgets/custom_card';
import CrudGeneralInfo from '@/dashboard/crud/forms/basic_info';
import PackageAddonsSelection from '@/dashboard/crud/package_addons';
import Topics from '@/dashboard/crud/topics';
import { ToggleSwitch } from '@/app/widgets/toggle_switch_button';
import Chapters from '@/dashboard/crud/chapters';
import indexedDB from '@/app/utils/indexdb';
import GetNavigation from '@/app/navigation';
import Body from '@/dashboard/crud/body';
import { RuleInput } from '@/dashboard/brand/rules_form';
import { Data } from '@/app/models/Data';
import SubCourses from '@/dashboard/crud/sub_courses';

interface PostFormProps {
  action: string;
  submitting: boolean;
  submitted?: boolean;
  type: string;
  actionTitle?: string;
  base: string;
  categories: CategoryModel[];
  user: UserTypes;
  siteInfo: BrandType;
  searchParams: any;
  baseData: BaseDataType;
  parentData: DataType;
  id?: string;
  parentId?: string;
  handleProceedClick: (status: any) => void;
  setValue: (name: string, value: any) => void;
  methods: UseFormReturn<any>;
  values: Data;
  errors: any;
}

const PostForm: React.FC<PostFormProps> = ({
  user,
  baseData,
  action,
  submitting,
  submitted = true,
  type,
  base,
  actionTitle,
  categories,
  siteInfo,
  searchParams,
  parentData,
  id,
  parentId,
  handleProceedClick,
  setValue,
  methods,
  values,
  errors,
}) => {
  const [editSlug, setEditSlug] = useState(values.slug || searchParams.slug ? false : true);
  const [isModalEditSlugVisible, setIsModalEditSlugVisible] = useState(false);
  const [isFileSelectorOpen, setIsFileSelectorOpen] = useState(false);
  const [isPageBuilderOpen, setIsPageBuilderOpen] = useState(false);
  const [images, setImages] = useState<FileType[] | null>(values.images || []);
  const [product_files, setProductFiles] = useState<FileType[] | null>(values.product_files || []);
  const [iniAddons, setIniAddons] = useState<AddonType[]>(values.addons ?? []);
  const [topics, setTopics] = useState<TopicType[]>(values.topics ?? []);
  const [chapters, setChapters] = useState<ChapterType[]>(values.chapters ?? []);
  const [subCoursesIds, setSubCoursesIds] = useState<any[]>(values.subCoursesIds ?? []);
  const [bodyType, setBodyType] = useState<any>(values.bodyType);
  const [fulFilmentType, setfulFilmentType] = useState<any>(values.fulFilmentType);
  const [priceRule, setPriceRule] = useState(values.rules ?? {});
  const [indexData, setIndexData] = useState<any | null>({
    name: 'index',
    title: values.index ? 'index' : 'No Index',
    value: values.index,
  });
  const [cats, setCats] = useState(categories);
  const [tgs, setTags] = useState<any[]>([]);
  const [catSearchTerm, setCatSearchTerm] = useState('');
  const [resellerPrice, setResellerPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDroping, setIsDroping] = useState(!isNull(parentId));

  const [sections, setSections] = useState<ViewRenderData[]>(
    (values?.pageData?.sections as any) ?? [],
  );

  useEffect(() => {
    setValue('addons', iniAddons);
    setValue('topics', topics);
    setValue('chapters', chapters);
    setValue('subCoursesIds', subCoursesIds);
    setValue('bodyType', bodyType);
    setValue('fulFilmentType', fulFilmentType);
    setValue('rules', priceRule);
    setValue('parentId', parentId ?? '');
    setValue('id', id ?? '');
  }, [iniAddons, topics, chapters, bodyType, fulFilmentType, parentId, id, priceRule, setValue]);

  const handleImageSelection = (images: File[], key: string = 'images') => {
    setValue(key, images);
  };

  const handleBgImageSelection = (images: File[]) => {
    setValue('bg_image', images[0]);
  };

  useEffect(() => {
    let isMounted = true;

    const processCats = async () => {
      if (catSearchTerm) {
        const searchConditions = {
          $or: [{ name: { $regex: catSearchTerm, $options: 'i' } }],
        };

        const cachedCat = await indexedDB.queryData({
          table: 'categories',
          conditions: searchConditions,
          limit: 5000,
        });

        if (!cachedCat && !Array.isArray(cachedCat)) return;

        // Organize filtered categories hierarchically
        const organizedCats = organizeCategoriesHierarchically(
          cachedCat.filter((p) => p.type === 'category' && p.id !== values.id),
        );

        // Add isMounted check before setting state
        if (isMounted) {
          setCats(organizedCats);
        }
      } else if (categories) {
        const organizedCats = organizeCategoriesHierarchically(
          categories.filter((p) => p.type === 'category' && p.id !== values.id),
        );

        // Add isMounted check before setting state
        if (isMounted) {
          setCats(organizedCats);
        }
      }

      const nav: any = await GetNavigation({
        user,
        selectedProfile: user.selectedProfile ?? '',
        siteInfo,
      });
      let allNavsTags: any[] = [];

      nav.allNavs.forEach((n: any) => {
        if (!['admin'].includes(n.id)) {
          allNavsTags.push({
            id: n.id,
            label: n.id,
          });
        }
      });

      // Add isMounted check before setting state
      if (isMounted) {
        setTags(allNavsTags ?? []);
      }
    };

    processCats();

    return () => {
      isMounted = false;
    };
  }, [categories, catSearchTerm, values.id, user.selectedProfile]);

  const profitMargin = useWatch({ control: methods.control, name: 'profit_margin' }) ?? 0;
  const price = useWatch({ control: methods.control, name: 'price' });
  const reseller_discount = useWatch({ control: methods.control, name: 'reseller_discount' });

  useEffect(() => {
    const rD = ((reseller_discount ?? 0) / 100) * price;
    setResellerPrice(Number(price) - Number(rD));
  }, [price, reseller_discount]);

  useEffect(() => {
    ['biannual', 'quarterly', 'monthly', 'yearly'].map((period) => {
      let months = 1;
      switch (period) {
        case 'biannual':
          months = 6;
          break;
        case 'quarterly':
          months = 3;
          break;
        case 'yearly':
          months = 12;
          break;
        case 'monthly':
          months = 1;
          break;
      }
      setValue(`${period}_price`, months * Number(price));
      setValue(`reseller_${period}_price`, months * Number(reseller_discount));
    });
  }, [reseller_discount, price, setValue]);

  let formattedBase = capitalize(base);

  const indexOption: any[] = [];
  indexOption.push({ name: 'index', title: 'No Index', value: false });
  indexOption.push({ name: 'index', title: 'Index', value: true });

  const monetizeOption: any[] = [];
  monetizeOption.push({ name: 'monetize', title: 'No', value: false });
  monetizeOption.push({ name: 'monetize', title: 'Yes', value: true });

  return (
    <Tabs className="mt-4" defaultValue="basic-info" orientation="horizontal">
      <TabsList className="grid w-full grid-cols-2 gap-4 items-center border-b border-gray-300 pb-16">
        <TabsTrigger value="basic-info">Info</TabsTrigger>
        <TabsTrigger value="seo-settings">SEO Settings</TabsTrigger>
      </TabsList>
      <div>
        <TabsContent value="basic-info" className="flex flex-col space-y-8">
          <div className="flex flex-col sm:flex-row h-full w-full">
            <div className="w-full sm:w-4/6 h-full">
              <CrudGeneralInfo
                title="Basic Info"
                base="blog"
                formData={values}
                errors={errors}
                setValue={setValue}
                editSlug={editSlug}
                setEditSlug={setEditSlug}
                setIsModalEditSlugVisible={setIsModalEditSlugVisible}
                type="dynamic"
                searchParams={searchParams}
                body={null}
              />

              {['products', 'category', 'blog', 'posts'].includes(base) && (
                <CustomCard title="Images">
                  <ImageUploadGallary
                    maxImages={5}
                    onImagesSelected={(e: any) => handleImageSelection(e, 'images')}
                    user={user}
                    siteInfo={siteInfo}
                    initialImages={images || []}
                  />
                </CustomCard>
              )}

              {['package'].includes(type) &&
                ((!isNull(parentData) && isDroping) || isAdmin(user)) && (
                  <div className="flex flex-col space-y-2">
                    <CustomCard
                      title="Package options"
                      className="my-2 bg-gray-200 font-bold"
                    ></CustomCard>
                    <PackageAddonsSelection
                      parentData={parentData}
                      data={values as any}
                      user={user}
                      methods={methods}
                      addons={iniAddons as any[]}
                      isDroping={isDroping}
                      setAddons={setIniAddons as any}
                      setValue={setValue}
                    />
                  </div>
                )}

              <CustomCard title="Details" className="my-4 bg-gray-200 font-bold">
                {['products', 'posts', 'blog'].includes(base) && (
                  <Body
                    setValue={setValue}
                    setBody={(body: string) => {
                      setValue('body', body);
                    }}
                    title={methods.watch('title')}
                    methods={methods}
                    body={methods.watch('body') ?? values.body ?? ''}
                    setBodyType={setBodyType}
                    bodyType={bodyType}
                    siteInfo={siteInfo}
                    user={user}
                  />
                )}

                {['pages'].includes(base) && (
                  <CustomCard
                    title="Has Buildable Dynamic Page"
                    topRightWidget={
                      <ToggleSwitch
                        className="text-xs"
                        name={''}
                        label=""
                        onChange={(e) => {
                          if (bodyType !== 'page') {
                            setBodyType('page');
                          } else {
                            setBodyType('');
                          }
                        }}
                        checked={bodyType === 'page'}
                      />
                    }
                  >
                    {bodyType === 'page' && (
                      <div onClick={() => setIsPageBuilderOpen(true)}>
                        <IconButton
                          className="w-full"
                          bordered={false}
                          filled="danger"
                          iconPosition="after"
                          icon={
                            <div className="flex items-center gap-1">
                              <MousePointerClick className="w-5 h-5 transition-all duration-300 group-hover:translate-y-1 group-hover:translate-x-1" />
                              <Move className="w-5 h-5 transition-all duration-300 group-hover:scale-125" />
                            </div>
                          }
                        >
                          <div className="flex flex-row">
                            <LayoutGrid className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />
                            <div className="ml-2"> Visual Page Builder</div>
                          </div>
                        </IconButton>
                      </div>
                    )}
                  </CustomCard>
                )}

                {['posts', 'blog'].includes(base) && (
                  <div className="w-full">
                    <Topics
                      setValue={setValue}
                      setTopics={setTopics}
                      topics={topics}
                      user={user}
                      siteInfo={siteInfo}
                      methods={methods}
                      setBodyType={setBodyType}
                      bodyType={bodyType}
                      setChapters={setChapters}
                      chapters={chapters}
                    />
                  </div>
                )}

                {['posts', 'blog'].includes(base) && (
                  <div className="w-full">
                    <Chapters
                      setValue={setValue}
                      setChapters={setChapters}
                      chapters={chapters}
                      user={user}
                      siteInfo={siteInfo}
                      methods={methods}
                      setBodyType={setBodyType}
                      bodyType={bodyType}
                    />
                  </div>
                )}
              </CustomCard>

              {['products'].includes(base) && (
                <CustomCard
                  title={['products'].includes(base) ? 'FulFilment Method' : 'More Details'}
                  className="my-4 bg-gray-200 font-bold"
                >
                  {['products'].includes(base) && (
                    <div className="w-full">
                      <Topics
                        setValue={setValue}
                        setTopics={setTopics}
                        topics={topics}
                        user={user}
                        siteInfo={siteInfo}
                        methods={methods}
                        setBodyType={setfulFilmentType}
                        bodyType={fulFilmentType}
                        setChapters={setChapters}
                        chapters={chapters}
                      />
                    </div>
                  )}

                  {['products'].includes(base) && (
                    <div className="w-full">
                      <Chapters
                        setValue={setValue}
                        setChapters={setChapters}
                        chapters={chapters}
                        user={user}
                        siteInfo={siteInfo}
                        methods={methods}
                        setBodyType={setfulFilmentType}
                        bodyType={fulFilmentType}
                      />
                    </div>
                  )}

                  {['products'].includes(base) && (
                    <CustomCard
                      title="Has Downloadable Files"
                      topRightWidget={
                        <ToggleSwitch
                          className="text-xs"
                          name={''}
                          label=""
                          onChange={(e) => {
                            if (fulFilmentType !== 'downloadable') {
                              setfulFilmentType('downloadable');
                            } else {
                              setfulFilmentType('');
                            }
                          }}
                          checked={fulFilmentType === 'downloadable'}
                        />
                      }
                    >
                      {fulFilmentType === 'downloadable' && (
                        <ImageUploadGallary
                          maxImages={5}
                          onImagesSelected={(e: any) => handleImageSelection(e, 'product_files')}
                          user={user}
                          siteInfo={siteInfo}
                          initialImages={product_files || []}
                          fileType={['pdf']}
                        />
                      )}
                    </CustomCard>
                  )}

                  {['products'].includes(base) && (
                    <div className="w-full">
                      <SubCourses
                        setValue={setValue}
                        setSubCourses={setSubCoursesIds}
                        subCourses={subCoursesIds}
                        user={user}
                        siteInfo={siteInfo}
                        methods={methods}
                        setBodyType={setfulFilmentType}
                        bodyType={fulFilmentType}
                      />
                    </div>
                  )}

                  {['products'].includes(base) && (
                    <CustomCard
                      title="Redirect User To URL"
                      topRightWidget={
                        <ToggleSwitch
                          className="text-xs"
                          name={''}
                          label=""
                          onChange={(e) => {
                            if (fulFilmentType !== 'redirect') {
                              setfulFilmentType('redirect');
                            } else {
                              setfulFilmentType('');
                            }
                          }}
                          checked={fulFilmentType === 'redirect'}
                        />
                      }
                    >
                      {fulFilmentType === 'redirect' && (
                        <FormInput label="Redirect Link" type="url" name="redirectUrl" />
                      )}
                    </CustomCard>
                  )}
                </CustomCard>
              )}
            </div>
            <div className="w-full sm:w-4/12 h-full sm:sticky sm:top-12">
              {['products', 'category', 'blog', 'posts'].includes(base) && (
                <CustomCard title="Category & Tags">
                  <div className="flex flex-col space-y-4">
                    <SearchableSelect
                      label="Category"
                      items={emptySelect.concat((cats as any) || []) || []}
                      onSelect={(v: any) => {
                        setValue('category', v);
                      }}
                      onSearch={(term) => {
                        setCatSearchTerm(term);
                      }}
                      name="category"
                      allowMultiSelect={false}
                      selectPlaceholder="Select Category"
                      defaultValues={[values.category ?? '']}
                    />
                    <SearchableSelect
                      label="Tags"
                      items={tgs}
                      onSelect={(v: any) => {
                        setValue('tags', v.join(', '));
                      }}
                      allowMultiSelect={true}
                      selectPlaceholder="Select Tags"
                      defaultValues={
                        typeof (methods.watch('tags') ?? values.tags) === 'string'
                          ? (methods.watch('tags') ?? values.tags).split(', ')
                          : []
                      }
                    />
                    {['add'].includes(action) && type === 'package' && (
                      <SearchableSelect
                        label="Allowed Plateforms"
                        items={tgs}
                        onSelect={(v: any) => {
                          setValue('allowedPlateforms', v);
                        }}
                        allowMultiSelect={true}
                        selectPlaceholder="Select Allowed Plateforms"
                        defaultValues={methods.watch('allowedPlateforms') ?? []}
                      />
                    )}
                  </div>
                </CustomCard>
              )}
              {['products'].includes(base) && (
                <CustomCard title="Price Information">
                  <div className="flex flex-col space-y-6">
                    <FormInput
                      showPrefix={false}
                      name="price"
                      type="number"
                      onChange={(e) => setValue('price', e.target.value)}
                      label={`Price ${user.currencyInfo?.currencyCode!}`}
                      id="price"
                      error={errors.price?.message}
                      disabled={isDroping}
                    />

                    <div className="flex flex-row justify-between space-x-2">
                      <FormInput
                        type="number"
                        name="discount"
                        min={0}
                        max={100}
                        onChange={(e) => setValue('discount', e.target.value)}
                        label="Discount (in %)"
                        id="discount"
                        error={errors.discount?.message}
                        disabled={isDroping}
                        showPrefix={false}
                      />
                      <FormInput
                        showPrefix={false}
                        type="number"
                        name="reseller_discount"
                        min={0}
                        max={100}
                        onChange={(e) => {
                          setValue('reseller_discount', e.target.value);
                        }}
                        label="Resellers Discount"
                        id="reseller-discount"
                        error={errors.reseller_discount?.message}
                        disabled={isDroping}
                      />
                    </div>
                    {type === 'package' && (
                      <>
                        {['yearly', 'biannual', 'quarterly'].map((period) => (
                          <div key={period} className="flex flex-row justify-between space-x-2">
                            <FormInput
                              showPrefix={false}
                              name={`${period}_price`}
                              type="number"
                              onChange={(e) => {}}
                              label={`${period?.charAt(0)?.toUpperCase() + period.slice(1)} Price`}
                              id={`${period}-price`}
                              error={errors[`${period}_price`]?.message}
                              disabled={true}
                            />
                            <FormInput
                              showPrefix={false}
                              type="number"
                              name={`reseller_${period}_price`}
                              onChange={(e) => {}}
                              label={`Re. ${
                                period.charAt(0).toUpperCase() + period.slice(1)
                              } Price`}
                              id={`reseller-${period}-price`}
                              error={errors[`reseller_${period}_price`]?.message}
                              disabled={true}
                            />
                          </div>
                        ))}

                        {isDroping && (
                          <div className="flex flex-col space-y-4">
                            <RuleInput
                              index={0}
                              title="Profit Margin (in %)"
                              id={'reseller'}
                              min={0}
                              subject={`${resellerPrice || '0'} (${reseller_discount}%)` as any}
                              max={reseller_discount}
                              rule={priceRule.reseller ?? {}}
                              user={user}
                              siteInfo={siteInfo}
                              onChange={(v) => {
                                setPriceRule({ reseller: v });
                              }}
                            />
                            {methods.watch('profit_margin') > 0 && (
                              <>
                                <FormInput
                                  type="number"
                                  name="drop_annual_price"
                                  onChange={(e) => setValue(`drop_annual_price`, e.target.value)}
                                  label="Your Yearly Price"
                                  id="profit-annual"
                                  error={errors.discount?.message}
                                  showPrefix={false}
                                  disabled={true}
                                />{' '}
                                <FormInput
                                  type="number"
                                  name="drop_biannual_price"
                                  onChange={(e) => setValue(`drop_biannual_price`, e.target.value)}
                                  label="Your Biannual Price"
                                  id="profit-margin"
                                  error={errors.discount?.message}
                                  showPrefix={false}
                                  disabled={true}
                                />
                                <FormInput
                                  type="number"
                                  name="drop_quarterly_price"
                                  onChange={(e) => setValue(`drop_quarterly_price`, e.target.value)}
                                  label="Your Quarterly Price"
                                  id="profit-margin"
                                  error={errors.discount?.message}
                                  showPrefix={false}
                                  disabled={true}
                                />
                                <FormInput
                                  type="number"
                                  name="drop_monthly_price"
                                  onChange={(e) => setValue(`drop_monthly_price`, e.target.value)}
                                  label="Your Monthly Price"
                                  id="profit-margin"
                                  error={errors.discount?.message}
                                  showPrefix={false}
                                  disabled={true}
                                />{' '}
                              </>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </CustomCard>
              )}

              {['products', 'category', 'blog', 'posts', 'pages'].includes(base) && (
                <CustomCard title="Add Background Image (optional)">
                  <ImageUploadGallary
                    className="w-full h-24"
                    label=""
                    maxImages={1}
                    onImagesSelected={(e: any) => handleBgImageSelection(e)}
                    user={user}
                    siteInfo={siteInfo}
                    initialImages={!isNull(values.bg_image) ? ([values.bg_image] as any[]) : []}
                  />
                </CustomCard>
              )}

              <CustomCard title="Status" className="sm:sticky top-20 bottom-10">
                <div className="flex flex-col space-y-6">
                  {['products'].includes(base) && (
                    <FormInput
                      type="number"
                      name="password"
                      onChange={(e) => setValue(`password`, e.target.value)}
                      label="Password"
                      id="password"
                      error={errors.discount?.message}
                      showPrefix={false}
                      disabled={true}
                    />
                  )}

                  <SearchableSelect
                    label="Status"
                    items={[
                      {
                        name: 'published',
                        title: 'Published',
                        value: 'published',
                      },
                      { name: 'draft', title: 'Draft', value: 'draft' },
                    ]}
                    onSelect={(v: any) => {
                      setValue('status', v);
                    }}
                    allowMultiSelect={false}
                    selectPlaceholder="Select Status"
                    defaultValues={[values.status || '']}
                    showSearch={false}
                  />

                  <CustomButton
                    onClick={() => {
                      handleProceedClick('published');
                    }}
                    submitting={submitting}
                    submittingText="Submitting"
                    submitted={false}
                    iconPosition="after"
                    icon={<FaPaperPlane />}
                  >
                    {values.id ? 'Update' : 'Publish'}
                  </CustomButton>
                </div>
              </CustomCard>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="seo-settings">
          <Card className="brand-bg-card brand-text-card border border-none">
            <CardContent className="flex flex-col space-y-8 m-5 ">
              <FormInput
                className="w-full"
                name="metaTitle"
                onChange={(e) => setValue('metaTitle', e.target.value)}
                label={`${formattedBase} SEO Title`}
                id="meta-title-input"
                error={errors.metaTitle?.message}
              />
              <FormInput
                rows={2}
                type="textarea"
                name="metaDescription"
                placeholder="enter meta description in not more than 50 characters"
                onChange={(e) => setValue('metaDescription', e.target.value)}
                label={`${formattedBase} SEO Description`}
                id="metaDescription-input"
                error={errors.metaDescription?.message}
              />
              <div className="flex space-x-2 items-center">
                <label htmlFor="search-engine-index" className="text-sm font-medium">
                  Search Engine Index
                </label>
                <ToggleRowSelect
                  selected={indexData!}
                  options={indexOption}
                  onSelectionChange={(e: any) => setValue(e.name, e.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>

      {isModalEditSlugVisible && (
        <ConfirmModal
          info="Are you sure you want to edit this slug? This will make the old link unavailable"
          onContinue={() => {
            setEditSlug((prev) => !prev);
            setIsModalEditSlugVisible(false);
          }}
          onCancel={() => {
            setIsModalEditSlugVisible(false);
          }}
          headerText="Confirm Edit"
        />
      )}

      <CustomDrawer
        direction="right"
        isWidthFull={true}
        isHeightFull={true}
        showHeader={false}
        isOpen={isFileSelectorOpen}
        onClose={() => {}}
        header="Select Image"
      >
        <FileSelector
          maxSelect={1}
          onSelect={(e: any) => {
            setValue('image', e[0]);

            setIsFileSelectorOpen(false);
          }}
          onClose={() => setIsFileSelectorOpen(false)}
          user={user}
          siteInfo={siteInfo}
        />
      </CustomDrawer>

      <CustomDrawer
        direction="right"
        showHeader={true}
        isWidthFull={true}
        isHeightFull={true}
        isFull={true}
        isOpen={isPageBuilderOpen}
        onClose={() => {
          setIsPageBuilderOpen(false);
        }}
        header="PageBuilder"
      >
        <PageBuilder
          onSave={(data) => {
            setValue('pageData', data);
            setIsPageBuilderOpen(false);
          }}
          onClose={() => {
            setIsPageBuilderOpen(false);
          }}
          user={user}
          siteInfo={siteInfo}
          defaultData={{ ...values?.pageData } as any}
          id={''}
          sections={sections}
          setSections={setSections}
          iniSearchParams={{}}
        />
      </CustomDrawer>
    </Tabs>
  );
};

export default PostForm;
