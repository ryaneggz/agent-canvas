# Agent Canvas

An infinite-canvas terminal session viewer built with Vite + React 19 + TypeScript. Zero additional npm dependencies beyond React — all interactions use native DOM events and React state.

## Project Layout

```
├── app/                         # Vite + React application
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/                     # Application source code
├── specs/                       # Implementation specs (01–10)
├── docs/                        # Documentation
├── CLAUDE.md                    # This file
└── AGENTS.md -> CLAUDE.md       # Symlink
```

## Quick Start

```bash
cd app
npm install
npm run dev          # localhost:5173
npx tsc --noEmit     # typecheck
npm test             # vitest
npm run lint         # eslint
```

## App Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |
| `npm run test:coverage` | Vitest with coverage |

## Architecture

Single-page app with an infinite pannable/zoomable canvas containing draggable, resizable terminal session panels. No external UI libraries.

### App File Structure (`app/src/`)

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
├── styles/
│   └── global.css               # Fonts, keyframes (pulse, fadeIn, slideUp), scrollbar, button classes
├── test/
│   └── setup.ts                 # Vitest setup (@testing-library/jest-dom)
└── __tests__/                   # All test files live here
    ├── App.test.tsx             # Smoke test
    ├── theme.test.ts            # Token object key/value assertions
    ├── mockSessions.test.ts     # Array lengths, session structure, template structure
    ├── helpers.test.ts          # clamp boundary tests, uid format tests
    ├── lineFormatting.test.ts   # Return value assertions per type/status/shell
    ├── useCanvasInteractions.test.ts # renderHook tests: init state, actions, interactions
    ├── Canvas.test.tsx          # DOM structure, data-canvas attributes, panel rendering
    ├── Toolbar.test.tsx         # Button rendering, click handlers, status text
    ├── SessionPanel.test.tsx    # Title bar, traffic lights, line rendering, resize handle
    ├── SpawnerModal.test.tsx    # Template cards, click-to-spawn, backdrop close
    └── KeyboardHints.test.tsx   # Hint text content
```

### Key Design Decisions

- **Import alias `@/`** — all imports use `@/` to reference `src/` (e.g., `import { T } from '@/theme'`). Configured in `tsconfig.app.json` (paths) and `vite.config.ts` (resolve.alias). Never use relative paths like `../` or `./` for cross-module imports.
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

## Testing (TDD)

This project follows a **test-first (TDD)** workflow. Tests are written before implementation for every story that has testable runtime behavior.

### Infrastructure

- **Runner:** Vitest 4.x with `jsdom` environment (`globals: true`)
- **Rendering:** `@testing-library/react` — `render`, `screen`, `fireEvent`
- **Assertions:** `@testing-library/jest-dom` matchers (`toBeInTheDocument`, etc.)
- **Hook testing:** `renderHook` + `act` from `@testing-library/react`
- **Setup:** `src/test/setup.ts` imports jest-dom matchers globally
- **Config:** `vite.config.ts` — `test.environment: 'jsdom'`, `test.setupFiles: './src/test/setup.ts'`

### Conventions

- **Centralized `__tests__/` folder** — all test files live in `src/__tests__/`, named to match their source (e.g., `helpers.test.ts` tests `utils/helpers.ts`, `Canvas.test.tsx` tests `components/Canvas.tsx`)
- **Behavior-driven names** — use `describe`/`it` blocks with clear intent (e.g., `it('returns T.accent for stdin type')`)
- **Test public API** — assert on rendered output and return values, not implementation details
- **No mocks** — zero external dependencies means no mocking needed; test real modules directly
- **Use `@/` import alias** — all imports use `@/` to reference `src/` (e.g., `import { clamp } from '@/utils/helpers'`, `import App from '@/App'`). Configured in both `tsconfig.app.json` (paths) and `vite.config.ts` (resolve.alias).

### TDD Workflow (per story)

1. **Write failing tests** covering the story's acceptance criteria
2. **Run `npm test`** — confirm new tests fail (red)
3. **Implement** the minimum code to make tests pass (green)
4. **Run full quality gate** — `npm run typecheck && npm run lint && npm test`
5. **Browser verify** (UI stories) — `agent-browser` skill at `localhost:5173`

### Quality Gate Order

Tests (red → green) → Typecheck → Lint → Browser verify

### Pre-commit Hooks

Husky + lint-staged automatically runs `vitest related --run` on staged `*.{ts,tsx}` files, so broken tests block commits.

## Implementation Notes

- Specs are in `specs/01-scaffold.md` through `specs/10-hints-css.md` — follow them exactly for colors, sizes, and behavior.
- Each spec has acceptance criteria that must pass.
- The `data-canvas="true"` attribute on zoom-layer and pan-layer allows click-through for panning.
- Active sessions show a pulsing purple dot with "Working..." text.
- stderr lines get red left-border + tinted background; stdin lines are purple-accented.
- The spawner modal template cards have staggered slideUp animation (`delay = i * 0.04s`).
- Traffic light dots in session title bar: red (close, clickable), amber, green (decorative).
