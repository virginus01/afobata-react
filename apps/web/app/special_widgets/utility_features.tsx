'use client';
import { useBaseContext } from '@/app/contexts/base_context';
import React, { useEffect, useRef, useState } from 'react';
import { service_page } from '@/app/routes/utility_pages_routes';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getImgUrl } from '@/app/helpers/getImgUrl';
import { isNull } from '@/app/helpers/isNull';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export function UtilityFeatures({
  siteInfo,
  user,
  auth,
}: {
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
}) {
  const { addRouteData } = useBaseContext();
  const router = useRouter();
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [onRouteData, setOnRouteData] = useState<OnRouteModel>({
    isOpen: false,
    base: '',
    action: '',
    slug: '',
  });

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
      { threshold: 0.1 }, // Trigger when 20% of the element is visible
    );

    // Observe each feature card
    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect(); // Cleanup observer on component unmount
  }, []);
  return (
    <div>
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mx-1 relative">
        {/* Feature Card */}
        {[
          {
            image: '/utility/data.jpg',
            title: 'Buy & Resell Data Bundles',
            type: 'data',
            description:
              'Start enjoying this very low rates for your internet browsing databundle.',
          },
          {
            image: '/utility/airtime.jpg',
            title: 'Buy Airtime',
            type: 'airtime',
            description: `Enjoy huge discount when you purchase airtime on ${siteInfo.name}`,
          },
          {
            image: '/utility/cable.jpg',
            title: 'CableTV Subscription',
            type: 'tv',
            description: 'Instant recharge of DStv, GOtv and Startimes e.t.c.',
          },
          {
            image: '/utility/electric.jpg',
            title: 'Pay Electricity Bill',
            type: 'electric',
            description: 'Pay you electricity bill online e.g. EKEDC, IKEDC, AEDC, PHEDC e.t.c.',
          },
          {
            image: '/utility/education.jpg',
            title: 'Educational Services',
            type: 'education',
            description: 'Here is home for all education services',
          },
          {
            image: '/utility/waec-epin.jpg',
            title: 'Buy WAEC E-Pin',
            type: 'education',
            description: 'Buy WAEC e-pin for Verification & Registration',
          },
          {
            image: '/utility/jamb-epin.jpg',
            title: 'Buy JAMB E-Pin',
            type: 'education',
            description: 'Buy JAMB e-pin for UTME & Direct Entry (DE)',
          },
          {
            image: '/utility/recharge-card-printing.png',
            title: 'Start your own recharge card printing business today',
            type: 'printing',
            description:
              'Manage recurring payments for subscriptions to digital content or services.',
            disable: true,
          },
        ].map((feature, index) => (
          <Card
            className="cursor-pointer border border-none"
            onClick={() => {
              if (feature.disable) {
                toast.warning('temporarily unavailable');
                return;
              }
              if (!isNull(user)) {
                addRouteData({
                  isOpen: true,
                  silverImage: feature.image,
                  action: feature.type,
                  base: 'utility',
                  title: feature.title,
                  slug: service_page({
                    subBase: siteInfo.slug!,
                    action: feature.type,
                  }),
                });
              } else {
                toast.info("You're not logged");
              }
            }}
            key={index}
            ref={(el: any) => (featureRefs.current[index] = el)}
          >
            <CardContent className="relative w-full h-32 overflow-hidden rounded-t-md  text-center items-center justify-center">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getImgUrl({
                    id: feature.image,
                    height: 200,
                    width: 200,
                  })})`,
                  filter: 'brightness(0.5)',
                }}
              ></div>
              <CardHeader className="relative z-10 mb-2 font-bold text-white px-4 py-6 tex-sm">
                {feature.title}
              </CardHeader>
            </CardContent>
            <CardFooter className="text-coolGray-500 font-medium p-2 dark:text-white tex-xs">
              {feature.description}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
