import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./i18n/i18n";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Prevent stale cache issues globally
      staleTime: 5 * 60 * 1000,
      retry: false,
    },
  },
});

// ✅ Global: Prevent back-button showing cached protected pages after logout
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
