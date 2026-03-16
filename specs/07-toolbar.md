# 07 — Toolbar Component

> `src/components/Toolbar.tsx` — top navigation bar.

## Position & Style

- `position: absolute`, `top: 0`, `left: 0`, `right: 0`, `zIndex: 9999`
- `background: linear-gradient(180deg, rgba(8,9,12,0.95) 0%, rgba(8,9,12,0.8) 80%, transparent 100%)`
- `backdropFilter: blur(8px)`
- `padding: 10px 16px`
- `display: flex`, `align-items: center`, `gap: 10`

## Contents (left to right)

1. **Logo block** (marginRight: 8):
   - 26x26px rounded square (borderRadius: 6), gradient fill `linear-gradient(135deg, T.accent, T.cyan)`, contains `>_` character (fontSize: 13, fontWeight: 700, white)
   - Label: "Agent Canvas" — fontSize: 14, fontWeight: 700, color: `T.text`, letterSpacing: "-0.3px"

2. **Divider**: 1x20px, `background: T.border`, margin: "0 4px"

3. **"+ New Session" button**: Class `toolbar-btn primary`
   - `background: T.accentDim`, `border-color: rgba(192,132,252,0.3)`, `color: T.accent`
   - Hover: `background: rgba(192,132,252,0.25)`
   - onClick → `setShowSpawner(true)`

4. **"⊞ Tile" button**: Standard `toolbar-btn`. onClick → `tilePanels()`

5. **"⌂ Reset View" button**: Standard `toolbar-btn`. onClick → `resetView()`

6. **Spacer**: `flex: 1`

7. **Status text**: `"{panels.length} session(s) · {Math.round(zoom * 100)}%"`
   - JetBrains Mono, fontSize: 11, color: `T.textMuted`

## `toolbar-btn` Base Style

`border: 1px solid T.border`, `background: T.surface`, `color: T.textDim`, `padding: 6px 12px`, `borderRadius: 6px`, `fontSize: 12px`, `cursor: pointer`, `display: flex`, `align-items: center`, `gap: 5px`, `transition: all 0.15s`, `font-family: DM Sans`.

Hover: `background: T.surfaceHover`, `color: T.text`, `border-color: T.borderActive`.

## Acceptance Criteria

- [ ] Toolbar renders at top with gradient background and blur
- [ ] Logo, divider, 3 buttons, spacer, and status text all present
- [ ] "+ New Session" opens spawner modal
- [ ] "Tile" auto-arranges panels
- [ ] "Reset View" resets pan and zoom
- [ ] Session count and zoom percentage update live
