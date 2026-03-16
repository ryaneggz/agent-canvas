import type { Session, SpawnerTemplate } from '../types';

export const MOCK_SESSIONS: Session[] = [
  {
    name: 'api-server',
    status: 'active',
    shell: 'bash',
    cwd: '~/projects/orchestra-api',
    lines: [
      { t: 'stdin', v: '$ cd ~/projects/orchestra-api && npm run dev' },
      { t: 'stdout', v: '> orchestra-api@2.1.0 dev' },
      { t: 'stdout', v: '> tsx watch src/index.ts' },
      { t: 'stdout', v: 'Server listening on http://localhost:3000' },
      { t: 'stdout', v: 'Connected to database (postgres://localhost:5432/orchestra)' },
      { t: 'stdin', v: '$ curl -s http://localhost:3000/health | jq' },
      { t: 'stdout', v: '{\n  "status": "ok",\n  "uptime": 1247,\n  "version": "2.1.0"\n}' },
      { t: 'system', v: 'Process running (PID 48201)' },
    ],
  },
  {
    name: 'git-workflow',
    status: 'active',
    shell: 'zsh',
    cwd: '~/projects/mcp-agent',
    lines: [
      { t: 'stdin', v: '$ git status' },
      { t: 'stdout', v: 'On branch feature/mcp-integration\nChanges not staged for commit:\n  modified:   src/agents/router.py\n  modified:   src/mcp/registry.py' },
      { t: 'stdin', v: '$ git diff --stat' },
      { t: 'stdout', v: 'src/agents/router.py  | 18 ++++++++++--------\n src/mcp/registry.py  |  7 +++++--\n 2 files changed, 15 insertions(+), 10 deletions(-)' },
      { t: 'stdin', v: '$ git add -A && git commit -m "feat: add tool discovery to agent router"' },
      { t: 'stdout', v: '[feature/mcp-integration a3f8c2d] feat: add tool discovery to agent router\n 2 files changed, 15 insertions(+), 10 deletions(-)' },
      { t: 'stdin', v: '$ git push origin feature/mcp-integration' },
      { t: 'stdout', v: "remote: Create a pull request for 'feature/mcp-integration' on GitHub" },
    ],
  },
  {
    name: 'docker-build',
    status: 'idle',
    shell: 'bash',
    cwd: '~/projects/sandbox',
    lines: [
      { t: 'stdin', v: '$ docker build -t sandbox:latest .' },
      { t: 'stdout', v: '[+] Building 24.3s (12/12) FINISHED\n => [internal] load build definition from Dockerfile\n => [1/8] FROM node:20-slim@sha256:a1b2c3...\n => [8/8] RUN npm ci --production' },
      { t: 'stdin', v: '$ docker images | grep sandbox' },
      { t: 'stdout', v: 'sandbox   latest   f7a3b2c1d4e5   2 minutes ago   247MB' },
      { t: 'stdin', v: '$ docker run -d --name sandbox-1 -p 8080:8080 sandbox:latest' },
      { t: 'stdout', v: 'c9e4f2a1b3d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1' },
    ],
  },
  {
    name: 'test-runner',
    status: 'error',
    shell: 'bash',
    cwd: '~/projects/orchestra-api',
    lines: [
      { t: 'stdin', v: '$ npm test -- --reporter=verbose' },
      { t: 'stdout', v: 'PASS  src/utils/helpers.test.ts (12 tests)' },
      { t: 'stdout', v: 'PASS  src/hooks/useAuth.test.ts (8 tests)' },
      { t: 'stderr', v: 'FAIL  src/api/routes.test.ts\n  ● POST /sessions › should return 201\n    Expected: 201\n    Received: 500\n\n    ConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:5432' },
      { t: 'stderr', v: 'Tests: 1 failed, 20 passed, 21 total' },
    ],
  },
];

export const SPAWNER_TEMPLATES: SpawnerTemplate[] = [
  {
    name: 'blank-bash',
    shell: 'bash',
    cwd: '~',
    label: 'Blank (bash)',
    desc: 'Empty bash shell session',
  },
  {
    name: 'blank-zsh',
    shell: 'zsh',
    cwd: '~',
    label: 'Blank (zsh)',
    desc: 'Empty zsh shell session',
  },
  {
    name: 'project-shell',
    shell: 'bash',
    cwd: '~/projects',
    label: 'Project Shell',
    desc: 'Shell in projects directory',
  },
  {
    name: 'node-repl',
    shell: 'bash',
    cwd: '~',
    label: 'Node REPL',
    desc: 'Start a Node.js REPL',
  },
];
