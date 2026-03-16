# 04 — Utility Functions

> Helper functions and line formatting utilities in `src/utils/`.

## `src/utils/helpers.ts`

```ts
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export const uid = () => Math.random().toString(36).slice(2, 8);
```

## `src/utils/lineFormatting.ts`

All functions reference the `T` token object from `theme.ts`.

### `lineColor(type: LineType) → string`

| Type | Color |
|------|-------|
| `stdin` | `T.accent` (`#c084fc`) |
| `stdout` | `T.text` (`#e2e8f0`) |
| `stderr` | `T.red` (`#f87171`) |
| `system` | `T.textDim` (`#64748b`) |

### `lineIcon(type: LineType) → string`

| Type | Icon |
|------|------|
| `stdin` | `$` |
| `stdout` | `│` |
| `stderr` | `!` |
| `system` | `·` |

### `statusColor(status: SessionStatus) → string`

- `"active"` → `T.green`
- `"error"` → `T.red`
- anything else → `T.textDim`

### `shellBadge(shell: ShellType) → ShellBadgeStyle`

| Shell | `bg` | `fg` | `label` |
|-------|------|------|---------|
| `bash` | `rgba(192,132,252,0.15)` | `T.accent` | `"bash"` |
| `zsh` | `rgba(34,211,238,0.12)` | `T.cyan` | `"zsh"` |
| `sh` | `rgba(251,191,36,0.12)` | `T.amber` | `"sh"` |
| `fish` | `rgba(52,211,153,0.12)` | `T.green` | `"fish"` |

## Acceptance Criteria

- [ ] `clamp` and `uid` exported from `helpers.ts`
- [ ] `lineColor`, `lineIcon`, `statusColor`, `shellBadge` exported from `lineFormatting.ts`
- [ ] Return values match tables exactly
- [ ] Typecheck passes
