# PRD: Agent Canvas

## Introduction

Agent Canvas is an infinite-canvas terminal session viewer built with Vite + React 19 + TypeScript. It provides a pannable, zoomable workspace where users can view, arrange, and manage multiple terminal session panels simultaneously. The application uses zero additional npm dependencies — all interactions rely on native DOM events and React state. The design system uses inline styles referencing a centralized token object, with CSS limited to animations, fonts, and a handful of reusable button/card classes.

## Goals

- Provide an infinite canvas workspace for viewing multiple terminal sessions at once
- Support intuitive mouse-driven interactions: drag panels, resize panels, pan canvas, zoom in/out
- Render terminal output with clear visual distinction between stdin, stdout, stderr, and system lines
- Allow spawning new sessions from predefined templates via a modal interface
- Deliver a polished dark-themed UI with smooth animations and consistent design tokens
- Achieve zero additional npm dependencies beyond React 19 + ReactDOM
- Maintain strict TypeScript type safety across the entire codebase

## TDD Approach

Every user story follows a **test-first** workflow using the existing Vitest + React Testing Library infrastructure:

1. **Write failing tests** — Create or extend test files with tests that cover the story's acceptance criteria
2. **Run tests to confirm failure** — `npm test` must show the new tests failing (red)
3. **Implement the minimum code** to make all tests pass (green)
4. **Run full quality checks** — `npm run typecheck && npm run lint && npm test` must all pass
5. **Verify in browser** (UI stories only) — Use `agent-browser` skill for visual confirmation

### Test Infrastructure

- **Runner:** Vitest 4.x with jsdom environment
- **Rendering:** `@testing-library/react` with `render`, `screen`, `fireEvent`
- **Assertions:** `@testing-library/jest-dom` matchers (e.g., `toBeInTheDocument`)
- **Hook testing:** `renderHook` + `act` from `@testing-library/react`
- **Setup:** `src/test/setup.ts` imports jest-dom matchers
- **Config:** `vite.config.ts` configures `globals: true`, `environment: 'jsdom'`

### Test File Conventions

- All test files live in `src/__tests__/` — named to match their source module (e.g., `helpers.test.ts` tests `utils/helpers.ts`)
- Use `@/` import alias for all imports (e.g., `import { clamp } from '@/utils/helpers'`, `import App from '@/App'`). Configured in `tsconfig.app.json` and `vite.config.ts`.
- Use `describe`/`it` blocks with clear, behavior-driven names
- Test public API and rendered output, not implementation details
- Mock only external dependencies (none expected in this project)

### Story-to-Test Mapping

| Story | Test File(s) in `src/__tests__/` | What to Test |
|-------|----------------------------------|--------------|
| US-001 | — | Scaffold only, no runtime tests |
| US-002 | — | CSS imports, visual verification only |
| US-003 | `theme.test.ts` | T object exports all 19 keys with correct values |
| US-004 | — | TypeScript compilation is the test |
| US-005 | `helpers.test.ts`, `lineFormatting.test.ts` | All pure function return values |
| US-006 | `mockSessions.test.ts` | Array lengths, session structure, template structure |
| US-007 | `useCanvasInteractions.test.ts` | Initial state values, panel initialization |
| US-008 | `useCanvasInteractions.test.ts` (extend) | Drag, resize, pan, zoom handler behavior |
| US-009 | `useCanvasInteractions.test.ts` (extend) | bringToFront, closePanel, tilePanels, spawnSession, resetView |
| US-010 | `Canvas.test.tsx` | DOM structure, data-canvas attributes, transform nesting |
| US-011 | `Toolbar.test.tsx` | Button rendering, click handlers, status text |
| US-012 | `SessionPanel.test.tsx` | Title bar content, traffic lights, active/inactive states |
| US-013 | `SessionPanel.test.tsx` (extend) | Line rendering per type, active indicator |
| US-014 | `SessionPanel.test.tsx` (extend) | Resize handle SVG, mouseDown handler |
| US-015 | `SpawnerModal.test.tsx` | Template cards, click-to-spawn, backdrop close |
| US-016 | `KeyboardHints.test.tsx` | Hint text content, positioning |
| US-017 | — | CSS only, visual verification |

## User Stories

### US-001: Project Scaffold Setup

**Description:** As a developer, I want a clean Vite + React 19 + TypeScript project scaffold with the prescribed directory structure so that all feature modules have a consistent home and the app boots without errors.

**Acceptance Criteria:**
- [ ] `npm create vite@latest . -- --template react-ts` initializes the project successfully
- [ ] All Vite boilerplate is removed (no `App.css`, `index.css`, `assets/`, default SVGs, counter logic)
- [ ] The `src/` directory contains all prescribed files: `main.tsx`, `App.tsx`, `theme.ts`, `types.ts`, `data/mockSessions.ts`, `utils/helpers.ts`, `utils/lineFormatting.ts`, `hooks/useCanvasInteractions.ts`, `components/Canvas.tsx`, `components/Toolbar.tsx`, `components/SessionPanel.tsx`, `components/SpawnerModal.tsx`, `components/KeyboardHints.tsx`, `styles/global.css`
- [ ] `npm run dev` starts the Vite dev server at `localhost:5173` and renders the App component
- [ ] Zero additional npm dependencies are installed beyond `react` and `react-dom`
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-002: External Font Loading

**Description:** As a user, I want the application to load DM Sans for UI chrome and JetBrains Mono for terminal content so that the interface has clear visual distinction between shell output and application controls.

**Acceptance Criteria:**
- [ ] `styles/global.css` includes a CSS `@import` for Google Fonts loading DM Sans (400/500/600/700) and JetBrains Mono (400/500/600/700)
- [ ] UI chrome elements (toolbar, modal text) render in DM Sans
- [ ] Terminal body, status bar, and hint text render in JetBrains Mono
- [ ] Fonts load with `display=swap` to prevent invisible text during loading
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-003: Design Token System

**Description:** As a developer, I want a single centralized `T` token object in `theme.ts` so that all color values are consistent across the app and can be changed from one location, using inline styles exclusively (no CSS variables).

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/theme.test.ts` first** with tests that: verify `T` is exported, has all 19 keys (`bg`, `grid`, `gridDot`, `surface`, `surfaceHover`, `border`, `borderActive`, `accent`, `accentDim`, `accentGlow`, `green`, `greenDim`, `amber`, `red`, `cyan`, `text`, `textDim`, `textMuted`, `overlay`), and each key maps to the correct hex/rgba value from the spec
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] `theme.ts` exports a `const T` object typed with `as const`
- [ ] No CSS variables are used anywhere in the project; all color references go through `T`
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)

### US-004: Type System Definitions

**Description:** As a developer, I want all shared TypeScript interfaces and type aliases defined in `types.ts` so that every module has a single source of truth for data shapes.

**Acceptance Criteria:**
- [ ] Exports `LineType` (`"stdin" | "stdout" | "stderr" | "system"`), `SessionLine` (`{t, v}`), `SessionStatus`, `ShellType`
- [ ] Exports `Session` (`{name, status, shell, cwd, lines}`), `PanelState` (`{id, session, x, y, w, h, z}`)
- [ ] Exports `DragState`, `ResizeState`, `PanState`, `SpawnerTemplate`, `ShellBadgeStyle`
- [ ] Typecheck passes (`npx tsc --noEmit`)

### US-005: Utility Functions

**Description:** As a developer, I want pure utility functions for value clamping, unique ID generation, and terminal line formatting so that these common operations are reusable and consistent.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/helpers.test.ts` first** with tests for: `clamp` returns correct values at boundaries (below min, above max, within range), `uid` returns a string of expected length
- [ ] **TDD: Write `src/__tests__/lineFormatting.test.ts` first** with tests for: `lineColor` returns correct color per LineType, `lineIcon` returns correct character per LineType (`$`, `│`, `!`, `·`), `statusColor` returns correct color per SessionStatus, `shellBadge` returns correct `{bg, fg, label}` per ShellType
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] `helpers.ts` exports `clamp(v, min, max)` returning `Math.max(min, Math.min(max, v))`
- [ ] `helpers.ts` exports `uid()` returning a random string via `Math.random().toString(36).slice(2, 8)`
- [ ] `lineFormatting.ts` exports `lineColor`, `lineIcon`, `statusColor`, `shellBadge` with return values matching spec tables exactly
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)

### US-006: Pre-loaded Mock Sessions

**Description:** As a user, I want to see four pre-loaded terminal sessions when the app first loads so that I can immediately explore the canvas without creating sessions manually.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/mockSessions.test.ts` first** with tests for: `MOCK_SESSIONS` has length 4, each session has correct name/shell/status/line-count (`api-server`: bash/active/8, `git-workflow`: zsh/active/8, `docker-build`: bash/idle/6, `test-runner`: bash/error/5), `SPAWNER_TEMPLATES` has length 4 with correct labels (`blank-bash`, `blank-zsh`, `project-shell`, `node-repl`), each template has shell and description fields
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] `MOCK_SESSIONS` and `SPAWNER_TEMPLATES` exported with correct data
- [ ] On mount, 4 panels are created with cascading positions: `x = 40 + i*60`, `y = 40 + i*50`, w=520, h=380
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-007: Canvas Interaction Hook — State Management

**Description:** As a developer, I want a single `useCanvasInteractions` hook that encapsulates all canvas state so that components remain stateless presentational layers.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/useCanvasInteractions.test.ts` first** with tests using `renderHook` for: initial `panels` has length 4, initial `activeId` is null, initial `zoom` is 1, initial `canvasOffset` is `{x:0, y:0}`, initial `showSpawner` is false, panels have cascading positions (`x=40+i*60`, `y=40+i*50`) and dimensions (520x380), hook returns all expected action functions (`bringToFront`, `closePanel`, `tilePanels`, `spawnSession`, `resetView`, `startDrag`, `startResize`, `startPan`, `handleWheel`, `setShowSpawner`)
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Hook manages `panels`, `activeId`, `dragging`, `resizing`, `panning`, `canvasOffset`, `zoom`, `showSpawner`, and `maxZ` ref
- [ ] Hook initializes panels from 4 mock sessions with correct positions
- [ ] Hook returns all state values and all action/handler functions needed by child components
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)

### US-008: Canvas Pointer Interactions

**Description:** As a user, I want to drag panels by their title bar, resize from a corner handle, pan the canvas background, and zoom with Ctrl/Cmd+scroll so that I can freely arrange and navigate the workspace.

**Acceptance Criteria:**
- [ ] **TDD: Extend `src/__tests__/useCanvasInteractions.test.ts`** with tests for: `handleWheel` with ctrlKey changes zoom by 0.05, zoom clamps to [0.3, 2.0], `handleWheel` without ctrlKey does not change zoom, `startDrag` sets dragging state, `startResize` sets resizing state, `startPan` sets panning state
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Title bar mouseDown initiates drag with zoom-corrected offsets; mousemove updates position; mouseup clears drag
- [ ] Corner handle mouseDown initiates resize; width clamped 320-1200, height clamped 200-900, zoom-corrected
- [ ] Background mouseDown (detected via `data-canvas` attribute) initiates pan; mousemove updates offset; mouseup clears
- [ ] Ctrl/Cmd + wheel adjusts zoom by 0.05 per tick, clamped 0.3-2.0, with `e.preventDefault()`
- [ ] All mousemove/mouseup handlers registered on `window` in useEffect with cleanup on unmount
- [ ] Cursor shows `grabbing` during pan
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-009: Panel Actions (Bring-to-Front, Close, Tile, Spawn, Reset)

**Description:** As a user, I want to bring panels to front, close them, auto-tile in a grid, spawn new sessions, and reset the viewport so that I can efficiently manage my workspace.

**Acceptance Criteria:**
- [ ] **TDD: Extend `src/__tests__/useCanvasInteractions.test.ts`** with tests for: `bringToFront(id)` updates panel z and sets activeId, `closePanel(id)` removes panel from array and clears activeId if matched, `closePanel` is idempotent (nonexistent id does not throw), `tilePanels()` arranges panels in grid with expected positions, `spawnSession(template)` adds a new panel with 2 initial lines and closes spawner, `resetView()` resets offset to (0,0) and zoom to 1
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] `bringToFront(id)` increments maxZ and updates panel z-index, sets activeId
- [ ] `closePanel(id)` removes panel; clears activeId if it was the active panel
- [ ] `tilePanels()` arranges panels in grid (cols=ceil(sqrt(n)), tileW=500, tileH=360, gap=20)
- [ ] `spawnSession(template)` creates panel with uid, random position, 2 initial lines, appends to panels, closes spawner
- [ ] `resetView()` sets offset to (0,0) and zoom to 1
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-010: Infinite Canvas with Dot Grid

**Description:** As a user, I want to navigate an infinite canvas with a subtle dot grid background so that I have spatial context while panning and zooming.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/Canvas.test.tsx` first** with tests for: canvas-area div renders, zoom-layer div has `data-canvas="true"`, pan-layer div has `data-canvas="true"`, 3-level nesting structure exists, canvas renders 4 session panels on mount
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Canvas fills viewport (100vw x 100vh) with `overflow: hidden` and `background: T.bg`
- [ ] Dot grid uses `radial-gradient` with `T.gridDot`, spacing of `24 * zoom` px, moves with pan/zoom
- [ ] Transform structure: canvas-area → zoom-layer (`scale(zoom)`) → pan-layer (`translate(offset)`) → panels
- [ ] zoom-layer and pan-layer carry `data-canvas="true"` for click-through
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-011: Toolbar Controls

**Description:** As a user, I want a persistent toolbar at the top so that I can create sessions, tile panels, reset view, and see session count and zoom level.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/Toolbar.test.tsx` first** with tests for: renders "Agent Canvas" logo text, renders "+ New Session" button, renders "Tile" button, renders "Reset View" button, displays status text with session count and zoom percentage, clicking "+ New Session" calls onNewSession, clicking "Tile" calls onTile, clicking "Reset View" calls onResetView
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Toolbar positioned absolute top, zIndex 9999, gradient background with `backdrop-filter: blur(8px)`
- [ ] Contains: logo (26x26 gradient square with `>_` + "Agent Canvas"), divider, "+ New Session" (primary), "Tile", "Reset View" buttons, spacer, status text
- [ ] "+ New Session" opens spawner modal; "Tile" auto-arranges; "Reset View" resets offset/zoom
- [ ] Status text shows `"{N} session(s) · {zoom}%"` and updates reactively
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-012: Terminal Session Panel Display

**Description:** As a user, I want each terminal session to appear as a draggable, resizable panel with a title bar showing session metadata so that I can arrange my workspace and identify sessions at a glance.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/SessionPanel.test.tsx` first** with tests for: renders session name in title bar, renders 3 traffic light dots (red, amber, green), red dot click calls onClose, renders status dot, renders shell badge with correct label, renders CWD path, clicking panel calls onBringToFront, active panel has accent border styling
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Panel positioned absolutely using PanelState (x, y, w, h, z)
- [ ] Title bar: traffic lights (red=close clickable, amber/green decorative), status dot, session name, shell badge, cwd label
- [ ] Active panels show accent border/shadow glow; inactive panels have muted border/shadow
- [ ] Title bar cursor is `grab`; clicking brings panel to front
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-013: Terminal Output Rendering

**Description:** As a user, I want terminal lines to render with distinct visual styling per line type so that I can quickly distinguish input, output, errors, and system messages.

**Acceptance Criteria:**
- [ ] **TDD: Extend `src/__tests__/SessionPanel.test.tsx`** with tests for: renders all session lines, each line shows correct icon character ($ for stdin, | for stdout, ! for stderr, . for system), stdin lines have purple accent color, stderr lines have text content, active session shows "Working..." text, terminal body renders with expected line count
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Terminal body uses JetBrains Mono at 12.5px, auto-scrolls to bottom on mount
- [ ] Each line has icon column (via `lineIcon()`) and text column
- [ ] stdin: purple accent, fontWeight 500
- [ ] stdout: default text color
- [ ] stderr: red left-border + tinted red background
- [ ] system: italic, dimmed color
- [ ] Active sessions show pulsing purple dot with "Working..." text
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-014: Panel Resize Handle

**Description:** As a user, I want to resize a terminal panel by dragging a corner handle so that I can adjust panel size to show more or less content.

**Acceptance Criteria:**
- [ ] **TDD: Extend `src/__tests__/SessionPanel.test.tsx`** with tests for: resize handle element renders, resize handle contains SVG, mouseDown on resize handle calls onResizeStart
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Resize handle at bottom-right with SVG grip lines
- [ ] Dragging resizes panel: width clamped [320, 1200], height clamped [200, 900]
- [ ] Resize brings panel to front
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-015: New Session Spawner Modal

**Description:** As a user, I want a modal to choose from predefined terminal templates so that I can quickly spawn new session panels.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/SpawnerModal.test.tsx` first** with tests for: renders "New Terminal Session" heading, renders 4 template cards, each card shows template label and shell badge, clicking a template card calls onSpawn with correct template, clicking backdrop calls onClose, clicking inside modal card does not call onClose (stopPropagation)
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Modal shown when "+ New Session" clicked; backdrop at zIndex 10000 with `T.overlay`
- [ ] Clicking backdrop closes modal; clicking inside card does not
- [ ] Modal card: `T.bg` background, borderRadius 14, padding 24, width 420, fadeIn animation
- [ ] Heading "New Terminal Session", subtext, 4 template cards with staggered slideUp animation (delay = i * 0.04s)
- [ ] Cards show template label, shell badge, description; clicking spawns session and closes modal
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-016: Keyboard Hints Strip

**Description:** As a user, I want a hint strip at the bottom of the canvas so that I can discover available interactions.

**Acceptance Criteria:**
- [ ] **TDD: Write `src/__tests__/KeyboardHints.test.tsx` first** with tests for: renders "Drag background to pan" text, renders "scroll to zoom" text, renders "Drag title bar to move" text, renders "Corner handle to resize" text
- [ ] **Tests fail** before implementation (`npm test` shows red)
- [ ] Positioned absolute bottom 12px, centered, zIndex 9999
- [ ] Displays: "Drag background to pan . Cmd/Ctrl + scroll to zoom . Drag title bar to move . Corner handle to resize"
- [ ] Uses JetBrains Mono font, fontSize 10, T.textMuted color
- [ ] **All tests pass** (`npm test` shows green)
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

### US-017: Global CSS — Animations, Scrollbar, Button Classes

**Description:** As a developer, I want global CSS to define keyframe animations, scrollbar styling, and reusable button/card classes so that components can reference them consistently.

**Acceptance Criteria:**
- [ ] Keyframe animations defined: `pulse`, `fadeIn`, `slideUp`
- [ ] Custom scrollbar styling: 5px width, transparent track, `#1a1f2e` thumb
- [ ] CSS classes: `.toolbar-btn` (base + hover), `.toolbar-btn.primary` (accent + hover), `.spawner-option` (base + hover)
- [ ] Global reset: `box-sizing: border-box`, `margin: 0`, body `overflow: hidden`
- [ ] Typecheck passes (`npx tsc --noEmit`)
- [ ] Verify in browser using agent-browser skill

## Functional Requirements

### Foundation

- **FR-01:** The project MUST be bootstrapped using `npm create vite@latest . -- --template react-ts` with zero additional npm dependencies beyond `react` and `react-dom`.
- **FR-02:** The `src/` directory MUST match the prescribed file structure exactly: `main.tsx`, `App.tsx`, `theme.ts`, `types.ts`, `data/mockSessions.ts`, `utils/helpers.ts`, `utils/lineFormatting.ts`, `hooks/useCanvasInteractions.ts`, five component files, and `styles/global.css`.
- **FR-03:** `theme.ts` MUST export a single `as const` object named `T` containing all 20 design tokens. All component styling MUST reference `T` for colors via inline styles; CSS variables MUST NOT be used.
- **FR-04:** `types.ts` MUST export all shared types and interfaces with field names and types matching the spec exactly.
- **FR-05:** `helpers.ts` MUST export `clamp(v, min, max)` and `uid()` functions.
- **FR-06:** `lineFormatting.ts` MUST export `lineColor`, `lineIcon`, `statusColor`, and `shellBadge` — each returning values matching the spec tables exactly.

### Data & State

- **FR-07:** `mockSessions.ts` MUST export `MOCK_SESSIONS` (4 sessions) and `SPAWNER_TEMPLATES` (4 templates) fully conforming to their type definitions.
- **FR-08:** Panel state initialization MUST map each mock session to a `PanelState` with cascading positions (`x = 40 + i*60`, `y = 40 + i*50`), fixed dimensions (520x380), and ascending z values.
- **FR-09:** The `maxZ` counter MUST be a `useRef<number>` (not state) to avoid unnecessary re-renders, initialized to `MOCK_SESSIONS.length + 1`.
- **FR-10:** `useCanvasInteractions` MUST be the sole owner of all mutable canvas state and MUST expose state values plus all action functions as its return value.

### Interactions

- **FR-11:** Panel drag MUST account for current zoom level when computing position offsets and MUST call `e.stopPropagation()` to prevent simultaneous canvas pan.
- **FR-12:** Panel resize MUST clamp width to [320, 1200] and height to [200, 900], with deltas divided by zoom for consistent feel.
- **FR-13:** Canvas zoom MUST only activate when `e.ctrlKey || e.metaKey`, MUST call `e.preventDefault()`, adjust by 0.05 per tick, and clamp to [0.3, 2.0].
- **FR-14:** All `mousemove`/`mouseup` handlers MUST be registered on `window` in a `useEffect` and cleaned up on unmount.
- **FR-15:** The `spawnSession` action MUST atomically create the PanelState, append to panels, set activeId, increment maxZ, and close the spawner modal.
- **FR-16:** The `closePanel` action MUST be idempotent — closing a nonexistent panel must not throw. If `activeId` matches, set to `null`.

### UI Components

- **FR-17:** Canvas MUST render at 100vw x 100vh with 3-level transform nesting: canvas-area → zoom-layer (`scale(zoom)`, `transformOrigin: "0 0"`) → pan-layer (`translate`). Both inner layers MUST have `data-canvas="true"`.
- **FR-18:** Dot grid MUST use `radial-gradient` with `T.gridDot`, spacing `24 * zoom` px, and `background-position` tracking pan offset.
- **FR-19:** Toolbar MUST be positioned absolute top with zIndex 9999, gradient background, `backdrop-filter: blur(8px)`, and contain: logo, divider, 3 buttons, spacer, and reactive status text.
- **FR-20:** SessionPanel MUST render absolutely positioned with title bar (traffic lights, session info, cwd), terminal body (JetBrains Mono 12.5px, auto-scroll), and resize handle (SVG grip).
- **FR-21:** Terminal lines MUST render with icon + text columns. stdin = purple/bold, stderr = red border + tinted bg, system = italic/dim. Active sessions show pulsing dot + "Working..." text.
- **FR-22:** SpawnerModal backdrop MUST be absolute inset 0, zIndex 10000, with `T.overlay`. Modal card: `T.bg`, borderRadius 14, width 420, fadeIn animation. 4 template cards with staggered slideUp.
- **FR-23:** KeyboardHints MUST be absolute bottom 12, centered, zIndex 9999, displaying the 4 hint segments.
- **FR-24:** Z-index layers: panels (1-N dynamic), Toolbar/KeyboardHints (9999), SpawnerModal (10000).

### Cross-Cutting

- **FR-25:** All UI chrome MUST use DM Sans. All terminal content MUST use JetBrains Mono. Both loaded via CSS `@import` from Google Fonts.
- **FR-26:** `global.css` MUST define keyframes (`pulse`, `fadeIn`, `slideUp`), CSS classes (`.toolbar-btn`, `.toolbar-btn.primary`, `.spawner-option` + hovers), scrollbar styling, and a global reset.
- **FR-27:** The entire codebase MUST pass `npx tsc --noEmit` with zero errors at every stage of implementation.

## Non-Goals (Out of Scope)

- No real terminal/shell execution — all sessions display static mock data
- No WebSocket or backend connectivity
- No session persistence or localStorage
- No keyboard shortcuts for panel manipulation (hints are display-only)
- No multi-select or group-drag of panels
- No undo/redo for panel operations
- No responsive/mobile layout — desktop mouse interactions only
- No accessibility features (ARIA, screen reader support) in the initial build

## Design Considerations

- **Dark theme only** — the entire UI uses a dark color palette defined in the `T` token object
- **Inline styles preferred** — CSS classes limited to `global.css` for animations, buttons, and scrollbar
- **Font strategy**: DM Sans for UI chrome, JetBrains Mono for terminal content, loaded via Google Fonts
- **Transform nesting**: 3-level div structure enables independent pan/zoom without recalculating panel positions
- **Traffic lights**: macOS-style window dots (red=close, amber/green decorative) for session panels

## Technical Considerations

- **Zero dependencies**: Only React 19 + ReactDOM. All interactions via native DOM events
- **Single hook architecture**: `useCanvasInteractions` owns all state and interaction logic
- **Zoom-corrected math**: All pointer calculations must divide by zoom to maintain consistent feel
- **Window-level listeners**: mousemove/mouseup must be on window (not element) for reliable drag/resize/pan
- **Ref for maxZ**: Using `useRef` instead of state to avoid re-renders on z-index counter changes
- **Performance**: Inline styles avoid CSS class toggling overhead; `as const` token object enables tree-shaking

## Verification Approach

Every user story follows a test-first workflow and must pass all quality gates before being marked complete:

- **TDD cycle**: For stories with test requirements (US-003, 005–016), write failing tests first, then implement code to make them pass. Stories without test requirements (US-001, 002, 004, 017) skip the TDD cycle.
- **Test suite**: Run `npm test` after every story. All existing tests plus new story tests must pass.
- **Type checking**: Run `npx tsc --noEmit` after every story (all 17) to catch type errors immediately.
- **Lint**: Run `npm run lint` after every story to maintain code quality.
- **Browser verification**: After completing each UI-facing story, use the `agent-browser` skill to visually verify the result at `localhost:5173`. This applies to 13 of 17 stories (US-001, 002, 006, 008, 009, 010–016, 017).
- **Console check**: On visual stories, check the browser console for runtime errors or warnings.
- **Quality gate order**: Tests (red → green) → Typecheck → Lint → Browser verify

## Success Metrics

- `npm test` passes with all test suites green (theme, helpers, lineFormatting, mockSessions, useCanvasInteractions, Canvas, Toolbar, SessionPanel, SpawnerModal, KeyboardHints)
- Application renders 4 mock sessions on first load with no errors in console
- All 5 pointer interactions work smoothly: drag, resize, pan, zoom, bring-to-front
- Spawner modal creates a new panel that integrates seamlessly with existing canvas state
- Tile and Reset View actions execute instantly with correct layout results
- `npx tsc --noEmit` passes with zero errors
- `npm run dev` starts successfully at localhost:5173
- All 13 UI-facing stories are browser-verified via the `agent-browser` skill with no visual regressions

## Open Questions

- Should panel dimensions be preserved or reset when using the Tile action?
- Should there be a maximum number of panels allowed on the canvas?
- Should the zoom percentage display be rounded to the nearest integer or show one decimal place?
- Should closing all panels show an empty state or automatically open the spawner modal?
