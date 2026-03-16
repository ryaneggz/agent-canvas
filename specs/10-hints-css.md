# 10 — Keyboard Hints & Global CSS

> `src/components/KeyboardHints.tsx` and `src/styles/global.css`.

## `KeyboardHints.tsx`

### Position

- `position: absolute`, `bottom: 12`, `left: 50%`, `transform: translateX(-50%)`, `zIndex: 9999`

### Content

Flex row, `gap: 12`, JetBrains Mono, `fontSize: 10`, `T.textMuted`.

Text segments:
```
Drag background to pan • ⌘/Ctrl + scroll to zoom • Drag title bar to move • Corner handle to resize
```

Separators: `•` character with `opacity: 0.3`.

## `global.css`

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

### Button CSS Classes (in global.css or `<style>` tag in root)

- `.toolbar-btn` — base toolbar button style
- `.toolbar-btn:hover` — hover state
- `.toolbar-btn.primary` — accent-tinted "New Session" button
- `.toolbar-btn.primary:hover` — primary hover state
- `.spawner-option` — template card in spawner modal
- `.spawner-option:hover` — template card hover

## Z-Index Layers

| Layer | z-index | Content |
|-------|---------|---------|
| Canvas (dot grid + panels) | 1–N (dynamic per panel) | Session panels |
| Toolbar | 9999 | Top navigation bar |
| Keyboard Hints | 9999 | Bottom hint strip |
| Spawner Modal | 10000 | New session overlay |

## Acceptance Criteria

- [ ] Keyboard hints render centered at bottom of viewport
- [ ] Fonts load: DM Sans for chrome, JetBrains Mono for terminal content
- [ ] All 3 keyframe animations work (pulse, fadeIn, slideUp)
- [ ] Custom scrollbar styling applied
- [ ] All CSS class names match component references
