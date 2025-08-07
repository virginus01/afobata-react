import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CustomImage from '@/app/widgets/optimize_image';

const CardSelect = ({
  serviceProviders,
  spId,
  onSelect,
}: {
  serviceProviders: any[];
  spId: string;
  onSelect: (value: any) => void;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 160;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full flex items-center my-4">
      <button
        type="button"
        onClick={() => scroll('left')}
        className="absolute left-0 z-10 rounded-full p-1 brand-bg hover:bg-gray-200"
      >
        <ChevronLeft size={20} />
      </button>

      <div
        className="flex flex-row space-x-2 overflow-x-auto scrollbar-hide px-1 md:px-6 mx-6 my-1"
        ref={scrollContainerRef}
      >
        {serviceProviders.map((provider) => {
          const selected = spId === provider.id;
          const noImage = provider?.image === '';
          return (
            <div
              key={provider.id}
              className={`w-16 h-14 flex-shrink-0 rounded-xl border flex items-center justify-center cursor-pointer relative transition-all duration-200 bg-transparent dark:bg-gray-800`}
              onClick={() => {
                if (!selected) {
                  onSelect(provider.id);
                }
              }}
            >
              {noImage ? (
                <span
                  className={`text-xs text-center font-semibold text-gray-700 dark:text-white px-1  ${
                    selected ? 'border-red-700 ring-1 ring-red-600' : 'border-gray-200'
                  } `}
                >
                  {provider.label}
                </span>
              ) : (
                <div
                  className={`relative w-full h-full flex items-center justify-center rounded-xl  ${
                    selected ? 'border-red-700 ring-1 ring-red-600' : 'border-gray-200'
                  } `}
                >
                  <CustomImage
                    height={100}
                    width={100}
                    imgFile={
                      {
                        id: provider?.imagePath ?? '',
                        height: 100,
                        width: 100,
                      } as any
                    }
                    limitAlt={10}
                    // link={provider?.imagePath}
                    alt={provider.label}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div
                    className={`absolute inset-0 bg-transparent ${
                      selected ? 'bg-opacity-5' : 'bg-opacity-20'
                    }  text-gray-100 text-xs font-normal p-0.5 flex items-center justify-center rounded-xl text-center`}
                  >
                    {/* {provider.label} */}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll('right')}
        className=" absolute right-0 z-10 rounded-full p-1 brand-bg hover:bg-gray-200"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default CardSelect;
