import { describe, it, expect } from 'vitest';
import { T } from '@/theme';

describe('T token object', () => {
  it('is exported', () => {
    expect(T).toBeDefined();
  });

  it('has exactly 19 keys', () => {
    expect(Object.keys(T)).toHaveLength(19);
  });

  it('contains all expected keys', () => {
    const expectedKeys = [
      'bg', 'grid', 'gridDot', 'surface', 'surfaceHover',
      'border', 'borderActive', 'accent', 'accentDim', 'accentGlow',
      'green', 'greenDim', 'amber', 'red', 'cyan',
      'text', 'textDim', 'textMuted', 'overlay',
    ];
    expect(Object.keys(T).sort()).toEqual(expectedKeys.sort());
  });

  describe('color values', () => {
    it('bg is #08090c', () => {
      expect(T.bg).toBe('#08090c');
    });

    it('grid is rgba(255,255,255,0.018)', () => {
      expect(T.grid).toBe('rgba(255,255,255,0.018)');
    });

    it('gridDot is rgba(255,255,255,0.06)', () => {
      expect(T.gridDot).toBe('rgba(255,255,255,0.06)');
    });

    it('surface is #0e1118', () => {
      expect(T.surface).toBe('#0e1118');
    });

    it('surfaceHover is #131720', () => {
      expect(T.surfaceHover).toBe('#131720');
    });

    it('border is #1a1f2e', () => {
      expect(T.border).toBe('#1a1f2e');
    });

    it('borderActive is #2d3548', () => {
      expect(T.borderActive).toBe('#2d3548');
    });

    it('accent is #c084fc', () => {
      expect(T.accent).toBe('#c084fc');
    });

    it('accentDim is rgba(192,132,252,0.15)', () => {
      expect(T.accentDim).toBe('rgba(192,132,252,0.15)');
    });

    it('accentGlow is rgba(192,132,252,0.25)', () => {
      expect(T.accentGlow).toBe('rgba(192,132,252,0.25)');
    });

    it('green is #34d399', () => {
      expect(T.green).toBe('#34d399');
    });

    it('greenDim is rgba(52,211,153,0.12)', () => {
      expect(T.greenDim).toBe('rgba(52,211,153,0.12)');
    });

    it('amber is #fbbf24', () => {
      expect(T.amber).toBe('#fbbf24');
    });

    it('red is #f87171', () => {
      expect(T.red).toBe('#f87171');
    });

    it('cyan is #22d3ee', () => {
      expect(T.cyan).toBe('#22d3ee');
    });

    it('text is #e2e8f0', () => {
      expect(T.text).toBe('#e2e8f0');
    });

    it('textDim is #64748b', () => {
      expect(T.textDim).toBe('#64748b');
    });

    it('textMuted is #475569', () => {
      expect(T.textMuted).toBe('#475569');
    });

    it('overlay is rgba(8,9,12,0.85)', () => {
      expect(T.overlay).toBe('rgba(8,9,12,0.85)');
    });
  });
});
