'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ProductsLists } from '@/app/special_widgets/home_widgets/products_list';
import { useGlobalEssential } from '@/app/contexts/global_essential_context';

export function StoreHomeWidget() {
  const { siteInfo } = useGlobalEssential();

  const sectionRef = useRef<HTMLElement | null>(null);
  const leftContentRef = useRef<HTMLDivElement | null>(null);
  const rightContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Function to handle animations using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fSlideUp');
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      },
      { threshold: 0.2 }, // Trigger when 20% of the element is visible
    );

    // Attach observer to the sections that need animation
    if (leftContentRef.current) observer.observe(leftContentRef.current);
    if (rightContentRef.current) observer.observe(rightContentRef.current);

    return () => observer.disconnect(); // Cleanup observer on component unmount
  }, []);

  return (
    <section ref={sectionRef} className="relative mx-2 sm:mx-5">
      <StoreHeader siteInfo={(siteInfo as any) ?? {}} />
      <ProductsLists siteInfo={(siteInfo as any) ?? {}} />
    </section>
  );
}

const StoreHeader = ({ siteInfo }: { siteInfo: BrandType }) => {
  // Correctly typing the refs array as an array of HTMLDivElement or null
  const storeHeaderRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Function to handle the appearance of elements when they enter the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fSlideUp');
            observer.unobserve(entry.target); // Stop observing once the animation is triggered
          }
        });
      },
      { threshold: 0.2 }, // Trigger when 20% of the element is visible
    );

    // Observe each feature card
    storeHeaderRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect(); // Cleanup observer on component unmount
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="flex flex-col md:flex-row bg-white dark:bg-gray-800 shadow-lg rounded-md justify-between items-center p-4 md:p-4">
        <div className="w-full md:w-2/6 flex justify-center md:justify-start mb-4 md:mb-0">
          <Image
            src={siteInfo?.logo?.publicUrl || '/images/placeholder.png'}
            alt={''}
            width={100}
            height={100}
            className="w-20 h-20 md:w-24 md:h-24 object-contain"
          />
        </div>
        <div className="flex flex-col text-center md:text-left w-full md:w-4/6">
          <div className="text-lg font-bold mb-2">Welcome to {siteInfo.name}</div>
          <div className="text-sm md:text-base">
            This is your home for quality digital and physical products, including services. Enjoy
            exploring our vast array of offerings, tailored to meet your needs. We strive to provide
            you with an unparalleled shopping experience.
          </div>
        </div>
      </div>
    </div>
  );
};
