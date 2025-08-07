'use client';
import { useState } from 'react';
import { Filter, SortAsc, SortDesc } from 'lucide-react';
import { FaSearch } from 'react-icons/fa';
import FormInput from '@/app/widgets/hook_form_input';
import { CustomButton } from '@/app/widgets/custom_button';
import { Data } from '@/app/models/Data';
import { isNull } from '@/app/helpers/isNull';

interface FilterSortSearchBarProps {
  originalData: any[]; // immutable original data source
  setData: React.Dispatch<React.SetStateAction<any[]>>;
  onSearch: (phrase: any) => void;
  searchableKeys?: (keyof Data)[];
  sortableKeys?: (keyof Data)[];
  placeholder?: string;
}

const FilterSortSearchBar = ({
  originalData,
  setData,
  searchableKeys = ['title', 'description', 'type'],
  sortableKeys = ['title', 'price', 'sales', 'views'],
  placeholder = 'Search...',
  onSearch,
}: FilterSortSearchBarProps) => {
  const [searchPhrase, setSearchPhrase] = useState('');
  const [sortKey, setSortKey] = useState<keyof Data>(sortableKeys[0]);
  const [sortAsc, setSortAsc] = useState(true);
  const [filterType, setFilterType] = useState<string>('');

  const applyFilterSortSearch = ({
    keyword = searchPhrase,
    selectedSortKey = sortKey,
    sortAscending = sortAsc,
    typeFilter = filterType,
  }: {
    keyword?: string;
    selectedSortKey?: keyof Data;
    sortAscending?: boolean;
    typeFilter?: string;
  }) => {
    let filtered = [...originalData];

    // 🔍 Search
    if (keyword.trim()) {
      filtered = filtered.filter((item) =>
        searchableKeys.some((key) => {
          const value = item[key];
          return typeof value === 'string' && value.toLowerCase().includes(keyword.toLowerCase());
        }),
      );
    }

    // 🧃 Filter by `type`
    if (typeFilter) {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // 🔃 Sort
    filtered.sort((a, b) => {
      const aValue = a[selectedSortKey];
      const bValue = b[selectedSortKey];
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortAscending ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });

    setData(filtered);
  };

  const handleSearch = (searchPhrase: string) => {
    //  applyFilterSortSearch({ keyword: searchPhrase });
    onSearch(searchPhrase);
  };

  const handleSortChange = (key: keyof Data) => {
    setSortKey(key);
    applyFilterSortSearch({ selectedSortKey: key });
  };

  const handleSortDirectionToggle = () => {
    setSortAsc((prev) => !prev);
    applyFilterSortSearch({ sortAscending: !sortAsc });
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    applyFilterSortSearch({ typeFilter: value });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Top bar: icons + search */}
      <div className="flex flex-row space-x-4 justify-between p-2 items-center">
        <div className="flex space-x-2 items-center">
          {/* Filter dropdown */}
          <div className="flex items-center space-x-1">
            <Filter className="h-4 w-4 text-gray-500" />
            {/* <select
              className="text-xs border rounded px-2 py-1"
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
            >
              <option value="">All Types</option>
              {[...new Set(originalData.map((d) => d.type))].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select> */}
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center space-x-1">
            {sortAsc ? (
              <SortAsc
                className="h-4 w-4 text-gray-500 cursor-pointer"
                onClick={handleSortDirectionToggle}
              />
            ) : (
              <SortDesc
                className="h-4 w-4 text-gray-500 cursor-pointer"
                onClick={handleSortDirectionToggle}
              />
            )}
            {/* <select
              className="text-xs border rounded px-2 py-1"
              value={sortKey as string}
              onChange={(e) => handleSortChange(e.target.value as keyof Data)}
            >
              {sortableKeys.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select> */}
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 h-7">
          <FormInput
            className="h-full w-full"
            controlled={false}
            type="text"
            id="advanced-search-input"
            placeholder={placeholder}
            labelClass="bg-gray-100"
            label="search"
            onBlur={(e) => {
              setSearchPhrase(e.target.value);
              if (isNull(e.target.value)) {
                handleSearch('');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(searchPhrase);
              }
            }}
            name="search"
            animate={true}
          />
          <div className="w-9 h-full">
            <CustomButton
              className="w-full h-full"
              id="advanced-search-button"
              iconPosition="after"
              onClick={() => handleSearch(searchPhrase)}
            >
              <FaSearch />
            </CustomButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSortSearchBar;
