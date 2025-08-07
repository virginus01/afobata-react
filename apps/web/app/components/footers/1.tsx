'use client';
import React from 'react';
import Link from 'next/link';
import { route_public_page } from '@/app/routes/page_routes';
import { Logo } from '@/app/widgets/logo';
import { Brand } from '@/app/models/Brand';

interface FooterType {
  siteInfo: Brand;
  auth?: AuthModel;
  user?: UserTypes;
}

const Footer: React.FC<FooterType> = ({ siteInfo, auth, user }) => {
  let footerMenu: Menus[] | undefined =
    siteInfo?.menus?.filter((menu: any) => menu?.position === 'footer') || [];

  return (
    <footer className="mt-10 w-full border-t border-dashed border-gray-200 pt-10 dark:border-gray-800">
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="flex flex-col md:flex-row justify-between px-4 pb-10 space-y-8 md:space-y-0 md:space-x-10">
          {/* Logo */}
          <div className="shrink-0">
            <Logo brand={siteInfo} />
          </div>

          {/* Dynamic Footer Menus */}
          <div className="flex flex-wrap gap-x-10 gap-y-6">
            {footerMenu?.map((menu) => (
              <div key={menu.id} className="min-w-[120px]">
                <h3 className="mb-3 text-sm font-semibold text-inherit uppercase dark:text-white">
                  {menu.name}
                </h3>
                <ul className="text-inherit dark:text-inherit text-sm space-y-2">
                  {menu.links?.map((link) => (
                    <li key={link.id}>
                      <Link href={link.link} className="hover:underline">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="sm:flex sm:items-center sm:justify-between p-2">
          <span className="text-sm text-inherit sm:text-center dark:text-inherit">
            &copy; {new Date().getFullYear()} {siteInfo?.name || ''}. All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <a href="#" className="text-inherit hover:text-inherit dark:hover:text-white">
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 8 19"
              >
                <path
                  fillRule="evenodd"
                  d="M5.5 19V10h3l.5-3.5h-3V4c0-1 .3-1.5 1.5-1.5h1.5V0H6.5C3.5 0 3 2 3 3.5V6H1V10h2v9h2.5z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Facebook page</span>
            </a>
            <a href="#" className="text-inherit hover:text-inherit dark:hover:text-white ms-5">
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 21 16"
              >
                <path d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"></path>
              </svg>
              <span className="sr-only">Discord community</span>
            </a>
            <a href="#" className="text-inherit hover:text-inherit dark:hover:text-white ms-5">
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 17"
              >
                <path
                  fillRule="evenodd"
                  d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.8-2.235 8.344 8.344 0 0 1-2.605.98A4.13 4.13 0 0 0 13.85 0a4.068 4.068 0 0 0-4.1 4.038 4 4 0 0 0 .105.919A11.705 11.705 0 0 1 1.4.734a4.006 4.006 0 0 0 1.268 5.392 4.165 4.165 0 0 1-1.859-.5v.05A4.057 4.057 0 0 0 4.1 9.635a4.19 4.19 0 0 1-1.856.07 4.108 4.108 0 0 0 3.831 2.807A8.36 8.36 0 0 1 0 14.184 11.732 11.732 0 0 0 6.291 16 11.502 11.502 0 0 0 17.964 4.5c0-.177 0-.35-.012-.523A8.143 8.143 0 0 0 20 1.892Z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Twitter page</span>
            </a>
            <a href="#" className="text-inherit hover:text-inherit dark:hover:text-white ms-5">
              <svg
                className="w-4 h-4"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 .25A10.014 10.014 0 0 0 0 10.25a9.975 9.975 0 0 0 6.835 9.479c.5.093.679-.213.679-.475 0-.237-.012-1.022-.012-1.857-2.788.557-3.394-.678-3.605-1.3-.112-.276-.6-1.3-1.024-1.564-.35-.188-.85-.65-.012-.663.788-.012 1.35.726 1.538 1.026.9 1.537 2.338 1.1 2.913.837a1.644 1.644 0 0 1 .487-1.038c-2.462-.275-5.05-1.238-5.05-5.437 0-1.2.425-2.188 1.125-2.95-.112-.275-.5-1.387.112-2.863 0 0 .925-.288 3.037 1.138a10.46 10.46 0 0 1 2.75-.375 10.13 10.13 0 0 1 2.75.375c2.113-1.426 3.038-1.138 3.038-1.138.612 1.476.225 2.588.112 2.863.7.762 1.125 1.75 1.125 2.95 0 4.212-2.6 5.162-5.075 5.437.35.313.55.876.55 1.751 0 1.264-.012 2.287-.012 2.6 0 .263.175.575.688.475A10.025 10.025 0 0 0 20 10.25c0-5.538-4.487-10-10-10Z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">GitHub account</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
