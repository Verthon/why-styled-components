import { type ReactNode } from "react";
import { ThemeProvider } from "styled-components";

const theme = {
  colors: {
    primary: "oklch(54.2% 0.034 322.5)",
  },
  spacing: {
    sm: "8px",
    md: "16px",
    lg: "24px",
  },
};

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};
