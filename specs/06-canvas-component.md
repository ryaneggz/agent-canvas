# 06 — Canvas Component

> `src/components/Canvas.tsx` — infinite canvas container with dot grid background.

## Root Element

`div` filling `100vw x 100vh`, `overflow: hidden`, `background: T.bg`, `position: relative`.

## Dot Grid Background

Applied to the canvas `div` (not root):
- `backgroundImage`: `radial-gradient(circle, ${T.gridDot} 1px, transparent 1px)`
- `backgroundSize`: `${24 * zoom}px ${24 * zoom}px`
- `backgroundPosition`: `${canvasOffset.x * zoom}px ${canvasOffset.y * zoom}px`
- Dots move with pan and scale with zoom.

## Transform Structure (3 nested divs)

```
div[canvas-area]  ← receives mouseDown (pan), onWheel (zoom), has dot grid
  div[zoom-layer] ← transform: scale(zoom), transformOrigin: "0 0"
    div[pan-layer] ← transform: translate(canvasOffset.x px, canvasOffset.y px)
      {panels.map → <SessionPanel />}
```

Both zoom-layer and pan-layer get `data-canvas="true"` so clicks pass through for panning.

## Composition

This component imports and renders:
- `<Toolbar />` — positioned absolute at top
- `<KeyboardHints />` — positioned absolute at bottom
- `<SpawnerModal />` — conditional on `showSpawner`
- `{panels.map → <SessionPanel />}` — inside the pan-layer

## `App.tsx`

Simply renders `<Canvas />` (aliased as `<AgentCanvas />`).

## Acceptance Criteria

- [ ] Canvas fills viewport with dark background
- [ ] Dot grid renders and responds to pan/zoom
- [ ] Transform nesting enables correct panel positioning
- [ ] All child components render in correct z-order
