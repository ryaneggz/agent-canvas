# 03 — Mock Data

> Pre-loaded sessions and spawner templates in `src/data/mockSessions.ts`.

## 4 Pre-loaded Sessions

On app mount, create 4 panels from these sessions. Initial positions cascade: `x = 40 + i*60`, `y = 40 + i*50`, all at `w=520, h=380`.

### Session 0: `api-server` (bash, active, 8 lines)

```
stdin   $ cd ~/projects/orchestra-api && npm run dev
stdout  > orchestra-api@2.1.0 dev
stdout  > tsx watch src/index.ts
stdout  Server listening on http://localhost:3000
stdout  Connected to database (postgres://localhost:5432/orchestra)
stdin   $ curl -s http://localhost:3000/health | jq
stdout  {\n  "status": "ok",\n  "uptime": 1247,\n  "version": "2.1.0"\n}
system  Process running (PID 48201)
```

### Session 1: `git-workflow` (zsh, active, 8 lines)

```
stdin   $ git status
stdout  On branch feature/mcp-integration\nChanges not staged for commit:\n  modified:   src/agents/router.py\n  modified:   src/mcp/registry.py
stdin   $ git diff --stat
stdout  src/agents/router.py  | 18 ++++++++++--------\n src/mcp/registry.py  |  7 +++++--\n 2 files changed, 15 insertions(+), 10 deletions(-)
stdin   $ git add -A && git commit -m "feat: add tool discovery to agent router"
stdout  [feature/mcp-integration a3f8c2d] feat: add tool discovery to agent router\n 2 files changed, 15 insertions(+), 10 deletions(-)
stdin   $ git push origin feature/mcp-integration
stdout  remote: Create a pull request for 'feature/mcp-integration' on GitHub
```

### Session 2: `docker-build` (bash, idle, 6 lines)

```
stdin   $ docker build -t sandbox:latest .
stdout  [+] Building 24.3s (12/12) FINISHED
stdout   => [internal] load build definition from Dockerfile\n => [1/8] FROM node:20-slim@sha256:a1b2c3...\n => [8/8] RUN npm ci --production
stdin   $ docker images | grep sandbox
stdout  sandbox   latest   f7a3b2c1d4e5   2 minutes ago   247MB
stdin   $ docker run -d --name sandbox-1 -p 8080:8080 sandbox:latest
stdout  c9e4f2a1b3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

### Session 3: `test-runner` (bash, error, 5 lines)

```
stdin   $ npm test -- --reporter=verbose
stdout  PASS  src/utils/helpers.test.ts (12 tests)
stdout  PASS  src/hooks/useAuth.test.ts (8 tests)
stderr  FAIL  src/api/routes.test.ts\n  ● POST /sessions › should return 201\n    Expected: 201\n    Received: 500\n\n    ConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:5432
stderr  Tests: 1 failed, 20 passed, 21 total
```

## 4 Spawner Templates

Available from the "New Session" modal:

| `name` | `shell` | `cwd` | `label` | `desc` |
|---------|---------|-------|---------|--------|
| `blank-bash` | `bash` | `~` | Blank (bash) | Empty bash shell session |
| `blank-zsh` | `zsh` | `~` | Blank (zsh) | Empty zsh shell session |
| `project-shell` | `bash` | `~/projects` | Project Shell | Shell in projects directory |
| `node-repl` | `bash` | `~` | Node REPL | Start a Node.js REPL |

Spawned sessions get 2 initial lines:
- `{ t: "system", v: "Session started" }`
- `{ t: "stdin", v: "$ " }` (empty prompt ready for input)

## Acceptance Criteria

- [ ] `MOCK_SESSIONS` array exported with 4 sessions matching specs above
- [ ] `SPAWNER_TEMPLATES` array exported with 4 templates
- [ ] All line types and session statuses match the spec
- [ ] Typecheck passes
