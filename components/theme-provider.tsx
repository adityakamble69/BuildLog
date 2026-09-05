"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps next-themes so it toggles the `.dark` class on <html> (the same
 * class BuildLog's Tailwind theme in app/globals.css already keys off).
 * `disableTransitionOnChange` avoids a flash of transitioning colors when
 * the theme switches.
 */
function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}

export { ThemeProvider };
