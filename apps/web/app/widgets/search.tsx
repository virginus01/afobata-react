import React from 'react';
import { RaisedButton } from '@/app/widgets/widgets';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'sonner';
import FormInput from '@/app/widgets/hook_form_input';

export const Search: React.FC<any> = () => {
  return (
    <div className="h-full mx-4 sm:mx-2">
      <div className="flex justify-between items-center">
        <FormInput
          animate={false}
          label="Search"
          labelClass="bg-transparent"
          controlled={false}
          className=""
          defaultValue=""
          name="search"
          id="saerch"
          placeholder="search for products and services"
          onChange={() => {
            toast.info('search temporarily unavailable');
          }}
        />

        <RaisedButton
          size="auto"
          color="auto"
          iconPosition="after"
          className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white m-2"
          onClick={() => {
            toast.info('search temporarily unavailable');
          }}
        >
          <div className="p-1">
            <FaSearch />
          </div>
        </RaisedButton>
      </div>
    </div>
  );
};
