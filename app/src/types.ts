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
  partialLine?: string;
}

export interface PanelState {
  id: string;
  session: Session;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  live?: boolean;
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

// WebSocket message types

export type WsClientMessage =
  | { type: 'session.create'; id: string; shell: ShellType; cwd: string; cols?: number; rows?: number }
  | { type: 'session.input'; id: string; data: string }
  | { type: 'session.resize'; id: string; cols: number; rows: number }
  | { type: 'session.clear'; id: string }
  | { type: 'session.close'; id: string };

export type WsServerMessage =
  | { type: 'session.output'; id: string; data: string | string[]; remove?: number }
  | { type: 'session.partial'; id: string; data: string }
  | { type: 'session.exit'; id: string; code: number }
  | { type: 'session.error'; id: string; error: string };
