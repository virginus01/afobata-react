'use client';
import React, { Fragment, useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/compat/router';
import Image from 'next/image';
import { useUserContext } from '@/app/contexts/user_context';

function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export const AdminNavbar = () => {
  const router = useRouter();
  const [item, setItem] = useState<InfoTypes | null>(null);
  const { nav } = useUserContext();

  return (
    <Disclosure as="nav" className="bg-gray-900 fixed w-full z-10 shadow lg:shadow-none">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Image
                    className="h-8 w-auto"
                    src={item?.logo ?? '/images/logo.png'}
                    alt="Your Company"
                    width={100}
                    height={100}
                    priority
                  />
                </div>
              </div>
              {/*put right menu  */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">Open user menu</span>
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={item?.logo ?? '/images/logo.png'}
                      alt=""
                      width={100}
                      height={100}
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 dark:bg-gray-900' : '',
                            'block px-4 py-2 text-sm text-gray-700',
                          )}
                        >
                          Your Profile
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="#"
                          className={classNames(
                            active ? 'bg-gray-100 dark:bg-gray-900' : '',
                            'block px-4 py-2 text-sm text-gray-700',
                          )}
                        >
                          Settings
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          href="/api/auth/logout"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await fetch('/api/auth/logout', {
                                cache: 'no-store',
                                method: 'POST',
                              });
                            } catch (error) {
                              console.error(error);
                            }

                            router?.push('/login');
                          }}
                          className={classNames(
                            active ? 'bg-gray-100 dark:bg-gray-900' : '',
                            'block px-4 py-2 text-sm text-gray-700',
                          )}
                        >
                          Sign out
                        </Link>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>

          <div className="hidden sm:block z-40 relative">
            <div className="absolute left-0 mr-0 pr-0 z-10 h-screen w-48 lg:w-80 origin-top-left bg-gray-900">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {nav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                      'block rounded-md px-3 py-2 text-base font-medium',
                    )}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <Disclosure.Panel className="sm:hidden">
            <div className="h-screen bg-gray-800 w-2/4 fixed">
              {nav.map((item: any) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                    'block rounded-md px-3 py-2 text-base font-medium',
                  )}
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </a>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
