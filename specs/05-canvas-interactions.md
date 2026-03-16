# 05 — Canvas Interaction System

> `src/hooks/useCanvasInteractions.ts` — a single custom hook managing all pointer-based interactions.

## State

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

## Interactions

### Panel Drag (title bar `onMouseDown`)

1. `e.stopPropagation()` — prevent canvas pan
2. `bringToFront(id)` — increment `maxZ.current`, update panel's `z`
3. Set `dragging = { id, offX: e.clientX - (p.x + canvasOffset.x) * zoom, offY: e.clientY - (p.y + canvasOffset.y) * zoom }`
4. On `mousemove`: `x = (e.clientX - dragging.offX) / zoom - canvasOffset.x`, same for `y`
5. On `mouseup`: clear `dragging`

### Panel Resize (corner handle `onMouseDown`)

1. `e.stopPropagation()` — prevent drag/pan
2. `bringToFront(id)`
3. Set `resizing = { id, startX: e.clientX, startY: e.clientY, startW: p.w, startH: p.h }`
4. On `mousemove`:
   - `w = clamp(startW + (e.clientX - startX) / zoom, 320, 1200)`
   - `h = clamp(startH + (e.clientY - startY) / zoom, 200, 900)`
5. On `mouseup`: clear `resizing`

### Canvas Pan (background `onMouseDown`)

1. Trigger only when `e.target === canvasRef.current || e.target.dataset.canvas`
2. Set `activeId = null`
3. Set `panning = { startX: e.clientX, startY: e.clientY, startOx: canvasOffset.x, startOy: canvasOffset.y }`
4. On `mousemove`: `offset.x = startOx + (e.clientX - startX) / zoom`, same for `y`
5. On `mouseup`: clear `panning`
6. Cursor: `grabbing` while panning, `default` otherwise

### Zoom (`onWheel` on canvas)

1. Only trigger when `e.ctrlKey || e.metaKey`
2. `e.preventDefault()`
3. `zoom = clamp(zoom + (deltaY > 0 ? -0.05 : 0.05), 0.3, 2.0)`

### Window-level Event Listeners

All `mousemove`/`mouseup` handlers registered as `window`-level event listeners in a `useEffect`. Must clean up on unmount. The `handleMouseMove` callback must be recreated when `dragging`, `resizing`, `panning`, `zoom`, or `canvasOffset` change (include in `useCallback` deps).

## Actions

### `bringToFront(id: string)`

Increment `maxZ.current`, set that panel's `z` to new value, set `activeId`.

### `closePanel(id: string)`

Filter panel from array. If `activeId === id`, set `activeId = null`.

### `tilePanels()`

Auto-arrange all panels in a grid:
- `cols = Math.ceil(Math.sqrt(panels.length))`
- Per panel: `x = (i % cols) * (tileW + gap) + 30 - canvasOffset.x`
- `y = Math.floor(i / cols) * (tileH + gap) + 30 - canvasOffset.y`
- Constants: `tileW = 500`, `tileH = 360`, `gap = 20`

### `spawnSession(template: SpawnerTemplate)`

1. Increment `maxZ.current`
2. Create new `PanelState` with:
   - `id`: `uid()`
   - `session`: `{ name: template.name, status: "active", shell: template.shell, cwd: template.cwd, lines: [system, stdin] }`
   - `x`: `100 + Math.random() * 200 - canvasOffset.x`
   - `y`: `100 + Math.random() * 150 - canvasOffset.y`
   - `w`: 520, `h`: 380, `z`: `maxZ.current`
3. Append to panels, set `activeId`, close spawner

### `resetView()`

Set `canvasOffset = { x: 0, y: 0 }` and `zoom = 1`.

## Acceptance Criteria

- [ ] Hook returns: `panels`, `activeId`, `zoom`, `canvasOffset`, `showSpawner`, `panning` (for cursor), and all action/handler functions
- [ ] Drag, resize, pan, zoom all work without external libraries
- [ ] Window event listeners are properly cleaned up on unmount
- [ ] Typecheck passes
