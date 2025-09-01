"use client";

import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => null, // no-op
});

export function ThemeProvider({ children }) {
  // Always apply "dark" class for Tailwind / CSS
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", setTheme: () => null }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
