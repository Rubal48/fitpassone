import React, { createContext, useContext, useState } from "react";
import { CheckCircle, XCircle, Info } from "lucide-react";

// Create a new context
const ToastContext = createContext();

// Hook so you can use the toast anywhere
export const useToast = () => useContext(ToastContext);

// Provider that wraps your entire app
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Function to show a toast
  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000); // hides after 3 s
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toasts appear here */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-fade-in 
              ${
                toast.type === "success"
                  ? "bg-green-600"
                  : toast.type === "error"
                  ? "bg-red-600"
                  : "bg-blue-600"
              }`}
          >
            {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
            {toast.type === "error" && <XCircle className="w-5 h-5" />}
            {toast.type === "info" && <Info className="w-5 h-5" />}
            {toast.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </ToastContext.Provider>
  );
};
