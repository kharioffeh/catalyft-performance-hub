
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Temporarily disable CSP to test if it's causing issues
// import { applyCSPMetaTag } from "./lib/csp";

// Apply Content Security Policy in production
// if (import.meta.env.PROD) {
//   applyCSPMetaTag();
// }

// Note: Service worker registration removed to fix loading issues

console.log('🏁 Starting React app render...');
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
