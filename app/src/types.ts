export type LineType = "stdin" | "stdout" | "stderr" | "system";

export interface SessionLine {
  t: LineType;
  v: string;
}

export type SessionStatus = "active" | "idle" | "error";
export type ShellType = "bash" | "zsh" | "sh" | "fish";

export interface Session {
  name: string;
  status: SessionStatus;
  shell: ShellType;
  cwd: string;
  lines: SessionLine[];
}

export interface PanelState {
  id: string;
  session: Session;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
}

export interface DragState {
  id: string;
  offX: number;
  offY: number;
}

export interface ResizeState {
  id: string;
  startX: number;
  startY: number;
  startW: number;
  startH: number;
}

export interface PanState {
  startX: number;
  startY: number;
  startOx: number;
  startOy: number;
}

export interface SpawnerTemplate {
  name: string;
  shell: ShellType;
  cwd: string;
  label: string;
  desc: string;
}

export interface ShellBadgeStyle {
  bg: string;
  fg: string;
  label: string;
}
