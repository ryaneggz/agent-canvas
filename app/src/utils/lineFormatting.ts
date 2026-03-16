import { T } from "../theme";
import type { LineType, SessionStatus, ShellType, ShellBadgeStyle } from "../types";

export const lineColor = (type: LineType): string => {
  switch (type) {
    case "stdin":  return T.accent;
    case "stdout": return T.text;
    case "stderr": return T.red;
    case "system": return T.textDim;
  }
};

export const lineIcon = (type: LineType): string => {
  switch (type) {
    case "stdin":  return "$";
    case "stdout": return "│";
    case "stderr": return "!";
    case "system": return "·";
  }
};

export const statusColor = (status: SessionStatus): string => {
  switch (status) {
    case "active": return T.green;
    case "error":  return T.red;
    default:       return T.textDim;
  }
};

export const shellBadge = (shell: ShellType): ShellBadgeStyle => {
  switch (shell) {
    case "bash": return { bg: "rgba(192,132,252,0.15)", fg: T.accent, label: "bash" };
    case "zsh":  return { bg: "rgba(34,211,238,0.12)",  fg: T.cyan,   label: "zsh" };
    case "sh":   return { bg: "rgba(251,191,36,0.12)",  fg: T.amber,  label: "sh" };
    case "fish": return { bg: "rgba(52,211,153,0.12)",  fg: T.green,  label: "fish" };
  }
};
