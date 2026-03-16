# Agent Canvas

An infinite-canvas terminal session viewer. Drag, resize, pan, and zoom across multiple terminal panels — all in the browser with zero external dependencies.

![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)

## Features

- **Infinite Canvas** — pan and zoom a dot-grid workspace
- **Draggable Panels** — grab the title bar to reposition terminal windows
- **Resizable Panels** — corner handle with min/max constraints
- **Auto-Tile** — one-click grid arrangement for all panels
- **Session Spawner** — modal to create new sessions from templates
- **Shell Badges** — color-coded indicators for bash, zsh, sh, fish
- **Status Indicators** — active (pulsing), idle, and error states
- **Keyboard/Mouse Hints** — contextual hints at the bottom of the viewport
- **Zero Dependencies** — only React 19 + ReactDOM, all interactions via native DOM events

## Getting Started

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

All scripts run from the `app/` directory:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
| `npm run lint:fix` | ESLint with auto-fix |
| `npm run typecheck` | TypeScript check (no emit) |
| `npm test` | Run tests (Vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
├── app/                         # Vite + React application
│   ├── src/
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Root component → <AgentCanvas />
│   │   ├── theme.ts             # Design tokens (colors, inline styles)
│   │   ├── types.ts             # TypeScript interfaces
│   │   ├── data/
│   │   │   └── mockSessions.ts  # Mock sessions & spawner templates
│   │   ├── utils/
│   │   │   ├── helpers.ts       # clamp(), uid()
│   │   │   └── lineFormatting.ts
│   │   ├── hooks/
│   │   │   └── useCanvasInteractions.ts
│   │   ├── components/
│   │   │   ├── Canvas.tsx       # Infinite canvas with dot grid
│   │   │   ├── Toolbar.tsx      # Top navigation bar
│   │   │   ├── SessionPanel.tsx # Terminal window panel
│   │   │   ├── SpawnerModal.tsx # New session modal
│   │   │   └── KeyboardHints.tsx
│   │   └── styles/
│   │       └── global.css       # Fonts, animations, scrollbar styles
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
├── specs/                       # Implementation specs (01–10)
├── docs/                        # Documentation
├── CLAUDE.md                    # AI agent instructions
└── AGENTS.md -> CLAUDE.md       # Symlink
```

## Controls

| Action | Input |
|--------|-------|
| Pan canvas | Drag background |
| Zoom | Ctrl/Cmd + scroll |
| Move panel | Drag title bar |
| Resize panel | Drag corner handle |
| Close panel | Click red traffic light dot |
| New session | Toolbar "New Session" button |
| Auto-tile | Toolbar "Tile" button |
| Reset view | Toolbar "Reset View" button |

## Tech Stack

- **Vite** — build tooling
- **React 19** — UI framework
- **TypeScript** — type safety
- **Vitest** — testing
- **ESLint** — linting
- **Husky + lint-staged** — pre-commit hooks
- **DM Sans** — UI typography
- **JetBrains Mono** — terminal typography

## License

MIT
