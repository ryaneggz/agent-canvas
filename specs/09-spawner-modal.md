# 09 — Spawner Modal Component

> `src/components/SpawnerModal.tsx` — "New Session" dialog.

## Visibility

Shown when `showSpawner === true`.

## Backdrop

- `position: absolute`, `inset: 0`, `zIndex: 10000`
- `background: T.overlay`
- Flex centered
- Clicking backdrop → close modal

## Modal Card

- `background: T.bg`, `border: 1px solid T.border`, `borderRadius: 14`
- `padding: 24`, `width: 420`
- `animation: fadeIn 0.2s ease-out`
- `onClick: e.stopPropagation()` (prevent backdrop close)

## Contents

1. **Heading**: "New Terminal Session" — fontSize: 16, fontWeight: 700, `T.text`, marginBottom: 4

2. **Subtext**: "Choose a template or start blank" — fontSize: 12, `T.textDim`, marginBottom: 16

3. **Template cards** (flex column, gap: 8):
   - Each card: class `spawner-option`, `animation: slideUp 0.2s ease-out ${i * 0.04}s both`
   - Card inner:
     - Row: template label (fontSize: 13, fontWeight: 600, `T.text`) + shell badge (fontSize: 9, padding: 1px 5px, borderRadius: 3)
     - Desc: fontSize: 11, `T.textDim`, marginTop: 2
   - `onClick` → `spawnSession(template)`

## CSS Classes

### `.spawner-option`

- `background: T.surface`, `border: 1px solid T.border`, `borderRadius: 8`
- `padding: 12px 14px`, `cursor: pointer`, `transition: all 0.15s`

### `.spawner-option:hover`

- `background: T.surfaceHover`, `border-color: T.borderActive`

## Acceptance Criteria

- [ ] Modal renders centered over canvas with dark overlay
- [ ] 4 template cards display with staggered animation
- [ ] Clicking a template spawns a new panel and closes modal
- [ ] Clicking backdrop closes modal
- [ ] Shell badge shows correct color per shell type
