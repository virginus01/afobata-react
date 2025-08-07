import React, { useState, useEffect } from 'react';
import { FaLink } from 'react-icons/fa';
import classNames from 'classnames';
import { Shimmer } from '@/app/widgets/shimmer';
import { isNull } from '@/app/helpers/isNull';
import { useCart } from '@/app/contexts/cart_context';
import { useUserContext } from '@/app/contexts/user_context';
import { useBaseContext } from '@/app/contexts/base_context';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import NameSection from '@/app/widgets/name_section';
import { RaisedButton } from '@/app/widgets/raised_button';
import FormInput from '@/app/widgets/hook_form_input';

interface NavItem {
  name: string;
  href: string;
  position: number;
  sub?: NavItem[];
  base?: string;
  action?: string;
  type?: string;
  title?: string;
  id?: string;
  searchParams?: Record<string, any>;
  className?: string;
  silverImage?: string;
}

interface MobileMenuViewProps {
  menu: NavItem[];
  user: UserTypes;
  siteInfo: BrandType;
  rates?: any;
}

const MobileMenuView: React.FC<MobileMenuViewProps> = ({ menu, user, siteInfo, rates }) => {
  const { setIsSwitchProfileOpen } = useUserContext();
  const { addRouteData, removeRouteData } = useBaseContext();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filteredMenu, setFilteredMenu] = useState<NavItem[]>([]);

  // Function to handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
  };

  // Function to search through menu items and their sub-items
  const searchMenuItems = (items: NavItem[], term: string): NavItem[] => {
    if (!term) return items;

    const lowerTerm = term.toLowerCase();

    return items.filter((item) => {
      // Check if the current item matches the search term
      const nameMatch = item.name?.toLowerCase().includes(lowerTerm);
      const titleMatch = item.title?.toLowerCase().includes(lowerTerm);
      const idMatch = item.id?.toLowerCase().includes(lowerTerm);

      // If the current item matches, return it
      if (nameMatch || titleMatch || idMatch) {
        return true;
      }

      // If it has sub-items, check them recursively
      if (item.sub && item.sub.length > 0) {
        const matchedSubItems = searchMenuItems(item.sub, term);
        if (matchedSubItems.length > 0) {
          // Create a copy of the item with only the matching sub-items
          return true;
        }
      }

      return false;
    });
  };

  // Update filtered menu when search term changes
  useEffect(() => {
    if (!menu) return;
    if (!searchTerm) {
      setFilteredMenu(menu);
    } else {
      const results = searchMenuItems(menu, searchTerm);
      setFilteredMenu(results);
    }
  }, [searchTerm, menu]);

  return (
    <div>
      <NameSection user={user} siteInfo={siteInfo} />
      <div className="flex flex-1 items-center justify-center space-x-4">
        <div className="w-full flex flex-row justify-between m-2 items-center">
          <div className="w-full h-8">
            <FormInput
              controlled={false}
              animate={false}
              name="search"
              value={searchTerm}
              onChange={(e: any) => {
                handleSearchChange(e);
              }}
              placeholder="Search menu..."
            />
          </div>

          {siteInfo.type === 'creator' && (
            <RaisedButton
              // icon={
              //   isSwitchProfileOpen ? (
              //     <FaToggleOn className="block h-5 w-5" aria-hidden="true" />
              //   ) : (
              //     <FaToggleOff className="block h-5 w-5" aria-hidden="true" />
              //   )
              // }
              className="animate-pulse h-7"
              size="auto"
              color="auto"
              iconPosition="after"
              onClick={() => {
                // emptyMobileMenu();
                setIsSwitchProfileOpen(true);
              }}
            >
              <div className="h-full py-0.5">Switch Profile</div>
            </RaisedButton>
          )}
        </div>
      </div>

      <div className="w-full my-10 overflow-y-auto">
        {filteredMenu && filteredMenu.length > 0 ? (
          filteredMenu
            .sort((a, b) => a.position - b.position)
            .map((item) => (
              <div key={item.name} className="py-2 border border-b border-gray-200">
                <div
                  className={classNames(
                    'text-gray-800 dark:text-white hover:bg-gray-50 dark:bg-gray-9000 hover:text-gray-800 dark:hover:text-gray-100',
                    'rounded-md px-3 py-1.5 text-xs font-normal flex justify-between items-center cursor-pointer',
                  )}
                  onClick={() => {
                    if (!isNull(item.sub)) {
                      addRouteData({
                        isOpen: true,
                        data: item.sub,
                        id: item.name,
                        base: 'sub_menu',
                        action: 'sub_menu',
                        title: `${item.title ?? item.name}`,
                        name: `${item.title ?? item.name}`,
                        defaultData: item?.sub ?? [],
                      });
                    } else if (item.base && item.action) {
                      addRouteData({
                        isOpen: true,
                        action: item.action!,
                        base: item.base!,
                        type: item.type!,
                        title: item.title || '',
                        rates,
                        slug: item.href || '',
                        searchParams: item.searchParams || {},
                        className: item.className,
                        silverImage: item.silverImage,
                      });
                    } else if (item.href) {
                      removeRouteData();
                      router.push(item.href);
                    } else {
                      removeRouteData();
                      toast.error('page not available');
                    }
                  }}
                  aria-current={'page'}
                >
                  <div className="flex flex-row items-center justify-between w-full">
                    <div className="flex flex-row items-center">
                      <FaLink className="h-3 w-3 mr-2 block text-gray-600 dark:text-white rounded-md text-xs font-normal" />
                      <div> {item.name}</div>
                    </div>
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
                  </div>
                </div>
              </div>
            ))
        ) : searchTerm ? (
          <div className="text-center py-4 text-gray-500">No menu items match your search</div>
        ) : (
          <Shimmer width="full" height="5" length={10} />
        )}
      </div>
    </div>
  );
};

export default MobileMenuView;
