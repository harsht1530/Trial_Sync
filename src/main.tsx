import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Global fetch interceptor to attach JWT token to all API requests
const originalFetch = window.fetch;
window.fetch = async function (url, init) {
  const token = localStorage.getItem("nexus_token");
  if (token) {
    const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : "";
    // Attach authorization header for API requests
    if (urlStr.includes("/api/") || urlStr.startsWith("/")) {
      init = init || {};
      const headers = new Headers(init.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      init.headers = headers;
    }
  }
  return originalFetch(url, init);
};

createRoot(document.getElementById("root")!).render(<App />);
