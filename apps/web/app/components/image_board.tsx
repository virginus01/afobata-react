"use client";
import React from "react";
import Image from "next/image";

export default function image_board({ siteInfo }: { siteInfo: BrandType }) {
  return (
    <div className="hidden w-full h-full flex-1 sm:block">
      <div className="min-h-[100vh] bg-red-400 px-2 flex flex-col">
        <div className="flex-0 flex justify-center items-center py-8">
          <div>
            <div className="text-center text-white text-3xl font-bold">
              Join 800,000+ {siteInfo.name} users today!
            </div>
            <div className="text-center text-white text-xl font-semibold mt-5">
              {siteInfo.name} allows you to buy and sell any kind of digital product or service
              anywhere in the world seamlessly.
            </div>
            <div className="text-center text-white text-xl font-semibold mt-5">
              {siteInfo.name} is backed by a group of search engine experts, meaning your products
              will get ranked on search engines, bringing you potential customers even while you
              sleep.
            </div>
            <div className="text-center text-white text-xl font-semibold mt-5">
              With {siteInfo.name}, buying and selling anything is possible.
            </div>
          </div>
        </div>
        <div className="relative flex-1 w-full h-full mb-10">
          <Image
            src="/images/open.png"
            alt="join"
            layout="fill"
            objectFit="cover"
            className="rounded-md shadow-xl"
          />
        </div>
      </div>
    </div>
  );
}
