"use client";

/**
 * Providers — global client wrappers.
 * SessionProvider is no longer needed (no next-auth/react).
 * Only Sonner, ThemeProvider, etc. live here.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}