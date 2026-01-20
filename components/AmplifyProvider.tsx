"use client";

import React, { useEffect } from "react";
import "@/lib/amplifyClient";

export default function AmplifyProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
  }, []);
  return <>{children}</>;
}
