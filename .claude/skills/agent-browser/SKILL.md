---
name: agent-browser
description: Browser automation via the agent-browser CLI. Use for web navigation, scraping, screenshots, form filling, and any browser interaction.
---

# agent-browser

Fast browser automation CLI for AI agents. Run `agent-browser --help` for the full command reference.

## Quick Reference

```bash
agent-browser open <url>              # Navigate to URL
agent-browser snapshot -i             # Accessibility tree (interactive elements only)
agent-browser click @<ref>            # Click element by snapshot ref
agent-browser fill @<ref> "<text>"    # Clear and fill input
agent-browser screenshot [path]       # Take screenshot
agent-browser get text @<ref>         # Extract text from element
```

## Workflow

1. `agent-browser open <url>` — navigate to the target page
2. `agent-browser snapshot -i` — get interactive elements with refs (`@e1`, `@e2`, ...)
3. Use refs to `click`, `fill`, `type`, `select`, etc.
4. `agent-browser screenshot` — verify visual state when needed

## Notes

- Use `--headed` to show the browser window (default is headless).
- Use `--session <name>` for isolated sessions.
- Use `--profile <path>` for persistent browser state across runs.
- Full docs: `agent-browser --help`
