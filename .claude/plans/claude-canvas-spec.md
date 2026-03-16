# Claude Code Canvas — Vite Implementation Spec

> **Goal**: Reproduce an infinite-canvas workspace where users spawn, drag, resize, and manage mock Claude Code terminal sessions. Single-page React + TypeScript app scaffolded with Vite.

---

## 1. Project Scaffold

```bash
npm create vite@latest claude-code-canvas -- --template react-ts
cd claude-code-canvas
npm install
```

### File Structure

```
claude-code-canvas/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                  # ReactDOM.createRoot → <App />
│   ├── App.tsx                   # Renders <ClaudeCodeCanvas />
│   ├── theme.ts                  # T color tokens object
│   ├── types.ts                  # All TypeScript interfaces
│   ├── data/
│   │   └── mockSessions.ts      # MOCK_SESSIONS array + spawner templates
│   ├── utils/
│   │   ├── helpers.ts            # clamp(), uid()
│   │   └── lineFormatting.ts     # lineColor(), lineIcon(), statusColor(), modelBadge()
│   ├── hooks/
│   │   └── useCanvasInteractions.ts  # drag / resize / pan / zoom state machine
│   ├── components/
│   │   ├── Canvas.tsx            # Infinite canvas with dot grid + zoom transform
│   │   ├── Toolbar.tsx           # Top bar: logo, buttons, session count
│   │   ├── SessionPanel.tsx      # Individual terminal window (title bar + body + resize handle)
│   │   ├── SpawnerModal.tsx      # "New Session" overlay with template cards
│   │   └── KeyboardHints.tsx     # Bottom-center hint strip
│   └── styles/
│       └── global.css            # @font-face imports, keyframes, scrollbar, resets
```

### Dependencies

**Zero additional npm dependencies.** Only React 19 + ReactDOM (bundled with the Vite template). All interactions are implemented with native DOM events and React state. No drag libraries, no canvas libraries.

### External Resources (loaded via CSS `@import`)

```
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap
```

- **DM Sans** (400/500/600/700) — UI chrome, toolbar, modal text
- **JetBrains Mono** (400/500/600/700) — terminal body, status bar, hints

---

## 2. Design Tokens (`theme.ts`)

Export a single `T` object. Every color in the app references this. No CSS variables — inline styles with the `T` object.

```ts
export const T = {
  bg:           "#08090c",
  grid:         "rgba(255,255,255,0.018)",
  gridDot:      "rgba(255,255,255,0.06)",
  surface:      "#0e1118",
  surfaceHover: "#131720",
  border:       "#1a1f2e",
  borderActive: "#2d3548",
  accent:       "#c084fc",       // purple — primary accent, Opus badge
  accentDim:    "rgba(192,132,252,0.15)",
  accentGlow:   "rgba(192,132,252,0.25)",
  green:        "#34d399",       // status: active, success lines
  greenDim:     "rgba(52,211,153,0.12)",
  amber:        "#fbbf24",       // diff lines, idle dots
  red:          "#f87171",       // errors, close button
  cyan:         "#22d3ee",       // tool lines, Sonnet badge
  text:         "#e2e8f0",       // primary text
  textDim:      "#64748b",       // secondary text
  textMuted:    "#475569",       // tertiary text / hints
  overlay:      "rgba(8,9,12,0.85)",
} as const;
```

---

## 3. Type Definitions (`types.ts`)

```ts
export type LineType = "prompt" | "think" | "tool" | "output" | "diff" | "success" | "error";

export interface SessionLine {
  t: LineType;
  v: string;     // display text, may contain \n for multi-line
}

export type SessionStatus = "active" | "idle" | "error";
export type ModelTier = "opus" | "sonnet" | "haiku";

export interface Session {
  name: string;
  status: SessionStatus;
  model: ModelTier;
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
  model: ModelTier;
  prompt: string;
  label: string;
  desc: string;
}

export interface ModelBadgeStyle {
  bg: string;
  fg: string;
  label: string;
}
```

---

## 4. Mock Data (`data/mockSessions.ts`)

### 4 Pre-loaded Sessions

On app mount, create 4 panels from these sessions. Initial positions cascade: `x = 40 + i*60`, `y = 40 + i*50`, all at `w=520, h=380`.

| # | `name` | `status` | `model` | Line count |
|---|--------|----------|---------|------------|
| 0 | `orchestra-api` | `active` | `opus` | 9 lines |
| 1 | `mcp-integration` | `active` | `sonnet` | 8 lines |
| 2 | `docker-sandbox` | `idle` | `haiku` | 6 lines |
| 3 | `landing-page` | `error` | `sonnet` | 5 lines |

#### Session 0: `orchestra-api` (Opus, active)

```
prompt  > Fix the WebSocket reconnection logic in src/ws/handler.ts
think   Looking at the WebSocket handler...
tool    Read src/ws/handler.ts
output  Found the issue — the reconnection backoff resets on every\nattempt instead of accumulating. Fixing now...
tool    Edit src/ws/handler.ts (lines 47-63)
diff    - reconnectDelay = BASE_DELAY;\n+ reconnectDelay = Math.min(reconnectDelay * 2, MAX_DELAY);
output  Applied exponential backoff. Also added jitter to prevent\nthundering herd on server restart.
tool    Run npm test -- --grep websocket
success ✓ 12 tests passed (0.8s)
```

#### Session 1: `mcp-integration` (Sonnet, active)

```
prompt  > Add MCP tool registration to the agent router
think   Analyzing the current agent routing architecture...
tool    Read src/agents/router.py
tool    Read src/mcp/registry.py
output  I'll add a tool discovery phase to the router that queries\nthe MCP registry before dispatching to agents.
tool    Edit src/agents/router.py (lines 28-45)
diff    + async def discover_tools(self, session_id: str):\n+     registry = MCPRegistry(self.config)\n+     return await registry.list_tools(session_id)
output  Now wiring the discovery into the dispatch pipeline...
```

#### Session 2: `docker-sandbox` (Haiku, idle)

```
prompt  > Set up the Squid proxy config for sandboxed containers
tool    Read docker/squid.conf
output  Current config allows all outbound traffic. Locking down\nto allowlisted domains only.
tool    Edit docker/squid.conf
diff    - http_access allow all\n+ acl allowed_domains dstdomain .github.com .pypi.org .npmjs.org\n+ http_access allow allowed_domains\n+ http_access deny all
success ✓ Proxy config updated. Containers now restricted.
```

#### Session 3: `landing-page` (Sonnet, error)

```
prompt  > Fix the hero animation on the Ruska AI landing page
tool    Read src/components/Hero.tsx
output  The Framer Motion variant is triggering before fonts load,\ncausing a layout shift. Adding a font-ready gate...
tool    Edit src/components/Hero.tsx (lines 12-30)
error   Error: Cannot find module 'framer-motion'\nDid you mean to import from 'motion/react'?
```

### 4 Spawner Templates

Available from the "New Session" modal:

| `name` | `model` | `prompt` | `label` | `desc` |
|---------|---------|----------|---------|--------|
| `blank-session` | `opus` | `Ready.` | Blank (Opus) | Empty session with Claude Opus |
| `code-review` | `sonnet` | `Review the latest PR for issues` | Code Review | PR review with Sonnet |
| `debug-session` | `opus` | `Debug the failing test suite` | Debug | Interactive debugging session |
| `refactor` | `haiku` | `Refactor utils/ for cleaner abstractions` | Refactor (Haiku) | Quick refactor pass |

Spawned sessions get 2 initial lines: `{ t: "prompt", v: "> {template.prompt}" }` and `{ t: "think", v: "Starting up..." }`.

---

## 5. Utility Functions (`utils/`)

### `helpers.ts`

```ts
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const uid = () => Math.random().toString(36).slice(2, 8);
```

### `lineFormatting.ts`

#### `lineColor(type: LineType) → string`

| Type | Color |
|------|-------|
| `prompt` | `T.accent` (`#c084fc`) |
| `think` | `T.textDim` (`#64748b`) |
| `tool` | `T.cyan` (`#22d3ee`) |
| `output` | `T.text` (`#e2e8f0`) |
| `diff` | `T.amber` (`#fbbf24`) |
| `success` | `T.green` (`#34d399`) |
| `error` | `T.red` (`#f87171`) |

#### `lineIcon(type: LineType) → string`

| Type | Icon |
|------|------|
| `prompt` | `❯` |
| `think` | `◌` |
| `tool` | `⚙` |
| `output` | `│` |
| `diff` | `±` |
| `success` | `✓` |
| `error` | `✗` |

#### `statusColor(status: SessionStatus) → string`

- `"active"` → `T.green`
- `"error"` → `T.red`
- anything else → `T.textDim`

#### `modelBadge(model: ModelTier) → ModelBadgeStyle`

| Model | `bg` | `fg` | `label` |
|-------|------|------|---------|
| `opus` | `rgba(192,132,252,0.15)` | `T.accent` | `"Opus"` |
| `sonnet` | `rgba(34,211,238,0.12)` | `T.cyan` | `"Sonnet"` |
| `haiku` | `rgba(251,191,36,0.12)` | `T.amber` | `"Haiku"` |

---

## 6. Canvas Interaction System (`hooks/useCanvasInteractions.ts`)

A single custom hook managing all pointer-based interactions. Returns state + handlers consumed by the canvas and panels.

### State

| Variable | Type | Default | Purpose |
|----------|------|---------|---------|
| `panels` | `PanelState[]` | 4 initial panels from mock data | All panel positions/sizes |
| `activeId` | `string \| null` | `null` | Currently focused panel |
| `dragging` | `DragState \| null` | `null` | Active drag operation |
| `resizing` | `ResizeState \| null` | `null` | Active resize operation |
| `canvasOffset` | `{ x: number; y: number }` | `{ x: 0, y: 0 }` | Pan offset |
| `panning` | `PanState \| null` | `null` | Active pan operation |
| `zoom` | `number` | `1` | Zoom level (range: 0.3–2.0) |
| `showSpawner` | `boolean` | `false` | Spawner modal visibility |
| `maxZ` | `useRef<number>` | `MOCK_SESSIONS.length + 1` | Next z-index counter |

### Interactions

#### Panel Drag (title bar `onMouseDown`)

1. `e.stopPropagation()` — prevent canvas pan
2. `bringToFront(id)` — increment `maxZ.current`, update panel's `z`
3. Set `dragging = { id, offX: e.clientX - (p.x + canvasOffset.x) * zoom, offY: e.clientY - (p.y + canvasOffset.y) * zoom }`
4. On `mousemove`: `x = (e.clientX - dragging.offX) / zoom - canvasOffset.x`, same for `y`
5. On `mouseup`: clear `dragging`

#### Panel Resize (corner handle `onMouseDown`)

1. `e.stopPropagation()` — prevent drag/pan
2. `bringToFront(id)`
3. Set `resizing = { id, startX: e.clientX, startY: e.clientY, startW: p.w, startH: p.h }`
4. On `mousemove`:
   - `w = clamp(startW + (e.clientX - startX) / zoom, 320, 1200)`
   - `h = clamp(startH + (e.clientY - startY) / zoom, 200, 900)`
5. On `mouseup`: clear `resizing`

#### Canvas Pan (background `onMouseDown`)

1. Trigger only when `e.target === canvasRef.current || e.target.dataset.canvas`
2. Set `activeId = null`
3. Set `panning = { startX: e.clientX, startY: e.clientY, startOx: canvasOffset.x, startOy: canvasOffset.y }`
4. On `mousemove`: `offset.x = startOx + (e.clientX - startX) / zoom`, same for `y`
5. On `mouseup`: clear `panning`
6. Cursor: `grabbing` while panning, `default` otherwise

#### Zoom (`onWheel` on canvas)

1. Only trigger when `e.ctrlKey || e.metaKey`
2. `e.preventDefault()`
3. `zoom = clamp(zoom + (deltaY > 0 ? -0.05 : 0.05), 0.3, 2.0)`

#### All `mousemove`/`mouseup` handlers

Registered as `window`-level event listeners in a `useEffect`. Must be cleaned up on unmount. The `handleMouseMove` callback must be recreated when `dragging`, `resizing`, `panning`, `zoom`, or `canvasOffset` change (include in `useCallback` deps).

### Actions

#### `bringToFront(id: string)`

Increment `maxZ.current`, set that panel's `z` to new value, set `activeId`.

#### `closePanel(id: string)`

Filter panel from array. If `activeId === id`, set `activeId = null`.

#### `tilePanels()`

Auto-arrange all panels in a grid:
- `cols = Math.ceil(Math.sqrt(panels.length))`
- Per panel: `x = (i % cols) * (tileW + gap) + 30 - canvasOffset.x`
- `y = Math.floor(i / cols) * (tileH + gap) + 30 - canvasOffset.y`
- Constants: `tileW = 500`, `tileH = 360`, `gap = 20`

#### `spawnSession(template: SpawnerTemplate)`

1. Increment `maxZ.current`
2. Create new `PanelState` with:
   - `id`: `uid()`
   - `session`: `{ name: template.name, status: "active", model: template.model, lines: [prompt, think] }`
   - `x`: `100 + Math.random() * 200 - canvasOffset.x`
   - `y`: `100 + Math.random() * 150 - canvasOffset.y`
   - `w`: 520, `h`: 380, `z`: `maxZ.current`
3. Append to panels, set `activeId`, close spawner

#### `resetView()`

Set `canvasOffset = { x: 0, y: 0 }` and `zoom = 1`.

---

## 7. Component Specifications

### 7.1 `Canvas.tsx` — Infinite Canvas Container

**Root element**: `div` filling `100vw × 100vh`, `overflow: hidden`, `background: T.bg`, `position: relative`.

**Dot grid background**: Applied to the canvas `div` (not root):
- `backgroundImage`: `radial-gradient(circle, ${T.gridDot} 1px, transparent 1px)`
- `backgroundSize`: `${24 * zoom}px ${24 * zoom}px`
- `backgroundPosition`: `${canvasOffset.x * zoom}px ${canvasOffset.y * zoom}px`
- This makes dots move with pan and scale with zoom.

**Transform structure** (3 nested divs):
```
div[canvas-area]  ← receives mouseDown (pan), onWheel (zoom), has dot grid
  div[zoom-layer] ← transform: scale(zoom), transformOrigin: "0 0"
    div[pan-layer] ← transform: translate(canvasOffset.x px, canvasOffset.y px)
      {panels.map → <SessionPanel />}
```

Both the zoom-layer and pan-layer get `data-canvas="true"` so clicks pass through for panning.

### 7.2 `Toolbar.tsx` — Top Navigation Bar

**Position**: `absolute`, `top: 0`, `left: 0`, `right: 0`, `zIndex: 9999`.

**Background**: `linear-gradient(180deg, rgba(8,9,12,0.95) 0%, rgba(8,9,12,0.8) 80%, transparent 100%)` with `backdropFilter: blur(8px)`.

**Padding**: `10px 16px`. **Layout**: `flex`, `align-items: center`, `gap: 10`.

**Contents (left to right)**:

1. **Logo block** (marginRight: 8):
   - 26×26px rounded square (borderRadius: 6), gradient fill `linear-gradient(135deg, T.accent, T.cyan)`, contains `⌘` character (fontSize: 13, fontWeight: 700, white).
   - Label: "Claude Code Canvas" — fontSize: 14, fontWeight: 700, color: `T.text`, letterSpacing: "-0.3px".

2. **Divider**: 1×20px, `background: T.border`, margin: "0 4px".

3. **"+ New Session" button**: Class `toolbar-btn primary`. Accent-tinted background.
   - `background: T.accentDim`, `border-color: rgba(192,132,252,0.3)`, `color: T.accent`
   - Hover: `background: rgba(192,132,252,0.25)`

4. **"⊞ Tile" button**: Standard `toolbar-btn`.

5. **"⌂ Reset View" button**: Standard `toolbar-btn`. Calls `resetView()`.

6. **Spacer**: `flex: 1`.

7. **Status text**: Right-aligned. `"{panels.length} session(s) · {Math.round(zoom * 100)}%"`. JetBrains Mono, fontSize: 11, color: `T.textMuted`.

**`toolbar-btn` base style**: `border: 1px solid T.border`, `background: T.surface`, `color: T.textDim`, `padding: 6px 12px`, `borderRadius: 6px`, `fontSize: 12px`, `cursor: pointer`, `display: flex`, `align-items: center`, `gap: 5px`, `transition: all 0.15s`, `font-family: DM Sans`.
Hover: `background: T.surfaceHover`, `color: T.text`, `border-color: T.borderActive`.

### 7.3 `SessionPanel.tsx` — Terminal Window

**Outer container**: `position: absolute`, placed at `left: position.x`, `top: position.y`, `width: size.w`, `height: size.h`, `zIndex` from panel state. `borderRadius: 10`, `border: 1px solid`, `overflow: hidden`, `userSelect: none`, `display: flex`, `flexDirection: column`.

- **Active border**: `T.borderActive` | **Inactive**: `T.border`
- **Active shadow**: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px T.borderActive, 0 0 30px T.accentGlow`
- **Inactive shadow**: `0 4px 20px rgba(0,0,0,0.4)`
- Shadow transition: `box-shadow 0.2s`
- `background: T.surface`
- `onMouseDown` on outer div → `onFocus` (bringToFront)

#### Title Bar

`padding: 8px 12px`, flex row, `gap: 10`, `cursor: grab`, `flexShrink: 0`.
- Active background: `rgba(255,255,255,0.02)` | Inactive: `transparent`
- `borderBottom: 1px solid T.border`
- `onMouseDown` → `onDragStart`

**Contents**:

1. **Traffic lights** (flex, gap: 6):
   - Red dot: 11×11, `T.red`, `opacity: 0.8`, `cursor: pointer`, `onClick` → `onClose()` (with `e.stopPropagation()`)
   - Amber dot: 11×11, `T.amber`, `opacity: 0.5`
   - Green dot: 11×11, `T.green`, `opacity: 0.5`

2. **Session info** (flex, gap: 8, `flex: 1`, `minWidth: 0`):
   - Status dot: `●` character, `fontSize: 8`, color from `statusColor()`
   - Session name: `fontSize: 12`, `fontWeight: 600`, `T.text`, `text-overflow: ellipsis`, `overflow: hidden`, `white-space: nowrap`
   - Model badge: `fontSize: 10`, `padding: 1px 6px`, `borderRadius: 4`, background/color from `modelBadge()`, `fontWeight: 500`, `letterSpacing: 0.3px`, `flexShrink: 0`

3. **"claude code" label**: `fontSize: 10`, `T.textMuted`, `flexShrink: 0`

#### Terminal Body

`flex: 1`, `overflowY: auto`, `padding: 8px 12px`.
Font: JetBrains Mono, `fontSize: 12.5`, `lineHeight: 1.6`.
Scroll to bottom on mount (`useEffect` + `scrollRef`).

Each line renders as a flex row (`gap: 8`, `marginBottom: 3`):

1. **Icon column**: `width: 14`, `text-align: center`, `flexShrink: 0`. Color from `lineColor()`. Opacity: `0.3` for `output` type, `0.7` for everything else. FontSize: `12` for prompt, `11` for others.

2. **Text column**: `<pre>` element with `margin: 0`, `white-space: pre-wrap`, `word-break: break-word`, `font-family: inherit`. Color from `lineColor()`.
   - `prompt`: `fontWeight: 500`
   - `think`: `fontStyle: italic`
   - `diff`: Extra styles — `background: rgba(251,191,36,0.06)`, `padding: 2px 6px`, `borderRadius: 3`, `borderLeft: 2px solid T.amber`, `display: block`, `width: 100%`
   - `error`: Extra styles — `background: rgba(248,113,113,0.08)`, `padding: 2px 6px`, `borderRadius: 3`, `borderLeft: 2px solid T.red`, `display: block`, `width: 100%`

**Active indicator** (only when `session.status === "active"`):
- Flex row, `gap: 6`, `marginTop: 4`
- Pulsing dot: 6×6, `borderRadius: 50%`, `background: T.accent`, `animation: pulse 1.5s ease-in-out infinite`
- Text: "Working..." — `fontSize: 11`, `T.textDim`, `fontStyle: italic`

#### Resize Handle

`position: absolute`, `right: 0`, `bottom: 0`, `width: 18`, `height: 18`, `cursor: nwse-resize`.

Contains an SVG (10×10, viewBox "0 0 10 10", `opacity: 0.25`):
```svg
<path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke={T.text} strokeWidth="1.2" strokeLinecap="round" />
```

`onMouseDown` → `onResizeStart`

### 7.4 `SpawnerModal.tsx` — New Session Dialog

Shown when `showSpawner === true`.

**Backdrop**: `position: absolute`, `inset: 0`, `zIndex: 10000`, `background: T.overlay`, flex centered. Clicking backdrop → close.

**Modal card**: `background: T.bg`, `border: 1px solid T.border`, `borderRadius: 14`, `padding: 24`, `width: 420`, `animation: fadeIn 0.2s ease-out`. `onClick: e.stopPropagation()`.

**Contents**:
1. **Heading**: "New Claude Code Session" — fontSize: 16, fontWeight: 700, `T.text`, marginBottom: 4
2. **Subtext**: "Choose a template or start blank" — fontSize: 12, `T.textDim`, marginBottom: 16
3. **Template cards** (flex column, gap: 8):
   - Each card: class `spawner-option`, `animation: slideUp 0.2s ease-out ${i * 0.04}s both`
   - Card inner:
     - Row: template label (fontSize: 13, fontWeight: 600, `T.text`) + model badge (fontSize: 9, padding: 1px 5px, borderRadius: 3)
     - Desc: fontSize: 11, `T.textDim`, marginTop: 2
   - `onClick` → `spawnSession(template)`

### 7.5 `KeyboardHints.tsx` — Bottom Strip

`position: absolute`, `bottom: 12`, `left: 50%`, `transform: translateX(-50%)`, `zIndex: 9999`.

Flex row, `gap: 12`, JetBrains Mono, `fontSize: 10`, `T.textMuted`.

Content: `Drag background to pan • ⌘/Ctrl + scroll to zoom • Drag title bar to move • Corner handle to resize`

Separators: `•` character with `opacity: 0.3`.

---

## 8. CSS / Animations (`styles/global.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; }
body { font-family: 'DM Sans', sans-serif; overflow: hidden; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.97) translateY(4px); }
  to { opacity: 1; transform: none; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}

/* Scrollbar styling */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #1a1f2e; border-radius: 3px; }
```

Button styles should be injected via a `<style>` tag in the root component or defined in this CSS file with the exact class names: `.toolbar-btn`, `.toolbar-btn:hover`, `.toolbar-btn.primary`, `.toolbar-btn.primary:hover`, `.spawner-option`, `.spawner-option:hover`.

---

## 9. Rendering Order (z-index layers)

| Layer | z-index | Content |
|-------|---------|---------|
| Canvas (dot grid + panels) | 1–N (dynamic per panel) | Session panels |
| Toolbar | 9999 | Top navigation bar |
| Keyboard Hints | 9999 | Bottom hint strip |
| Spawner Modal | 10000 | New session overlay |

---

## 10. Acceptance Criteria

- [ ] `npm run dev` starts the app at `localhost:5173` with all 4 mock sessions visible
- [ ] Panels can be dragged by their title bars to any position on the canvas
- [ ] Panels can be resized from the bottom-right corner handle (min 320×200, max 1200×900)
- [ ] Clicking any panel brings it to the front (highest z-index)
- [ ] Clicking the red dot on a panel closes/removes it
- [ ] Clicking empty canvas background and dragging pans the entire view
- [ ] Ctrl/⌘ + scroll wheel zooms the canvas (0.3×–2.0×)
- [ ] Dot grid background moves with pan and scales with zoom
- [ ] "Tile" button auto-arranges all panels in a computed grid
- [ ] "Reset View" resets pan to (0,0) and zoom to 1.0
- [ ] "+ New Session" opens a modal with 4 template options
- [ ] Selecting a template spawns a new panel at a semi-random position
- [ ] The spawner modal closes when clicking the backdrop
- [ ] Active sessions show a pulsing purple dot with "Working..." text
- [ ] Diff lines have amber left-border + tinted background
- [ ] Error lines have red left-border + tinted background
- [ ] Session count and zoom percentage update live in the toolbar
- [ ] Fonts load: DM Sans for chrome, JetBrains Mono for terminal content
- [ ] All colors exactly match the `T` token object
- [ ] No external dependencies beyond React/ReactDOM + Vite toolchain