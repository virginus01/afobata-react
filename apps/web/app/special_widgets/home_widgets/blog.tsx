'use client';
import { getDynamicData } from '@/app/helpers/getDynamicData';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function BlogHomeWidget({ siteInfo }: { siteInfo: BrandType }) {
  const [posts, setPost] = useState<PostTypes[] | null>(null);
  const [featuredPost, setFeaturedPost] = useState<PostTypes | null>(null);
  const [popularPosts, setPopularPosts] = useState<PostTypes[] | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<PostTypes[] | null>(null);

  useEffect(() => {
    const getPosts = async () => {
      const { data, isLoading, msg, meta } = await getDynamicData({
        subBase: siteInfo.slug!,
        table: 'posts',
        conditions: {},
      });

      setPost(data);
      setFeaturedPosts(data);
      setPopularPosts(data);
      setFeaturedPost([data] as PostTypes);
    };

    getPosts();
  }, [siteInfo.slug]);

  return (
    <>
      <div className="max-w-screen-lg mx-auto">
        <div className="mt-12">
          <div className="flex flex-wrap md:flex-no-wrap space-x-0 md:space-x-6 mb-16">
            {featuredPost && (
              <div className="mb-4 lg:mb-0  p-4 lg:p-0 w-full md:w-4/7 relative rounded block">
                <Image
                  src="https://images.unsplash.com/photo-1427751840561-9852520f8ce8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"
                  className="rounded-md object-cover w-full h-64"
                  alt={''}
                />
                <span className="text-green-700 text-sm hidden md:block mt-4"> Technology </span>
                <h1 className="text-gray-800 text-4xl font-bold mt-2 mb-2 leading-tight">
                  {featuredPost.title}
                </h1>
                <p className="text-gray-600 mb-4">{featuredPost.description}</p>
                <a
                  href="#"
                  className="inline-block px-6 py-1 rounded-md bg-green-700 text-gray-100"
                >
                  Read more
                </a>
              </div>
            )}

            <div className="w-full md:w-4/7 mt-10">
              {featuredPosts &&
                featuredPosts.map((post: PostTypes, i: number) => {
                  return (
                    <div className="rounded w-full flex flex-col md:flex-row mb-10" key={i}>
                      <Image
                        src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"
                        className="block md:hidden lg:block rounded-md h-64 md:h-32 m-4 md:m-0"
                        alt={''}
                      />
                      <div className="bg-white rounded px-4">
                        <span className="text-green-700 text-sm hidden md:block"> Gadgets </span>
                        <div className="md:mt-0 text-gray-800 font-semibold text-xl mb-2">
                          {post.title}
                        </div>
                        <p className="block md:hidden p-2 pl-0 pt-1 text-sm text-gray-600">
                          {post.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="flex mt-16 mb-4 px-4 lg:px-0 items-center justify-between">
            <h2 className="font-bold text-3xl">Latest news</h2>
            <a className="bg-gray-200 hover:bg-green-200 text-gray-800 px-3 py-1 rounded cursor-pointer">
              View all
            </a>
          </div>
          <div className="block space-x-0 lg:flex lg:space-x-6">
            {posts &&
              posts.map((post: PostTypes, i) => {
                return (
                  <div className="rounded w-full lg:w-1/2  p-4 lg:p-0" key={i}>
                    <Image
                      src="https://images.unsplash.com/photo-1526666923127-b2970f64b422?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"
                      className="rounded"
                      alt="technology"
                    />
                    <div className="p-4 pl-0">
                      <h2 className="font-bold text-2xl text-gray-800">{post.title}</h2>
                      <p className="text-gray-700 mt-2">{post.description}</p>

                      <Link
                        href={`${siteInfo.slug}/${post.slug}`}
                        className="inline-block py-2 rounded text-green-900 mt-2 ml-auto"
                      >
                        {' '}
                        Read more{' '}
                      </Link>
                    </div>
                  </div>
                );
              })}
          </div>

          <div className="rounded flex md:shadow mt-12">
            <Image
              src="https://images.unsplash.com/photo-1579275542618-a1dfed5f54ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"
              className="w-0 md:w-1/4 object-cover rounded-l"
              alt={''}
            />
            <div className="px-4 py-2">
              <h3 className="text-3xl text-gray-800 font-bold">Subscribe to newsletter</h3>
              <p className="text-xl text-gray-700">
                We sent latest news and posts once in every week, fresh from the oven
              </p>
              <form className="mt-4 mb-10">
                <input
                  type="email"
                  className="rounded bg-gray-100 px-4 py-2 border focus:border-green-400"
                  placeholder="john@tech.com"
                />
                <button className="px-4 py-2 rounded bg-green-800 text-gray-100 ml-5">
                  Subscribe
                  <i className="bx bx-right-arrow-alt"></i>
                </button>
                <p className="text-green-900 opacity-50 text-sm mt-1">No spam. We promise</p>
              </form>
            </div>
          </div>

          <div className="flex mt-16 mb-4 px-4 lg:px-0 items-center justify-between">
            <h2 className="font-bold text-3xl">Popular news</h2>
            <a className="bg-gray-200 hover:bg-green-200 text-gray-800 px-3 py-1 rounded cursor-pointer">
              View all
            </a>
          </div>
          <div className="block space-x-0 lg:flex lg:space-x-6">
            {popularPosts &&
              popularPosts.map((post, i) => {
                return (
                  <div className="rounded w-full  lg:w-1/3 p-4 lg:p-0" key={i}>
                    <Image
                      src="https://images.unsplash.com/photo-1526666923127-b2970f64b422?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=900&q=60"
                      className="rounded"
                      alt="technology"
                    />
                    <div className="p-4 pl-0">
                      <h2 className="font-bold text-2xl text-gray-800">{post.title}</h2>
                      <p className="text-gray-700 mt-2">{post.description}</p>

                      <a href="#" className="inline-block py-2 rounded text-green-900 mt-2 ml-auto">
                        {' '}
                        Read more{' '}
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
