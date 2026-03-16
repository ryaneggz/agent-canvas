# Agent Canvas

An infinite-canvas terminal session viewer built with Vite + React 19 + TypeScript. Zero additional npm dependencies — all interactions use native DOM events and React state.

## Quick Start

```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev          # localhost:5173
npx tsc --noEmit     # typecheck
```

## Architecture

Single-page app with an infinite pannable/zoomable canvas containing draggable, resizable terminal session panels. No external UI libraries.

### File Structure

```
src/
├── main.tsx                     # ReactDOM.createRoot → <App />
├── App.tsx                      # Renders <AgentCanvas /> (alias for Canvas)
├── theme.ts                     # Design tokens (T object) — all colors, inline styles only, no CSS variables
├── types.ts                     # All TypeScript interfaces/types
├── data/
│   └── mockSessions.ts          # MOCK_SESSIONS (4 sessions), SPAWNER_TEMPLATES (4 templates)
├── utils/
│   ├── helpers.ts               # clamp(), uid()
│   └── lineFormatting.ts        # lineColor(), lineIcon(), statusColor(), shellBadge()
├── hooks/
│   └── useCanvasInteractions.ts # Single hook: all pointer interactions, state, actions
├── components/
│   ├── Canvas.tsx               # Infinite canvas with dot grid, 3-level transform nesting
│   ├── Toolbar.tsx              # Top bar: logo, new session, tile, reset view, status
│   ├── SessionPanel.tsx         # Terminal window: title bar, traffic lights, terminal body, resize handle
│   ├── SpawnerModal.tsx         # New session modal with template cards
│   └── KeyboardHints.tsx        # Bottom hint strip
└── styles/
    └── global.css               # Fonts, keyframes (pulse, fadeIn, slideUp), scrollbar, button classes
```

### Key Design Decisions

- **Inline styles only** — all colors reference the `T` token object from `theme.ts`. No CSS variables.
- **CSS classes** are limited to `global.css` for: `.toolbar-btn`, `.toolbar-btn.primary`, `.spawner-option`, keyframe animations, and scrollbar styling.
- **Fonts**: DM Sans (UI chrome) and JetBrains Mono (terminal content), loaded via CSS `@import` from Google Fonts.
- **Transform nesting**: Canvas uses 3 nested divs — canvas-area (pan/zoom events, dot grid) → zoom-layer (`scale(zoom)`) → pan-layer (`translate(offset)`) → panels.
- **Z-index layers**: Panels (1–N dynamic), Toolbar (9999), KeyboardHints (9999), SpawnerModal (10000).

### Interaction System (`useCanvasInteractions` hook)

All pointer interactions managed in a single custom hook:

- **Panel drag**: title bar mouseDown → track offset → mousemove updates position
- **Panel resize**: corner handle mouseDown → clamp(w: 320–1200, h: 200–900)
- **Canvas pan**: background mouseDown → translate offset
- **Zoom**: Ctrl/Cmd + wheel → clamp(0.3–2.0)
- **Window-level listeners**: mousemove/mouseup registered on `window` in useEffect, cleaned up on unmount

### Actions

- `bringToFront(id)` — increment maxZ ref, update panel z-index
- `closePanel(id)` — remove panel from array
- `tilePanels()` — auto-arrange in grid (cols = ceil(sqrt(n)), tileW=500, tileH=360, gap=20)
- `spawnSession(template)` — create panel from SpawnerTemplate with 2 initial lines
- `resetView()` — reset offset to (0,0) and zoom to 1

### Types

- `LineType`: `"stdin" | "stdout" | "stderr" | "system"`
- `SessionStatus`: `"active" | "idle" | "error"`
- `ShellType`: `"bash" | "zsh" | "sh" | "fish"`
- `Session`: name, status, shell, cwd, lines
- `PanelState`: id, session, x, y, w, h, z
- `DragState`, `ResizeState`, `PanState`, `SpawnerTemplate`, `ShellBadgeStyle`

### Mock Data

4 pre-loaded sessions on mount: `api-server` (bash/active), `git-workflow` (zsh/active), `docker-build` (bash/idle), `test-runner` (bash/error). Initial positions cascade: `x = 40 + i*60`, `y = 40 + i*50`, all at w=520, h=380.

4 spawner templates: `blank-bash`, `blank-zsh`, `project-shell`, `node-repl`.

## Implementation Notes

- Specs are in `specs/01-scaffold.md` through `specs/10-hints-css.md` — follow them exactly for colors, sizes, and behavior.
- Each spec has acceptance criteria that must pass.
- The `data-canvas="true"` attribute on zoom-layer and pan-layer allows click-through for panning.
- Active sessions show a pulsing purple dot with "Working..." text.
- stderr lines get red left-border + tinted background; stdin lines are purple-accented.
- The spawner modal template cards have staggered slideUp animation (`delay = i * 0.04s`).
- Traffic light dots in session title bar: red (close, clickable), amber, green (decorative).
