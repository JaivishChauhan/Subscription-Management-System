"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";

/**
 * Conditionally renders the header based on the current route.
 * Excludes header from auth pages and admin panel (they have their own layouts).
 */
export function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on auth pages or admin panel
  const hideHeader = 
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/internal");
  
  if (hideHeader) {
    return null;
  }
  
  return <Header />;
}
