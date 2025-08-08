import { BrowserRouter as Router } from "react-router-dom";
import { ReactNode } from "react";

interface AppRouterProps {
  children: ReactNode;
}

export function AppRouter({ children }: AppRouterProps) {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      {children}
    </Router>
  );
}
