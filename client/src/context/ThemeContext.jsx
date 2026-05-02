import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

// Default TechSportia brand — colleges can override these
const DEFAULT_THEME = {
  name: "TechSportia",
  logo: null, // URL to logo image
  primary: "#7C3AED",
  primaryHover: "#6D28D9",
  primaryLight: "rgba(124, 58, 237, 0.15)",
  accent: "#06B6D4",
  accentHover: "#0891B2",
  accentLight: "rgba(6, 182, 212, 0.15)",
  gradient: "linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)",
};

// Example college overrides (for White-Label demo)
export const COLLEGE_THEMES = {
  default: DEFAULT_THEME,
  charusat: {
    name: "CHARUSAT Sports",
    logo: null,
    primary: "#1D4ED8",
    primaryHover: "#1E40AF",
    primaryLight: "rgba(29, 78, 216, 0.15)",
    accent: "#F59E0B",
    accentHover: "#D97706",
    accentLight: "rgba(245, 158, 11, 0.15)",
    gradient: "linear-gradient(135deg, #1D4ED8 0%, #F59E0B 100%)",
  },
};

function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--brand-primary", theme.primary);
  root.style.setProperty("--brand-primary-hover", theme.primaryHover);
  root.style.setProperty("--brand-primary-light", theme.primaryLight);
  root.style.setProperty("--brand-accent", theme.accent);
  root.style.setProperty("--brand-accent-hover", theme.accentHover);
  root.style.setProperty("--brand-accent-light", theme.accentLight);
  root.style.setProperty("--brand-gradient", theme.gradient);
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const switchTheme = (key) => {
    const t = COLLEGE_THEMES[key] || DEFAULT_THEME;
    setTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
