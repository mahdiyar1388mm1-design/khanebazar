import type { ReactNode } from "react";

export function EmptyState(props: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl" style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--stone-light)" }}>
      <div className="text-6xl mb-4">{props.icon ?? "📭"}</div>
      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-dark)" }}>{props.title}</h3>
      {props.description && (
        <p className="text-sm max-w-md mb-6 leading-7" style={{ color: "var(--text-light)" }}>{props.description}</p>
      )}
      {props.action}
    </div>
  );
}
