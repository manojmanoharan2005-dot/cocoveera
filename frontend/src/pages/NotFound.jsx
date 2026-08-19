import React from 'react';
import SEO from '../components/SEO';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#1a1a1a] font-sans w-full py-12 rounded-xl">
      <SEO 
        title="404 - Page Not Found"
        description="The requested page could not be found."
        noindex={true}
      />
      <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8 px-4">
        
        {/* Window Graphic */}
        <div className="relative w-64 h-48 border-[6px] border-[#4b4b4b] rounded-xl flex flex-col items-center justify-center bg-[#1a1a1a]">
          {/* Top Bar Line */}
          <div className="absolute top-8 left-0 w-full border-t-[6px] border-[#4b4b4b]"></div>
          
          {/* Window Dots */}
          <div className="absolute top-[10px] left-3 flex space-x-1.5">
            <div className="w-2.5 h-2.5 bg-[#4b4b4b] rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-[#4b4b4b] rounded-full"></div>
            <div className="w-2.5 h-2.5 bg-[#4b4b4b] rounded-full"></div>
          </div>

          {/* {404} Text */}
          <div className="mt-8 text-[64px] font-bold text-[#4b4b4b] font-mono tracking-widest flex items-center">
            <span className="mr-1">{'{'}</span>
            <span>404</span>
            <span className="ml-1">{'}'}</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-[22px] font-bold text-[#f5f5f5] mb-2 tracking-wide">Page Not Found</h1>
          <p className="text-[#a3a3a3] text-[15px] max-w-[260px] leading-relaxed">
            Sorry, but we can't find the page you are looking for...
          </p>
        </div>

      </div>
    </div>
  );
};

export default NotFound;
