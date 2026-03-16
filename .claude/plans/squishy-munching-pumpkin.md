# Plan: Add agent-browser verification to PRD for tight feedback loops

## Context

The PRD at `tasks/prd-agent-canvas.md` has 17 user stories. Some already include `- [ ] Verify in browser using agent-browser skill` in their acceptance criteria, but several stories with UI-visible output are missing it. The goal is tight feedback loops: every story that produces visible UI changes should be verified in the browser immediately after implementation.

## Changes

**File:** `tasks/prd-agent-canvas.md`

### 1. Add browser verification to missing UI stories

Stories that already have it: US-010 through US-016 (7 stories)

Stories that need it added (have UI-visible output but no browser verification):

| Story | Why it needs browser verification |
|-------|----------------------------------|
| US-001 | App boots and renders at localhost:5173 |
| US-002 | Fonts render visually (DM Sans / JetBrains Mono) |
| US-006 | 4 mock session panels appear on canvas |
| US-008 | Drag, resize, pan, zoom are all visual interactions |
| US-009 | Tile, close, spawn, reset are visible UI actions |
| US-017 | CSS animations (pulse, fadeIn, slideUp), scrollbar, button styles |

Stories that do NOT need it (pure code, no visual output):
- US-003 (design tokens object), US-004 (type definitions), US-005 (utility functions), US-007 (hook internals)

### 2. Add a "Verification Approach" section to the PRD

Add a new section after "Technical Considerations" that describes the tight feedback loop strategy:
- After completing each UI story, use the `agent-browser` skill to visually verify at `localhost:5173`
- Run `npx tsc --noEmit` for every story (already present)
- Check browser console for errors on visual stories

### 3. Update Success Metrics

Add a metric about browser-verified visual correctness.

## Verification

- Read the updated PRD and confirm all 13 UI-facing stories (US-001, 002, 006, 008, 009, 010-016, 017) have the agent-browser criterion
- Confirm the 4 pure-code stories (US-003, 004, 005, 007) do NOT have it (no false positives)
