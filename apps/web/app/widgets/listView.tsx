import React from 'react';
import { FaEllipsisV } from 'react-icons/fa';
import NoData from '@/src/no_data';
import { readableDate } from '@/app/helpers/readableDate';
import { curFormat } from '@/app/helpers/curFormat';
import { isNull } from '@/helpers/isNull';
import { copyToClipboard } from '@/helpers/text';

interface ListViewProps {
  display?: displayProps[];
  data: Record<string, any>[];
  setActiveData: (setActiveData: any) => void;
  selectable?: boolean;
  showActions?: boolean;
}

interface displayProps {
  key: string;
  type?: 'string' | 'date' | 'link' | 'currency';
  title?: string;
  class?: string;
}

const ListView: React.FC<ListViewProps> = ({
  data,
  display,
  selectable,
  showActions,
  setActiveData,
}) => {
  if (!data || data.length === 0) {
    return <NoData text={'No Data Avalaibale'} />;
  }

  const handleSetActiveData = (data: any) => {
    setActiveData(data);
  };

  return (
    <div className="w-full h-full mt-5 border-t border-gray-300 flex flex-col text-xs sm:text-sm">
      {data.map((item, index) => (
        <div
          key={item.id || index}
          className="bg-white border border-b border-gray-200 p-2 hover:cursor-pointer hover:animate-pulse"
          onClick={() => handleSetActiveData(item)}
        >
          <div className="flex flex-row items-start">
            <div className="flex flex-col w-full min-w-0">
              <div className="text-ellipsis overflow-hidden whitespace-nowrap min-w-0">
                {item.title}
              </div>
            </div>

            {showActions && (
              <button
                onClick={() => handleSetActiveData(item)}
                className="w-5 h-5 ml-2 flex-shrink-0"
              >
                <FaEllipsisV className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          <div className="flex flex-row flex-wrap items-center gap-x-2 text-gray-600 mt-1 text-xs py-1 overflow-x-auto scrollbar-hide">
            {display
              ?.map((d, i) => {
                const rawValue = item[d.key];
                if (isNull(rawValue)) return null;

                let value: React.ReactNode;

                switch (d.type) {
                  case 'string':
                    value = rawValue;
                    break;
                  case 'date':
                    value = readableDate(rawValue);
                    break;
                  case 'link':
                    value = (
                      <span
                        onClick={() => copyToClipboard(rawValue)}
                        className="cursor-pointer underline"
                      >
                        {rawValue}
                      </span>
                    );
                    break;
                  case 'currency':
                    value = curFormat(rawValue, item?.currencySymbol ?? '$');
                    break;
                  default:
                    return null;
                }

                // Prefix with title if available
                const content = d.title ? (
                  <span className={d.class} key={i}>
                    <span className=" text-gray-500">{d.title}:</span> {value}
                  </span>
                ) : (
                  <span className={d.class} key={i}>
                    {value}
                  </span>
                );

                return content;
              })
              .filter(Boolean)
              .flatMap((el, idx, arr) =>
                idx < arr.length - 1
                  ? [
                      el,
                      <span key={`sep-${idx}`} className="text-gray-400">
                        •
                      </span>,
                    ]
                  : [el],
              )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;
