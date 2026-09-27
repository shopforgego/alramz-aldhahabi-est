import React from 'react';
import { storeConfig } from '../config/store';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({
  className = "h-11 w-auto",
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0 bg-white/95 rounded-xl p-1 shadow-md border border-amber-500/30 flex items-center justify-center overflow-hidden">
        <img
          src="/logo.png"
          alt={storeConfig.storeNameAr}
          className="h-10 w-auto object-contain"
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-base sm:text-lg tracking-tight leading-tight text-white">
            {storeConfig.storeNameAr}
          </span>
          <span className="text-[10px] text-amber-300 font-medium">
            {storeConfig.companyNameAr}
          </span>
        </div>
      )}
    </div>
  );
};
