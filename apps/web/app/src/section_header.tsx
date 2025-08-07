import React from 'react';
import { RaisedButton } from '@/app/widgets/raised_button';
import { FaBackwardStep } from 'react-icons/fa6';
import { useRouter } from 'next/navigation';
import { PRIMARY_COLOR } from '@/src/constants';
import Image from 'next/image';

interface SectionHeaderProps {
  title: string;
  className?: string;
  children?: React.ReactNode;
  rightWidget?: React.ReactNode;
  sideBarWidget?: React.ReactNode;
  style?: number;
  headerImage?: string;
  bg?: string;
  rounded?: string;
  mx?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  className = '',
  sideBarWidget,
  children,
  rightWidget,
  style = 3,
  headerImage,
  bg = 'bg-gray-100',
  rounded = 'rounded-lg',
  mx = 'mx-2',
}) => {
  switch (style) {
    case 1:
      return (
        <Style1
          title={title}
          headerImage={headerImage}
          bg={bg}
          rounded={rounded}
          mx={mx}
          rightWidget={rightWidget}
          sideBarWidget={sideBarWidget}
        >
          {children}
        </Style1>
      );
    case 2:
      return (
        <Style2 title={title} className={className} rightWidget={rightWidget}>
          {children}
        </Style2>
      );
    case 3:
      return (
        <Style3 rightWidget={rightWidget} title={title}>
          {children}
        </Style3>
      );
    default:
      return (
        <Style3 rightWidget={rightWidget} title={title}>
          {children}
        </Style3>
      );
  }
};

export { SectionHeader };

const Style1: React.FC<SectionHeaderProps> = ({
  title,
  className = '',
  sideBarWidget,
  children,
  rightWidget,
  headerImage,
  bg = 'bg-gray-100',
  rounded = 'rounded-lg',
  mx = 'mx-2',
}) => {
  const router = useRouter();

  return (
    <>
      <div className="relative w-full h-64">
        {headerImage && (
          <Image
            src={`${headerImage}`}
            alt="Background Image"
            fill
            priority
            style={{ objectFit: 'cover', filter: 'brightness(0.4)' }}
            className="absolute inset-0"
          />
        )}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-20">
        <div className={`${bg} dark:bg-gray-900 bg-opacity-[97] ${rounded} shadow-lg w-full mx-2`}>
          <div
            className={`flex flex-row font-bold border-b-2 border-${PRIMARY_COLOR} px-2 my-4 items-center justify-between`}
          >
            <div className={`flex-grow-2`}>{title}</div>

            <div className="flex flex-row h-7">
              <div>{rightWidget && <div className="ml-4">{rightWidget}</div>}</div>
              <RaisedButton icon={<></>} onClick={() => router.refresh()} size="auto" color="auto">
                <div className="text-gray-400">Refresh</div>
              </RaisedButton>
            </div>
          </div>
          <div className="w-full">
            {sideBarWidget ? (
              <div className="flex flex-row">
                <div>{children && <div className={`${mx}`}>{children}</div>}</div>
                <div>{sideBarWidget}</div>
              </div>
            ) : (
              children && <div className={`${mx}`}>{children}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const Style2: React.FC<SectionHeaderProps> = ({ title, className = '', children, rightWidget }) => {
  const router = useRouter();

  return (
    <div className={`flex items-center justify-between mt-2 border-b-4 pb-5 ${className}`}>
      <h1 className="sm:text-xl font-bold">{title}</h1>
      <div className="flex flex-row">
        <div>{rightWidget && <div className="ml-4">{rightWidget}</div>}</div>
        <RaisedButton icon={<FaBackwardStep />} onClick={() => router.refresh()}>
          <div className="text-gray-400">Back</div>
        </RaisedButton>
      </div>
      {children && <div>{children}</div>}
    </div>
  );
};

const Style3: React.FC<SectionHeaderProps> = ({ children, rightWidget, title }) => {
  return (
    <div className="flex flex-col">
      <div className="m-2 mb-4 flex flex-row justify-between items-center">
        {title && <div className="font-semibold">{title.toUpperCase()}</div>}
        {rightWidget && <div className="flex justify-items-end justify-end">{rightWidget}</div>}
      </div>

      <div>{children}</div>
    </div>
  );
};
