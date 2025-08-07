import React from "react";

interface CenteredSectionProps {
  heading: string;
  children: React.ReactNode;
  className?: string; // Custom class for flexibility
  headingClassName?: string; // Custom class for heading
  cardClassName?: string; // Custom class for the card
  subTitle?: string;
}

export const CenteredSection: React.FC<CenteredSectionProps> = ({
  heading,
  subTitle,
  children,
  className = "",
  headingClassName = "",
  cardClassName = "",
}) => {
  return (
    <section
      className={`h-screen flex flex-col justify-center items-center ${className} px-5`}
      aria-labelledby="section-heading"
    >
      <div
        id="section-heading"
        className={`text-xl font-extrabold leading-snug text-gray-900 dark:text-white text-center mb-1 ${headingClassName}`}
      >
        {heading}
      </div>

      <div className="flex justify-center items-center w-full max-w-lg text-center my-5">
        {subTitle && <i className="text-sm text-center">{subTitle}</i>}
      </div>

      <div
        className={`w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:border dark:border-gray-700 ${cardClassName}`}
      >
        <div className="w-full p-6 space-y-4 md:space-y-6 sm:p-8">
          {children}
        </div>
      </div>
    </section>
  );
};
