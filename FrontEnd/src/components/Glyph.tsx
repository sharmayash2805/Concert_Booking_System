import type { HTMLAttributes } from "react";

export type GlyphName =
  | "music" | "search" | "pin" | "calendar" | "ticket" | "user" | "logout"
  | "menu" | "close" | "plus" | "minus" | "edit" | "delete" | "check"
  | "back" | "next" | "mail" | "lock" | "spinner";

const marks: Record<GlyphName, string> = {
  music: "♪",
  search: "⌕",
  pin: "•",
  calendar: "▦",
  ticket: "▤",
  user: "○",
  logout: "↗",
  menu: "≡",
  close: "×",
  plus: "+",
  minus: "−",
  edit: "✎",
  delete: "×",
  check: "✓",
  back: "←",
  next: "→",
  mail: "@",
  lock: "▣",
  spinner: "◌",
};

interface GlyphProps extends HTMLAttributes<HTMLSpanElement> {
  name: GlyphName;
}

const Glyph = ({ name, className = "", ...props }: GlyphProps) => (
  <span aria-hidden="true" className={`inline-flex items-center justify-center leading-none ${className}`} {...props}>
    {marks[name]}
  </span>
);

export default Glyph;