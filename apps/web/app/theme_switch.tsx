import { useEffect, useState } from "react";

export default function useDarkMode(): [string, (theme: string) => void] {
  const [theme, setTheme] = useState<string>(
    typeof window !== "undefined" ? localStorage.theme || "light" : "light"
  );
  const colorTheme = theme === "dark" ? "light" : "dark";

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(colorTheme);
    root.classList.add(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme, colorTheme]);

  return [colorTheme, setTheme];
}
