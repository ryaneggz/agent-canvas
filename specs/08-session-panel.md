# 08 — Session Panel Component

> `src/components/SessionPanel.tsx` — individual terminal window.

## Outer Container

- `position: absolute`, placed at `left: x`, `top: y`, `width: w`, `height: h`, `zIndex` from panel state
- `borderRadius: 10`, `border: 1px solid`, `overflow: hidden`, `userSelect: none`
- `display: flex`, `flexDirection: column`, `background: T.surface`
- **Active border**: `T.borderActive` | **Inactive**: `T.border`
- **Active shadow**: `0 8px 40px rgba(0,0,0,0.5), 0 0 0 1px T.borderActive, 0 0 30px T.accentGlow`
- **Inactive shadow**: `0 4px 20px rgba(0,0,0,0.4)`
- Shadow transition: `box-shadow 0.2s`
- `onMouseDown` on outer div → `bringToFront(id)`

## Title Bar

`padding: 8px 12px`, flex row, `gap: 10`, `cursor: grab`, `flexShrink: 0`.
- Active background: `rgba(255,255,255,0.02)` | Inactive: `transparent`
- `borderBottom: 1px solid T.border`
- `onMouseDown` → `onDragStart`

### Title Bar Contents

1. **Traffic lights** (flex, gap: 6):
   - Red dot: 11x11, `T.red`, `opacity: 0.8`, `cursor: pointer`, onClick → `onClose()` (with `e.stopPropagation()`)
   - Amber dot: 11x11, `T.amber`, `opacity: 0.5`
   - Green dot: 11x11, `T.green`, `opacity: 0.5`

2. **Session info** (flex, gap: 8, `flex: 1`, `minWidth: 0`):
   - Status dot: `●` character, `fontSize: 8`, color from `statusColor()`
   - Session name: `fontSize: 12`, `fontWeight: 600`, `T.text`, `text-overflow: ellipsis`, `overflow: hidden`, `white-space: nowrap`
   - Shell badge: `fontSize: 10`, `padding: 1px 6px`, `borderRadius: 4`, bg/color from `shellBadge()`, `fontWeight: 500`, `letterSpacing: 0.3px`, `flexShrink: 0`

3. **CWD label**: `session.cwd` — `fontSize: 10`, `T.textMuted`, `flexShrink: 0`, `text-overflow: ellipsis`

## Terminal Body

`flex: 1`, `overflowY: auto`, `padding: 8px 12px`.
Font: JetBrains Mono, `fontSize: 12.5`, `lineHeight: 1.6`.
Scroll to bottom on mount (`useEffect` + `scrollRef`).

Each line renders as a flex row (`gap: 8`, `marginBottom: 3`):

1. **Icon column**: `width: 14`, `text-align: center`, `flexShrink: 0`. Color from `lineColor()`. Opacity: `0.3` for `stdout` type, `0.7` for everything else. FontSize: `12` for `stdin`, `11` for others.

2. **Text column**: `<pre>` with `margin: 0`, `white-space: pre-wrap`, `word-break: break-word`, `font-family: inherit`. Color from `lineColor()`.
   - `stdin`: `fontWeight: 500`
   - `system`: `fontStyle: italic`
   - `stderr`: `background: rgba(248,113,113,0.08)`, `padding: 2px 6px`, `borderRadius: 3`, `borderLeft: 2px solid T.red`, `display: block`, `width: 100%`

### Active Indicator (only when `session.status === "active"`)

- Flex row, `gap: 6`, `marginTop: 4`
- Pulsing dot: 6x6, `borderRadius: 50%`, `background: T.accent`, `animation: pulse 1.5s ease-in-out infinite`
- Text: "Working..." — `fontSize: 11`, `T.textDim`, `fontStyle: italic`

## Resize Handle

`position: absolute`, `right: 0`, `bottom: 0`, `width: 18`, `height: 18`, `cursor: nwse-resize`.

SVG (10x10, viewBox "0 0 10 10", `opacity: 0.25`):
```svg
<path d="M9 1L1 9M9 5L5 9M9 9L9 9" stroke={T.text} strokeWidth="1.2" strokeLinecap="round" />
```

`onMouseDown` → `onResizeStart`

## Acceptance Criteria

- [ ] Panels render at correct absolute positions with proper z-index
- [ ] Title bar drag initiates panel move
- [ ] Red dot closes/removes the panel
- [ ] Active sessions show pulsing purple dot with "Working..." text
- [ ] Diff lines have amber left-border + tinted background
- [ ] Error lines have red left-border + tinted background
- [ ] Resize handle appears at bottom-right corner
- [ ] Terminal body auto-scrolls to bottom on mount
