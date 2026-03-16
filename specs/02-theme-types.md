# 02 — Design Tokens & Type Definitions

> Define the color system and all TypeScript interfaces used across the app.

## `src/theme.ts` — Design Tokens

Export a single `T` object. Every color in the app references this. No CSS variables — inline styles only.

```ts
export const T = {
  bg:           "#08090c",
  grid:         "rgba(255,255,255,0.018)",
  gridDot:      "rgba(255,255,255,0.06)",
  surface:      "#0e1118",
  surfaceHover: "#131720",
  border:       "#1a1f2e",
  borderActive: "#2d3548",
  accent:       "#c084fc",       // purple — primary accent
  accentDim:    "rgba(192,132,252,0.15)",
  accentGlow:   "rgba(192,132,252,0.25)",
  green:        "#34d399",       // status: active, success lines
  greenDim:     "rgba(52,211,153,0.12)",
  amber:        "#fbbf24",       // diff lines, idle dots
  red:          "#f87171",       // errors, close button
  cyan:         "#22d3ee",       // info highlights
  text:         "#e2e8f0",       // primary text
  textDim:      "#64748b",       // secondary text
  textMuted:    "#475569",       // tertiary text / hints
  overlay:      "rgba(8,9,12,0.85)",
} as const;
```

## `src/types.ts` — Type Definitions

```ts
export type LineType = "stdin" | "stdout" | "stderr" | "system";

export interface SessionLine {
  t: LineType;
  v: string;     // display text, may contain \n for multi-line
}

export type SessionStatus = "active" | "idle" | "error";
export type ShellType = "bash" | "zsh" | "sh" | "fish";

export interface Session {
  name: string;
  status: SessionStatus;
  shell: ShellType;
  cwd: string;          // working directory displayed in title bar
  lines: SessionLine[];
}

export interface PanelState {
  id: string;        // uid()
  session: Session;
  x: number;         // canvas-space X
  y: number;         // canvas-space Y
  w: number;         // width in px (min 320, max 1200)
  h: number;         // height in px (min 200, max 900)
  z: number;         // z-index layer
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
```

## Acceptance Criteria

- [ ] `T` object exported from `theme.ts` with all tokens above
- [ ] All interfaces/types exported from `types.ts`
- [ ] Typecheck passes
