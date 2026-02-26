"use client";

import React from "react";
import { IOSLoader } from "@/components/ui/ios-loader";
import { cn } from "@/lib/utils";

interface RefreshingDesignLoaderProps {
  fullScreen?: boolean;
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const RefreshingDesignLoader: React.FC<RefreshingDesignLoaderProps> = ({
  fullScreen = true,
  className,
  text = "REFRESHING DESIGN",
  size = "xl",
}) => {
  const iosSizeMap = {
    sm: "sm" as const,
    md: "md" as const,
    lg: "lg" as const,
    xl: "xl" as const,
  };

  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-5", className)}>
      <IOSLoader
        size={iosSizeMap[size]}
        color="text-red-700"
        fullScreen={false}
      />
      <p className="text-[11px] font-medium tracking-[0.35em] text-white/55 uppercase">
        {text}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xl">
        {content}
      </div>
    );
  }

  return content;
};
