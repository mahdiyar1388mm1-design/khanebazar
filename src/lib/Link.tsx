import type { CSSProperties, ReactNode } from "react";
import { buildPath, navigate, type Route } from "./router";

export function Link(props: {
  to: Route;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  title?: string;
  style?: CSSProperties;
}) {
  const href = buildPath(props.to);
  return (
    <a
      href={href}
      className={props.className}
      title={props.title}
      style={props.style}
      onClick={(e) => {
        // اجازه‌ی باز کردن در تب جدید (ctrl/cmd/shift/middle-click)
        if (e.metaKey || e.ctrlKey || e.shiftKey || (e as any).button === 1) return;
        e.preventDefault();
        props.onClick?.();
        navigate(props.to);
      }}
    >
      {props.children}
    </a>
  );
}
