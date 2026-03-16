import { parseAnsi } from '@/utils/ansiParser';

describe('parseAnsi', () => {
  it('returns plain text unchanged', () => {
    const spans = parseAnsi('hello world');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('hello world');
    expect(spans[0].style).toEqual({});
  });

  it('returns empty array for empty string', () => {
    expect(parseAnsi('')).toHaveLength(0);
  });

  it('parses red foreground (SGR 31)', () => {
    const spans = parseAnsi('\x1b[31mERROR\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('ERROR');
    expect(spans[0].style.color).toBe('#f87171');
  });

  it('parses green foreground (SGR 32)', () => {
    const spans = parseAnsi('\x1b[32mOK\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('OK');
    expect(spans[0].style.color).toBe('#34d399');
  });

  it('parses bold (SGR 1)', () => {
    const spans = parseAnsi('\x1b[1mBOLD\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('BOLD');
    expect(spans[0].style.fontWeight).toBe('bold');
  });

  it('parses italic (SGR 3)', () => {
    const spans = parseAnsi('\x1b[3mitalic\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.fontStyle).toBe('italic');
  });

  it('parses underline (SGR 4)', () => {
    const spans = parseAnsi('\x1b[4munderlined\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.textDecoration).toBe('underline');
  });

  it('parses dim (SGR 2)', () => {
    const spans = parseAnsi('\x1b[2mdimmed\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.opacity).toBe(0.6);
  });

  it('parses combined bold + color', () => {
    const spans = parseAnsi('\x1b[1;33myellow bold\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.fontWeight).toBe('bold');
    expect(spans[0].style.color).toBe('#fbbf24');
  });

  it('handles reset in the middle', () => {
    const spans = parseAnsi('\x1b[31mred\x1b[0m plain');
    expect(spans).toHaveLength(2);
    expect(spans[0].text).toBe('red');
    expect(spans[0].style.color).toBe('#f87171');
    expect(spans[1].text).toBe(' plain');
    expect(spans[1].style).toEqual({});
  });

  it('parses 256-color foreground (38;5;N)', () => {
    const spans = parseAnsi('\x1b[38;5;196mred256\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('red256');
    expect(spans[0].style.color).toBeDefined();
  });

  it('parses truecolor foreground (38;2;R;G;B)', () => {
    const spans = parseAnsi('\x1b[38;2;255;128;0morange\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('orange');
    expect(spans[0].style.color).toBe('rgb(255,128,0)');
  });

  it('parses truecolor background (48;2;R;G;B)', () => {
    const spans = parseAnsi('\x1b[48;2;0;0;255mblue bg\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('blue bg');
    expect(spans[0].style.backgroundColor).toBe('rgb(0,0,255)');
  });

  it('parses background color (SGR 42)', () => {
    const spans = parseAnsi('\x1b[42mgreen bg\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.backgroundColor).toBe('#34d399');
  });

  it('parses bright foreground (SGR 90-97)', () => {
    const spans = parseAnsi('\x1b[91mbright red\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.color).toBe('#fca5a5');
  });

  it('strips non-SGR escape sequences (cursor movement)', () => {
    const spans = parseAnsi('\x1b[2Ahello');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('hello');
  });

  it('strips private-mode CSI sequences (bracketed paste, cursor show/hide)', () => {
    // \x1b[?2004h = enable bracketed paste mode
    // \x1b[?25l = hide cursor
    const spans = parseAnsi('\x1b[?2004huser@host:~$ \x1b[?25l');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('user@host:~$ ');
  });

  it('strips OSC sequences', () => {
    const spans = parseAnsi('\x1b]0;title\x07hello');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('hello');
  });

  it('handles implicit reset (bare ESC[m)', () => {
    const spans = parseAnsi('\x1b[31mred\x1b[m plain');
    expect(spans).toHaveLength(2);
    expect(spans[0].style.color).toBe('#f87171');
    expect(spans[1].style).toEqual({});
  });

  it('merges adjacent spans with same style', () => {
    // Two consecutive red spans without reset between should merge
    const spans = parseAnsi('\x1b[31mhello \x1b[31mworld\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].text).toBe('hello world');
  });

  it('handles 256-color background (48;5;N)', () => {
    const spans = parseAnsi('\x1b[48;5;21mtext\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.backgroundColor).toBeDefined();
  });

  it('handles grayscale 256-color', () => {
    const spans = parseAnsi('\x1b[38;5;240mgray\x1b[0m');
    expect(spans).toHaveLength(1);
    expect(spans[0].style.color).toMatch(/^rgb\(/);
  });
});
