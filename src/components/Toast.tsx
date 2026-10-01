import { useEffect, useState } from "react";

type Toast = { id: string; message: string; type: "success" | "error" | "info" };

let push: (t: Omit<Toast, "id">) => void = () => {};

export function toast(message: string, type: Toast["type"] = "info") {
  push({ message, type });
}

export function ToastContainer() {
  const [items, setItems] = useState<Toast[]>([]);

  useEffect(() => {
    push = (t) => {
      const id = Math.random().toString(36).slice(2);
      setItems((arr) => [...arr, { ...t, id }]);
      setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== id)), 3500);
    };
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {items.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-fade-in
            ${t.type === "success" ? "text-white" : ""}
            ${t.type === "error" ? "text-white" : ""}
            ${t.type === "info" ? "text-white" : ""}
          `}
          style={{
            backgroundColor: t.type === "success" ? "#2D6A4F" : t.type === "error" ? "var(--burgundy)" : "var(--royal-blue)",
            border: `1px solid ${t.type === "success" ? "#40916C" : t.type === "error" ? "var(--burgundy-light)" : "var(--gold-dark)"}`,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
