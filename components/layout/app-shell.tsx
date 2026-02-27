"use client";

import type React from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

type AppShellProps = {
  children: React.ReactNode;
};

const isAuthCallbackRoute = (pathname: string | null) => {
  if (!pathname) return false;

  return (
    pathname === "/auth/callback" ||
    pathname.startsWith("/auth/callback/") ||
    pathname === "/auth/google/callback" ||
    pathname === "/auth/apple/callback"
  );
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const hideChrome = isAuthCallbackRoute(pathname);

  if (hideChrome) {
    return <main className="flex-1 min-h-screen">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="animate-fade-in flex-1">{children}</main>
      <Footer />
    </>
  );
}

