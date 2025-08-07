import Link from 'next/link';
import { RaisedButton } from '@/app/widgets/raised_button';
import { FaHome } from 'react-icons/fa';

import { Metadata } from 'next';
import { CustomButton } from '@/app/widgets/custom_button';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist',
};

export default function NotFound() {
  return (
    <div className="flex h-screen">
      <div className="flex flex-col m-auto text-center space-y-10">
        <h2 className="text-2xl font-bold">Not Found</h2>
        <p className="text-gray-600">Could not find requested page</p>

        <Link href="/" passHref>
          <CustomButton icon={<FaHome />} iconPosition="after">
            GO TO HOMEPAGE
          </CustomButton>
        </Link>
      </div>
    </div>
  );
}
