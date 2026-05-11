import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "@fontsource/space-mono/400.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "'DM Sans', sans-serif",
              borderRadius: "12px",
              background: "var(--card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-hover)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#c044e8", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);