import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // 👈 this now points to the NEW App.js above
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
