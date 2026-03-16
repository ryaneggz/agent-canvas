import { MOCK_SESSIONS, SPAWNER_TEMPLATES } from '@/data/mockSessions';

describe('MOCK_SESSIONS', () => {
  it('has length 4', () => {
    expect(MOCK_SESSIONS).toHaveLength(4);
  });

  it('api-server has correct name, shell, status, and line count', () => {
    const session = MOCK_SESSIONS[0];
    expect(session.name).toBe('api-server');
    expect(session.shell).toBe('bash');
    expect(session.status).toBe('active');
    expect(session.lines).toHaveLength(8);
  });

  it('git-workflow has correct name, shell, status, and line count', () => {
    const session = MOCK_SESSIONS[1];
    expect(session.name).toBe('git-workflow');
    expect(session.shell).toBe('zsh');
    expect(session.status).toBe('active');
    expect(session.lines).toHaveLength(8);
  });

  it('docker-build has correct name, shell, status, and line count', () => {
    const session = MOCK_SESSIONS[2];
    expect(session.name).toBe('docker-build');
    expect(session.shell).toBe('bash');
    expect(session.status).toBe('idle');
    expect(session.lines).toHaveLength(6);
  });

  it('test-runner has correct name, shell, status, and line count', () => {
    const session = MOCK_SESSIONS[3];
    expect(session.name).toBe('test-runner');
    expect(session.shell).toBe('bash');
    expect(session.status).toBe('error');
    expect(session.lines).toHaveLength(5);
  });

  it('each session has required fields', () => {
    for (const session of MOCK_SESSIONS) {
      expect(session).toHaveProperty('name');
      expect(session).toHaveProperty('status');
      expect(session).toHaveProperty('shell');
      expect(session).toHaveProperty('cwd');
      expect(session).toHaveProperty('lines');
    }
  });
});

describe('SPAWNER_TEMPLATES', () => {
  it('has length 4', () => {
    expect(SPAWNER_TEMPLATES).toHaveLength(4);
  });

  it('has correct labels', () => {
    const labels = SPAWNER_TEMPLATES.map((t) => t.label);
    expect(labels).toEqual([
      'Blank (bash)',
      'Blank (zsh)',
      'Project Shell',
      'Node REPL',
    ]);
  });

  it('each template has shell and description fields', () => {
    for (const template of SPAWNER_TEMPLATES) {
      expect(template).toHaveProperty('shell');
      expect(typeof template.shell).toBe('string');
      expect(template).toHaveProperty('desc');
      expect(typeof template.desc).toBe('string');
    }
  });
});
