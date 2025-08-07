import React from 'react';
import { CustomButton } from '@/app/widgets/custom_button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // Hide if only one page

  return (
    <div className="flex justify-center items-center mt-4 space-x-5 h-6">
      <div className="w-16 h-6">
        <CustomButton
          className={`shadow-none text-xs ${
            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          icon={<ArrowLeft className="h-3 w-3" />}
          iconPosition="before"
        >
          Prev
        </CustomButton>
      </div>
      <span className="text-xs">
        Page {currentPage} of {totalPages}
      </span>
      <div className="w-16 h-6">
        <CustomButton
          className={`shadow-none text-xs ${
            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          icon={<ArrowRight className="h-3 w-3" />}
          iconPosition="after"
        >
          Next
        </CustomButton>
      </div>
    </div>
  );
};

export default Pagination;
