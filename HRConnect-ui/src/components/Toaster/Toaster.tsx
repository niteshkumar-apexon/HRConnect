import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Toast = {
  id: string;
  message: string;
  variant?: "success" | "info" | "error";
};

type ToasterContextType = {
  showToast: (message: string, variant?: Toast["variant"]) => void;
};

// Note: This module exports only React components to keep Fast Refresh stable.


const ToasterContext = createContext<ToasterContextType | null>(null);

export const useToaster = () => {
  const ctx = useContext(ToasterContext);
  if (!ctx) throw new Error("useToaster must be used within ToasterProvider");
  return ctx;
};

export const ToasterProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const toast: Toast = { id, message, variant };
    setToasts((prev) => [...prev, toast]);

    // auto-remove after ~3 seconds
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <div
        style={{
          position: "fixed",
          top: 18,
          right: 18,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const bg =
            t.variant === "success"
              ? "rgba(82,196,26,.22)"
              : t.variant === "error"
                ? "rgba(255,77,79,.22)"
                : "rgba(24,144,255,.20)";
          const border =
            t.variant === "success"
              ? "rgba(82,196,26,.55)"
              : t.variant === "error"
                ? "rgba(255,77,79,.55)"
                : "rgba(24,144,255,.55)";
          return (
            <div
              key={t.id}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                color: "#eaf0ff",
                padding: "12px 14px",
                borderRadius: 12,
                boxShadow: "0 18px 60px rgba(0,0,0,.35)",
                maxWidth: 380,
                fontWeight: 700,
                pointerEvents: "none",
              }}
            >
              {t.message}
            </div>
          );
        })}
      </div>
    </ToasterContext.Provider>
  );
};

