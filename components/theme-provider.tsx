"use client";

import * as React from "react";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/**
 * Applies DevTrace's persisted color mode without rendering an inline script.
 * React 19 does not support the script-in-a-client-component pattern used by
 * next-themes, so keeping this provider local avoids its runtime warning.
 */
function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";

    return window.localStorage.getItem("devtrace-theme") === "light"
      ? "light"
      : "dark";
  });

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const updateTheme = React.useCallback((nextTheme: Theme) => {
    setTheme(nextTheme);
    window.localStorage.setItem("devtrace-theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
}

export { ThemeProvider, useTheme };
