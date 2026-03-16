# 01 — Project Scaffold

> Set up the Vite + React + TypeScript project with the target file structure.

## Steps

```bash
npm create vite@latest . -- --template react-ts
npm install
```

Remove all Vite boilerplate files (`App.css`, `index.css`, `assets/`, default SVGs, counter logic).

## Target File Structure

```
├── index.html
├── vite.config.ts
├── tsconfig.json
├── src/
│   ├── main.tsx                  # ReactDOM.createRoot → <App />
│   ├── App.tsx                   # Renders <AgentCanvas />
│   ├── theme.ts
│   ├── types.ts
│   ├── data/
│   │   └── mockSessions.ts
│   ├── utils/
│   │   ├── helpers.ts
│   │   └── lineFormatting.ts
│   ├── hooks/
│   │   └── useCanvasInteractions.ts
│   ├── components/
│   │   ├── Canvas.tsx
│   │   ├── Toolbar.tsx
│   │   ├── SessionPanel.tsx
│   │   ├── SpawnerModal.tsx
│   │   └── KeyboardHints.tsx
│   └── styles/
│       └── global.css
```

## Dependencies

**Zero additional npm dependencies.** Only React 19 + ReactDOM (bundled with Vite template). All interactions use native DOM events and React state.

## External Fonts (loaded via CSS `@import`)

```
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap
```

- **DM Sans** (400/500/600/700) — UI chrome, toolbar, modal text
- **JetBrains Mono** (400/500/600/700) — terminal body, status bar, hints

## Acceptance Criteria

- [ ] `npm run dev` starts Vite dev server at `localhost:5173`
- [ ] All directories and placeholder files exist per the structure above
- [ ] No Vite boilerplate remains (no counter, no default SVGs)
- [ ] Typecheck passes (`npx tsc --noEmit`)
