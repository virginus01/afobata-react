import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandList } from '@/components/ui/command';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isNull } from '@/app/helpers/isNull';
import { Overlay } from '@/app/widgets/overlay';
import FormInput from '@/app/widgets/hook_form_input';
import { Card } from '@/components/ui/card';
import { useFormContext } from 'react-hook-form';
import CustomImage from '@/app/widgets/optimize_image';
import { toast } from 'sonner';

interface DropdownItem {
  value: string;
  label?: string;
  name?: string;
  title?: string;
  class?: string;
  id?: string;
  disabled?: boolean;
}

interface DropdownProps {
  items: DropdownItem[];
  onSelect: (value: string | string[]) => void;
  onSearch?: (searchTerm: string) => void;
  id?: string;
  name?: string;
  allowMultiSelect?: boolean;
  selectPlaceholder?: string;
  defaultValues?: string[];
  className?: string;
  labelClass?: string;
  label?: string;
  icon?: any;
  showSearch?: boolean;
  animate?: boolean;
  controlled?: boolean;
  emptyText?: string;
  itemsPerPage?: number;
}

export function SearchableSelect({
  items,
  onSelect,
  onSearch,
  id,
  name,
  allowMultiSelect = false,
  selectPlaceholder = 'Select',
  defaultValues = [],
  className,
  labelClass = 'brand-bg text-xs brand-text',
  label = '',
  icon,
  showSearch = true,
  animate = true,
  controlled = false,
  emptyText = 'No list found.',
  itemsPerPage = 10,
}: DropdownProps) {
  const [searchTerm, setSearchTerm] = useState(''); // Ensure searchTerm is always initialized
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const formContext = useFormContext();

  // Initialize selectedItems based on defaultValues
  const initializeSelectedItems = useCallback(() => {
    if (allowMultiSelect) {
      return items.filter((item) =>
        defaultValues.includes(String(item.value ?? item.id ?? '').toLowerCase()),
      );
    }

    if (defaultValues[0]) {
      let defaultItem: any = null;

      if (!isNull(defaultValues[0])) {
        defaultItem = items.find(
          (item) =>
            String(item.value ?? item.id ?? '').toLowerCase() ===
            String(defaultValues[0]).toLowerCase(),
        );
      }

      return defaultItem ? [defaultItem] : [];
    }

    return [];
  }, [items, defaultValues, allowMultiSelect]);

  const [selectedItems, setSelectedItems] = useState<DropdownItem[]>(initializeSelectedItems());

  // Update selectedItems when defaultValues or items change
  useEffect(() => {
    const newSelectedItems = initializeSelectedItems();
    setSelectedItems(newSelectedItems);
  }, [defaultValues, items, initializeSelectedItems]);

  // Filter items based on search term (searches all items, not just current page)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!item) return false;
      const searchString = String(
        item.label || item.title || item.name || item.value || item.id || '',
      ).toLowerCase();
      return searchString.includes(String(searchTerm).toLowerCase());
    });
  }, [searchTerm, items]);

  // Paginate the filtered items
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Call onSearch only when searchTerm changes
  useEffect(() => {
    if (searchTerm !== undefined) {
      onSearch?.(searchTerm);
    }
  }, [searchTerm, onSearch]);

  const handleSelect = (item: DropdownItem) => {
    if (isNull(item.value || item.id)) {
      setSelectedItems([]);
      onSelect(allowMultiSelect ? [] : '');
      setOpen(false);
      console.info('selection null');
      return;
    }

    if (allowMultiSelect) {
      const alreadySelected = selectedItems.some(
        (selected) => (selected.value ?? selected.id ?? '') === (item.value ?? item.id ?? ''),
      );

      let updatedSelections = [...selectedItems];

      if ((item.value ?? item.id ?? '') === 'all') {
        updatedSelections = items.filter(
          (it) => (it.value ?? it.id ?? '') !== '' && (it.value ?? it.id ?? '') !== 'all',
        );
      } else if (alreadySelected) {
        updatedSelections = selectedItems.filter(
          (selected) => (selected.value ?? selected.id ?? '') !== (item.value ?? item.id ?? ''),
        );
      } else {
        updatedSelections.push(item);
      }

      setSelectedItems(updatedSelections);
      onSelect(updatedSelections.map((selected) => selected.value ?? selected.id ?? ''));
      setSearchTerm(''); // Reset searchTerm after selection
    } else {
      setSelectedItems([item]);
      setSearchTerm(''); // Reset searchTerm after selection
      onSelect(item.value ?? item.id ?? '');
      setOpen(false);
    }
  };

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Then use the context conditionally
  const control = controlled ? formContext?.control : undefined;
  const errors = controlled ? formContext?.formState?.errors : {};
  let errorMessage = '';

  if (!isNull(JSON.stringify(errors))) {
    if (name) {
      if (errors[name ?? '']) {
        errorMessage = String(errors[name]?.message);
      }
    }
  }

  return (
    <div className="flex flex-col w-full space-y-1 text-xs">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="input-group">
            <button
              type="button"
              onClick={toggleDropdown}
              className={` input inline-flex justify-between text-xs items-center w-full px-4 text-gray-700 font-normal border border-gray-300 rounded-md dark:bg-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              aria-haspopup="listbox"
              aria-expanded={open}
              style={{ borderWidth: '1px', borderStyle: 'solid' }}
            >
              <span
                className="mr-1 truncate max-w-xs overflow-hidden whitespace-nowrap py-2 sm:py-2 font-normal text-xs"
                title={
                  selectedItems.length > 0
                    ? allowMultiSelect
                      ? selectedItems
                          .map((item) => item.label || item.name || item.title)
                          .slice(0, 50)
                          .join(', ') + (selectedItems.length > 50 ? '...' : '')
                      : selectedItems[0].label || selectedItems[0].name || selectedItems[0].title
                    : selectPlaceholder
                }
              >
                {selectedItems.length > 0
                  ? allowMultiSelect
                    ? selectedItems
                        .map((item) => item.label || item.name || item.title)
                        .slice(0, 3)
                        .join(', ') +
                      (selectedItems.length > 3
                        ? ` (+${selectedItems.length > 3 ? selectedItems.length - 3 : ''} others)`
                        : '')
                    : selectedItems[0].label || selectedItems[0].name || selectedItems[0].title
                  : selectPlaceholder}
              </span>
              <ChevronsUpDown className="w-3 h-3 opacity-50" />
            </button>

            {animate && (
              <label htmlFor="username" className={`label pointer-events-none text-xs`}>
                <div
                  className={`flex flex-row items-center gap-2 text-xs inset-0 text-gray-700 whitespace-nowrap ${labelClass}`}
                >
                  {icon && <div className="m-0 p-0 text-xs">{icon}</div>}
                  <div className="whitespace-nowrap text-xs">{label}</div>
                </div>
              </label>
            )}
          </div>
        </PopoverTrigger>

        {open && (
          <div className="fixed inset-0 flex items-end sm:items-center justify-end sm:justify-center z-50 text-xs">
            <Overlay
              isOpen={open}
              onClose={() => {
                setOpen(false);
              }}
            />

            <Card
              className="border border-none absolute bg-gray-100 z-50 mt-2 text-xs w-full sm:w-2/4 space-y-1 overflow-hidden rounded-none rounded-tl-xl rounded-tr-xl sm:rounded-tl-none sm:rounded-tr-none sm:rounded-xl flex flex-col flex-grow"
              role="listbox"
            >
              <div className="flex justify-center text-center py-2 font-normal text-gray-500">
                {label}
              </div>

              <Command className="flex-1 flex flex-col pb-28 sm:pb-0 ">
                {showSearch && (
                  <>
                    <div className="m-1">
                      <FormInput
                        labelClass="brand-bg"
                        controlled={false}
                        placeholder={`Search For ${label}`}
                        value={searchTerm || ''} // Ensure value is always controlled
                        onChange={(e: any) => setSearchTerm(e.target.value)}
                        name={''}
                        animate={false}
                      />
                    </div>
                    <div className="border-b border-gray-300 mb-2"></div>
                  </>
                )}

                <CommandList className="flex-1 text-xs overflow-y-auto scrollbar-hide-mobile">
                  {paginatedItems.length > 0 ? (
                    <CommandGroup>
                      {paginatedItems.map((item, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            if (!item.disabled) {
                              handleSelect(item);
                            } else {
                              toast.warning('currently unavailable');
                            }
                          }}
                          className={`block my-2 border border-b border-gray-200 w-full text-left px-4 py-3 rounded-md text-xs sm:text-xs ${
                            item.disabled
                              ? 'text-gray-400'
                              : ' text-gray-800 hover:bg-gray-100 active:bg-[hsl(var(--primary))] cursor-pointer'
                          } ${item.class ?? ''}`}
                          role="option"
                          aria-selected={selectedItems.some(
                            (selected) =>
                              (selected.value ?? selected.id ?? '') ===
                              (item.value ?? item.id ?? ''),
                          )}
                        >
                          <div className="flex flex-row justify-between items-center gap-2">
                            {(item as any)?.imagePath && (
                              <CustomImage
                                height={100}
                                width={100}
                                limitAlt={10}
                                imgFile={
                                  {
                                    id: (item as any)?.imagePath ?? '',
                                    height: 100,
                                    width: 100,
                                  } as any
                                }
                                // link={(item as any)?.imagePath}
                                alt={''}
                                className="w-8 h-8 object-cover rounded-full"
                              />
                            )}

                            <span className="truncate max-w-xs text-xs">
                              {item.label || item.name || item.title}
                            </span>

                            <Check
                              className={cn(
                                'ml-auto w-3 h-3 sm:h-4 sm:w-4',
                                selectedItems.some(
                                  (selected) =>
                                    (selected.value ?? selected.id ?? '') ===
                                    (item.value ?? item.id ?? ''),
                                )
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </CommandGroup>
                  ) : (
                    <CommandEmpty>{emptyText}</CommandEmpty>
                  )}
                </CommandList>

                {/* Pagination Footer */}
                {filteredItems.length > itemsPerPage && (
                  <div className="flex items-center justify-between px-4 py-3 border-t border-gray-300 bg-gray-50">
                    <div className="text-xs text-gray-600">
                      Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)}{' '}
                      - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of{' '}
                      {filteredItems.length}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`p-1 rounded-md transition-colors ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200 cursor-pointer'
                        }`}
                        type="button"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <span className="text-xs text-gray-600 min-w-[60px] text-center">
                        {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`p-1 rounded-md transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-600 hover:bg-gray-200 cursor-pointer'
                        }`}
                        type="button"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </Command>
            </Card>
          </div>
        )}
      </Popover>
      {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
    </div>
  );
}
