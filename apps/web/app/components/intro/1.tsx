import { memo } from "react";
import { SectionOption } from "@/app/types/section";

const Intro = ({
  siteInfo,
  user,
  preference = {},
}: {
  siteInfo: BrandType;
  user: UserTypes;
  preference?: Record<string, any>;
}) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="max-w-3xl mx-auto text-center">
        <span className="inline-block py-px px-2 mb-6 text-xs leading-5 text-green-500 bg-green-100 font-medium uppercase rounded-full shadow-sm">
          {preference.highlights ?? "Highlights"}
        </span>
        <div className="mb-6 text-3xl md:text-5xl leading-tight font-bold tracking-tighter dark:text-gray-200">
          {preference.subject ?? "Electronic Top Up"}
        </div>
        <p className="dark:text-coolGray-400 font-medium max-w-2xl mx-auto">
          {preference.description ??
            "Enjoy highly discounted rates on Internet Data Plans, Airtime VTU,  Utility Bills and Convert Airtime to Cash."}
        </p>
      </div>
    </div>
  );
};

export default Intro;
