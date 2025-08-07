"use client";
import { useBaseContext } from "@/app/contexts/base_context";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import {
  FaBook,
  FaShoppingCart,
  FaTicketAlt,
  FaChalkboardTeacher,
  FaCog,
  FaCubes,
  FaTools,
  FaGift,
} from "react-icons/fa";
import Link from "next/link";
import { login_page, signup_page } from "@/app/routes/page_routes";

export function CreatorHomeWidget({
  siteInfo,
  user,
  auth,
}: {
  siteInfo: BrandType;
  user: UserTypes;
  auth: AuthModel;
}) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftContentRef = useRef<HTMLDivElement | null>(null);
  const rightContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Function to handle animations using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fSlideUp");
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      },
      { threshold: 0.2 } // Trigger when 20% of the element is visible
    );

    // Attach observer to the sections that need animation
    if (leftContentRef.current) observer.observe(leftContentRef.current);
    if (rightContentRef.current) observer.observe(rightContentRef.current);

    return () => observer.disconnect(); // Cleanup observer on component unmount
  }, []);

  return (
    <div>
      <section
        ref={sectionRef}
        className="relative bg-white dark:bg-gray-800 overflow-hidden bg-[url('/images/beams-with.png')] dark:bg-none bg-no-repeat bg-cover bg-center bg-fixed"
      >
        <div className="bg-transparent">
          <div className="navbar-menu hidden fixed top-0 left-0 z-10 w-full h-full bg-coolGray-900 bg-opacity-50">
            <div className="fixed top-0 left-0 bottom-0 w-full lg:w-4/6 max-w-xs bg-white dark:bg-gray-800">
              <a className="navbar-close absolute top-5 p-4 right-3" href="#">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.94004 6L11.14 1.80667C11.2656 1.68113 11.3361 1.51087 11.3361 1.33333C11.3361 1.1558 11.2656 0.985537 11.14 0.860002C11.0145 0.734466 10.8442 0.66394 10.6667 0.66394C10.4892 0.66394 10.3189 0.734466 10.1934 0.860002L6.00004 5.06L1.80671 0.860002C1.68117 0.734466 1.51091 0.663941 1.33337 0.663941C1.15584 0.663941 0.985576 0.734466 0.860041 0.860002C0.734505 0.985537 0.66398 1.1558 0.66398 1.33333C0.66398 1.51087 0.734505 1.68113 0.860041 1.80667L5.06004 6L0.860041 10.1933C0.797555 10.2553 0.747959 10.329 0.714113 10.4103C0.680267 10.4915 0.662842 10.5787 0.662842 10.6667C0.662842 10.7547 0.680267 10.8418 0.714113 10.9231C0.747959 11.0043 0.797555 11.078 0.860041 11.14C0.922016 11.2025 0.99575 11.2521 1.07699 11.2859C1.15823 11.3198 1.24537 11.3372 1.33337 11.3372C1.42138 11.3372 1.50852 11.3198 1.58976 11.2859C1.671 11.2521 1.74473 11.2025 1.80671 11.14L6.00004 6.94L10.1934 11.14C10.2554 11.2025 10.3291 11.2521 10.4103 11.2859C10.4916 11.3198 10.5787 11.3372 10.6667 11.3372C10.7547 11.3372 10.8419 11.3198 10.9231 11.2859C11.0043 11.2521 11.0781 11.2025 11.14 11.14C11.2025 11.078 11.2521 11.0043 11.286 10.9231C11.3198 10.8418 11.3372 10.7547 11.3372 10.6667C11.3372 10.5787 11.3198 10.4915 11.286 10.4103C11.2521 10.329 11.2025 10.2553 11.14 10.1933L6.94004 6Z"
                    fill="#556987"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="pt-10 md:pt-20">
          <div className="flex px-4 justify-between">
            <div className="flex flex-wrap xl:items-center -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-16 md:mb-0">
                <span className="inline-block py-px px-2 mb-4 text-xs leading-5 text-white bg-green-500 uppercase rounded">
                  Become a business owner
                </span>
                <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl leading-tight font-bold tracking-tight">
                  Sell your digital, physical products and courses and earn massively
                </h1>
                <p className="mb-8 text-lg md:text-xl text-coolGray-500 font-medium">
                  A place to upload all your products and get massive search engine visibility. This
                  is the best place to sell and generate massive income as a seller, website owner,
                  and also as an affiliate.
                </p>
                <div className="flex flex-wrap">
                  <div className="w-full md:w-auto py-1 md:py-0 md:mr-4">
                    <Link
                      className="inline-block py-2 px-5 w-full text-base md:text-lg leading-4 text-green-50 font-medium text-center bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 border border-green-500 rounded-md shadow-sm"
                      href={login_page({ subBase: siteInfo.slug! })}
                    >
                      Start Selling
                    </Link>
                  </div>
                  <div className="w-full md:w-auto py-1 md:py-0">
                    <Link
                      className="inline-block py-2 px-5 w-full text-base md:text-lg leading-4 text-coolGray-800 font-medium text-center bg-white dark:bg-gray-800 hover:bg-coolGray-100 focus:ring-2 focus:ring-coolGray-200 focus:ring-opacity-50 border border-coolGray-200 rounded-md shadow-sm"
                      href={"#"}
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              </div>
              <div className="w-full md:w-1/2 px-4">
                <div className="relative mx-auto md:mr-0 max-w-max">
                  <Image
                    width={200}
                    height={200}
                    className="absolute z-[2] -left-14 -top-12 w-28 md:w-auto"
                    src="/images/circle3-yellow.svg"
                    alt=""
                  />
                  <Image
                    width={200}
                    height={200}
                    className="absolute z-[2] -right-7 -bottom-8 w-28 md:w-auto"
                    src="/images/dots3-blue.svg"
                    alt=""
                  />
                  <Image
                    width={500}
                    height={500}
                    className="relative rounded-7xl"
                    src="/images/header.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeaturesSection />
    </div>
  );
}

const FeaturesSection = () => {
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fSlideUp");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 md:pb-32 relative overflow-hidden bg-[url('/images/beams-with.png')] dark:bg-none bg-no-repeat bg-cover bg-center bg-fixed">
      {/* Animated Background Text */}
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <h1 className="text-9xl font-bold animate-pulse text-green-500">Features</h1>
      </div>

      <div className="md:max-w-4xl mb-12 mx-auto text-center relative z-10">
        <span className="inline-block py-px px-2 mb-4 text-xs leading-5 text-green-500 bg-green-100 font-medium uppercase rounded-full shadow-sm">
          Highlights
        </span>
        <h1 className="mb-4 text-3xl md:text-4xl leading-tight font-bold tracking-tighter text-gray-800 dark:text-gray-200">
          An All-In-One Platform for Individuals and Businesses
        </h1>
        <p className="text-lg md:text-xl text-coolGray-500 font-medium dark:text-coolGray-400">
          Effortlessly sell digital products, services, subscriptions, and more — all in one place.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 px-4 mx-auto relative z-10">
        {[
          {
            icon: <FaCubes />,
            title: "Digital Products",
            description: "Sell digital goods effortlessly, from content packs to designs and more.",
          },
          {
            icon: <FaBook />,
            title: "Ebooks",
            description: "Easily sell downloadable and non-downloadable ebooks in any format.",
          },
          {
            icon: <FaChalkboardTeacher />,
            title: "Courses & Memberships",
            description:
              "Host courses with unlimited videos, files, and students, all with content protection.",
          },
          {
            icon: <FaTicketAlt />,
            title: "Event Tickets & Training",
            description: "Sell tickets for events, workshops, training, webinars, and more.",
          },
          {
            icon: <FaCog />,
            title: "Services",
            description:
              "Offer services like coaching, consulting, counseling, and design with ease.",
          },
          {
            icon: <FaGift />,
            title: "Physical Goods",
            description:
              "Sell physical products, from clothing to electronics and everything in between.",
          },
          {
            icon: <FaTools />,
            title: "B2B",
            description:
              "Run a business website without worrying for maintenance; we will do everything as you focus on business growth.",
          },
          {
            icon: <FaShoppingCart />,
            title: "Subscriptions",
            description:
              "Manage recurring payments for subscriptions to digital content or services.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            ref={(el: any) => (featureRefs.current[index] = el)}
            className="group bg-white dark:bg-gray-800 hover:shadow-lg hover:border-green-400 border border-transparent rounded-md transition-all duration-300 p-6 text-center cursor-pointer opacity-0"
          >
            <div className="flex items-center justify-center mb-4 text-white bg-green-500 rounded-full p-4 transition duration-300 group-hover:rotate-6">
              {feature.icon}
            </div>
            <h3 className="mb-2 text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200">
              {feature.title}
            </h3>
            <p className="text-coolGray-500 font-medium dark:text-coolGray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

const TestiMony = ({ siteInfo }: { siteInfo: BrandType }) => {
  return (
    <section className=" bg-[url('/images/beams-with.png')] bg-no-repeat bg-cover bg-center bg-fixed">
      <div className="grid border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 grid-cols-2 lg:grid-cols-4 mx-2">
        <figure className="flex flex-col items-center justify-center p-8 text-center border-b border-gray-200 rounded-t-lg md:rounded-t-none md:rounded-ss-lg md:border-e dark:border-gray-700">
          <blockquote className="max-w-2xl mx-auto text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Very easy this was to integrate
            </h3>
            <p className="my-4">If you care for your time, I hands down would go with this.</p>
          </blockquote>
          <figcaption className="flex items-center justify-center">
            <Image
              className="rounded-full w-9 h-9"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/karen-nelson.png"
              alt="profile picture"
            />
            <div className="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
              <div>Bonnie Green</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Developer at Open AI</div>
            </div>
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center justify-center p-8 text-center border-b border-gray-200 md:rounded-se-lg dark:border-gray-700">
          <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Best for most Businesses
            </h3>
            <p className="my-4">
              Designing with Figma components that can be easily translated to the utility classes
              of Tailwind
            </p>
          </blockquote>
          <figcaption className="flex items-center justify-center">
            <Image
              className="rounded-full w-9 h-9"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png"
              alt="profile picture"
            />
            <div className="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
              <div>Roberta Casas</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Lead designer at Dropbox
              </div>
            </div>
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center justify-center p-8 text-center border-b border-gray-200 md:rounded-es-lg md:border-b-0 md:border-e dark:border-gray-700">
          <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mindblowing workflow
            </h3>
            <p className="my-4">
              Aesthetically, the well designed components are beautiful and will undoubtedly level
              up your next application.
            </p>
          </blockquote>
          <figcaption className="flex items-center justify-center">
            <Image
              className="rounded-full w-9 h-9"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png"
              alt="profile picture"
            />
            <div className="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
              <div>Jese Leos</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Software Engineer at Facebook
              </div>
            </div>
          </figcaption>
        </figure>
        <figure className="flex flex-col items-center justify-center p-8 text-center border-gray-200 rounded-b-lg md:rounded-se-lg dark:border-gray-700">
          <blockquote className="max-w-2xl mx-auto mb-4 text-gray-500 lg:mb-8 dark:text-gray-400">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Efficient Collaborating
            </h3>
            <p className="my-4">
              You have many examples that can be used to create a fast prototype for your team.
            </p>
          </blockquote>
          <figcaption className="flex items-center justify-center">
            <Image
              className="rounded-full w-9 h-9"
              src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png"
              alt="profile picture"
            />
            <div className="space-y-0.5 font-medium dark:text-white text-left rtl:text-right ms-3">
              <div>Joseph McFall</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">CTO at Google</div>
            </div>
          </figcaption>
        </figure>
      </div>
    </section>
  );
};
