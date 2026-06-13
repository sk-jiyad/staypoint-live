import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import "./index.css";
import App from "./App.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  // eslint-disable-next-line no-console
  console.error("Missing VITE_CLERK_PUBLISHABLE_KEY — set it in your env / Vercel project settings.");
}

// Theme Clerk's widgets (modal sign-in, UserButton, /login page) to match the board.
const clerkAppearance = {
  variables: {
    colorPrimary: "#1a1812",
    colorText: "#1a1812",
    colorBackground: "#fcfaf2",
    colorInputBackground: "#fcfaf2",
    colorInputText: "#1a1812",
    borderRadius: "0px",
    fontFamily: "'Archivo', system-ui, sans-serif",
  },
  elements: {
    card: { border: "2px solid #1a1812", boxShadow: "0 14px 28px -16px rgba(26,24,18,.35)" },
    formButtonPrimary: { textTransform: "uppercase", letterSpacing: "0.12em" },
  },
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={clerkAppearance}
      >
        <App />
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
