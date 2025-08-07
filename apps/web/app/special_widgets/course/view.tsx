'use client';
import { api_get_product_by_pin, PRIMARY_COLOR } from '@/app/src/constants';
import { SectionHeader } from '@/app/src/section_header';
import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaEye } from 'react-icons/fa';
import { toast } from 'sonner';
import { RaisedButton } from '@/app/widgets/widgets';
import { useSearchParams } from 'next/navigation';
import { modHeaders } from '@/app/helpers/modHeaders';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

interface CourseDetailsProps {
  data: ProductTypes;
}
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export const CourseDetails: React.FC<CourseDetailsProps> = ({ data }) => {
  const [expandedTitle, setExpandedTitle] = useState<string | null>(null);
  const [readSections, setReadSections] = useState<string[]>([]);

  useEffect(() => {
    const fetchReadSections = async () => {
      const sess: any = {};

      setReadSections(sess.readSections || []);
    };

    fetchReadSections();
  }, []);

  useEffect(() => {
    const updateReadSections = async () => {};

    if (readSections.length > 0) {
      updateReadSections();
    }
  }, [readSections]);

  const handleToggle = (title: string) => {
    setExpandedTitle(expandedTitle === title ? null : title);
  };

  const handleMarkAsRead = (title: string) => {
    if (readSections.includes(title)) {
      setReadSections(readSections.filter((sectionTitle) => sectionTitle !== title));
    } else {
      setReadSections([...readSections, title]);
    }
  };

  const items: FAQItem[] = [];

  for (const mu of data?.multiple!) {
    items.push({ question: mu.title, answer: mu.body });
  }

  return (
    <div className="my-10 sm:mx-40 md:mx-28 mx-5">
      <SectionHeader
        title={String(data.title)}
        className={`mt-2 border-b-4 border-${PRIMARY_COLOR}`}
      >
        <div className="bg-white dark:bg-gray-800 p-2">
          <div>{data.body}</div>
          <div className="space-y-4 mt-10 ">
            {items.map((item) => {
              let extraCss = '';
              let rounded = 'rounded-md';
              if (expandedTitle === item.question) {
                extraCss = `border  ${
                  readSections.includes(item.question)
                    ? ` border-green-300`
                    : `border-${PRIMARY_COLOR}`
                } `;
                rounded = '';
              }
              return (
                <>
                  <div key={item.question} className={`${extraCss}`}>
                    <div
                      onClick={() => handleToggle(item.question)}
                      className={`bg-gray-200 dark:bg-gray-800 ${rounded} px-3 py-2 text-sm font-normal flex justify-between items-center cursor-pointer ${
                        readSections.includes(item.question)
                          ? `bg-gray-100 dark:bg-gray-900 border-1 border-green-500`
                          : 'bg-gray-100 dark:bg-gray-900 border-1 border-red-400'
                      } hover:bg-gray-200 dark:bg-gray-800 transition-colors `}
                    >
                      <div className="flex items-center w-full">
                        <div className="flex-1 min-w-0">
                          <h3 className="sm:text-lg text-sm font-medium text-gray-900 truncate">
                            {item.question}
                          </h3>
                        </div>
                        {readSections.includes(item.question) && (
                          <FaCheckCircle className="mx-5 flex-shrink-0 text-green-500" />
                        )}
                      </div>
                      <span className="text-gray-500">
                        {expandedTitle === item.question ? (
                          <svg
                            width="10"
                            height="7"
                            viewBox="0 0 10 7"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              id="Vector"
                              d="M0.960449 1.30225L4.98025 5.32205L9.00006 1.30225"
                              stroke="#5A648C"
                              strokeWidth="1.37822"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M1.30225 0.960449L5.32205 4.98025L1.30225 9.00006"
                              stroke="#5A648C"
                              strokeWidth="1.37822"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </svg>
                        )}
                      </span>
                    </div>
                    {expandedTitle === item.question && (
                      <div className="p-2 bg-white dark:bg-gray-800 mt-1">
                        <p className="text-gray-700">{item.answer}</p>

                        <div className="mt-5">
                          <RaisedButton
                            size="sm"
                            color={readSections.includes(item.question) ? 'primary' : 'danger'}
                            icon={<FaEye />}
                            iconPosition="after"
                            onClick={() => handleMarkAsRead(item.question)}
                          >
                            {readSections.includes(item.question)
                              ? 'Unmark as Read'
                              : 'Mark as Read'}
                          </RaisedButton>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </SectionHeader>
    </div>
  );
};

interface FullScreenFormProps {
  segs: string; // Adjust the type based on the actual type of segs
}

const ViewCourse: React.FC<FullScreenFormProps> = ({ segs }) => {
  const searchParams = useSearchParams();
  const pin = searchParams.get('pin');

  const [inputValue, setInputValue] = useState(pin);
  const [data, setData] = useState<ProductTypes | null>(null);
  const { siteInfo } = useGlobalEssential();

  useEffect(() => {
    const getCourseNow = async () => {
      if (inputValue) {
        try {
          toast.success('checking');
          const url = await api_get_product_by_pin({
            id: inputValue,
            subBase: siteInfo.slug ?? '',
          });
          const response = await fetch(url, {
            method: 'GET',
            headers: await modHeaders(),
          });

          const res = await response.json();

          if (res.success) {
            setData(res.data);
            toast.success('Success');
          } else {
            toast.error(res.msg);
          }
        } catch (error) {
          toast.error('An error occurred');
        }
      }
    };

    getCourseNow();
  }, [inputValue, siteInfo.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = await api_get_product_by_pin({
        id: String(inputValue),
        subBase: siteInfo.slug ?? '',
      });
      const response = await fetch(url, {
        method: 'GET',
        headers: await modHeaders(),
      });

      const res = await response.json();

      if (res.success) {
        setData(res.data);
        toast.success('Success');
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  return (
    <div>
      {data ? (
        <CourseDetails data={data} />
      ) : (
        <div
          className="min-h-screen bg-cover bg-center"
          style={{ backgroundImage: "url('/images/login.png')" }}
        >
          <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row">
                <div className="m-4">
                  <input
                    className="shadow appearance-none border rounded w-full text-sm py-2 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="input-field"
                    type="text"
                    placeholder="Enter course pin"
                    value={`${inputValue}`}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>
                <div className="m-4">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-2 px-2 rounded focus:outline-none focus:shadow-outline"
                    type="submit"
                  >
                    View Course
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCourse;
