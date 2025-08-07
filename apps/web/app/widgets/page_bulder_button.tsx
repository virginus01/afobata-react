import React from 'react';
import { LayoutGrid, MousePointerClick, Move } from 'lucide-react';
import { useBaseContext } from '@/app/contexts/base_context';
import { RaisedButton } from '@/app/widgets/raised_button';

const PageBuilderButton = ({ siteInfo, slug }: { siteInfo: BrandType; slug: string }) => {
  const { addRouteData } = useBaseContext();

  return (
    <div className="w-full">
      <RaisedButton
        type="button"
        size="sm"
        className="group relative w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl p-6 rounded-lg overflow-hidden"
      >
        {/* Left Icon */}
        <LayoutGrid className="w-5 h-5 transition-all duration-300 group-hover:scale-110" />

        <span className="font-semibold animate-pulse">Start Visual Page Build</span>

        {/* Right Icons with Animation */}
        <div className="flex items-center gap-1">
          <MousePointerClick className="w-5 h-5 transition-all duration-300 group-hover:translate-y-1 group-hover:translate-x-1" />
          <Move className="w-5 h-5 transition-all duration-300 group-hover:scale-125" />
        </div>

        {/* Animated background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 -translate-x-full group-hover:translate-x-full transition-all duration-1000 ease-in-out" />

        {/* Subtle border glow */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-white blur-md" />
      </RaisedButton>
    </div>
  );
};

export default PageBuilderButton;
