import type { CSSProperties } from 'react';

export interface AnsiSpan {
  text: string;
  style: CSSProperties;
}

// Standard 8 colors (normal + bright)
const COLORS_16: Record<number, string> = {
  30: '#4a4a4a', 31: '#f87171', 32: '#34d399', 33: '#fbbf24',
  34: '#60a5fa', 35: '#c084fc', 36: '#22d3ee', 37: '#e2e8f0',
  90: '#64748b', 91: '#fca5a5', 92: '#6ee7b7', 93: '#fde68a',
  94: '#93c5fd', 95: '#d8b4fe', 96: '#67e8f9', 97: '#f8fafc',
};

const BG_COLORS_16: Record<number, string> = {
  40: '#4a4a4a', 41: '#f87171', 42: '#34d399', 43: '#fbbf24',
  44: '#60a5fa', 45: '#c084fc', 46: '#22d3ee', 47: '#e2e8f0',
  100: '#64748b', 101: '#fca5a5', 102: '#6ee7b7', 103: '#fde68a',
  104: '#93c5fd', 105: '#d8b4fe', 106: '#67e8f9', 107: '#f8fafc',
};

// 256-color palette (first 16 map to standard, 16-231 are 6x6x6 cube, 232-255 are grayscale)
function color256(n: number): string {
  if (n < 16) {
    // Map to our 16-color table via fg codes
    const fgCode = n < 8 ? n + 30 : n - 8 + 90;
    return COLORS_16[fgCode] || '#e2e8f0';
  }
  if (n < 232) {
    const idx = n - 16;
    const r = Math.floor(idx / 36);
    const g = Math.floor((idx % 36) / 6);
    const b = idx % 6;
    const toHex = (v: number) => (v === 0 ? 0 : 55 + v * 40);
    return `rgb(${toHex(r)},${toHex(g)},${toHex(b)})`;
  }
  // Grayscale: 232-255 → 8 to 238 in steps of 10
  const gray = 8 + (n - 232) * 10;
  return `rgb(${gray},${gray},${gray})`;
}

interface AnsiState {
  color: string | null;
  bgColor: string | null;
  bold: boolean;
  dim: boolean;
  italic: boolean;
  underline: boolean;
}

function defaultState(): AnsiState {
  return { color: null, bgColor: null, bold: false, dim: false, italic: false, underline: false };
}

function stateToStyle(state: AnsiState): CSSProperties {
  const style: CSSProperties = {};
  if (state.color) style.color = state.color;
  if (state.bgColor) style.backgroundColor = state.bgColor;
  if (state.bold) style.fontWeight = 'bold';
  if (state.dim) style.opacity = 0.6;
  if (state.italic) style.fontStyle = 'italic';
  if (state.underline) style.textDecoration = 'underline';
  return style;
}

function applySgr(params: number[], state: AnsiState): void {
  let i = 0;
  while (i < params.length) {
    const p = params[i];
    if (p === 0) {
      Object.assign(state, defaultState());
    } else if (p === 1) {
      state.bold = true;
    } else if (p === 2) {
      state.dim = true;
    } else if (p === 3) {
      state.italic = true;
    } else if (p === 4) {
      state.underline = true;
    } else if (p === 22) {
      state.bold = false;
      state.dim = false;
    } else if (p === 23) {
      state.italic = false;
    } else if (p === 24) {
      state.underline = false;
    } else if (p === 39) {
      state.color = null;
    } else if (p === 49) {
      state.bgColor = null;
    } else if (p >= 30 && p <= 37) {
      state.color = COLORS_16[p]!;
    } else if (p >= 90 && p <= 97) {
      state.color = COLORS_16[p]!;
    } else if (p >= 40 && p <= 47) {
      state.bgColor = BG_COLORS_16[p]!;
    } else if (p >= 100 && p <= 107) {
      state.bgColor = BG_COLORS_16[p]!;
    } else if (p === 38) {
      // Extended foreground color
      if (i + 1 < params.length && params[i + 1] === 5 && i + 2 < params.length) {
        state.color = color256(params[i + 2]);
        i += 2;
      } else if (i + 1 < params.length && params[i + 1] === 2 && i + 4 < params.length) {
        state.color = `rgb(${params[i + 2]},${params[i + 3]},${params[i + 4]})`;
        i += 4;
      }
    } else if (p === 48) {
      // Extended background color
      if (i + 1 < params.length && params[i + 1] === 5 && i + 2 < params.length) {
        state.bgColor = color256(params[i + 2]);
        i += 2;
      } else if (i + 1 < params.length && params[i + 1] === 2 && i + 4 < params.length) {
        state.bgColor = `rgb(${params[i + 2]},${params[i + 3]},${params[i + 4]})`;
        i += 4;
      }
    }
    i++;
  }
}

// Match SGR sequences (\x1b[...m) and all other escape sequences to strip
// eslint-disable-next-line no-control-regex
const SGR_RE = /\x1b\[([0-9;]*)m/;
// Comprehensive: CSI (including private-mode ?/>/!), OSC, charset, save/restore, etc.
// eslint-disable-next-line no-control-regex
const ALL_ESC_RE = /\x1b(?:\[[\x20-\x3f]*[0-9;]*[\x20-\x3f]*[A-Za-z@`]|\].*?(?:\x07|\x1b\\)|\([0-9A-Za-z]|[78>= ])/g;

export function parseAnsi(text: string): AnsiSpan[] {
  const spans: AnsiSpan[] = [];
  const state = defaultState();
  let remaining = text;

  while (remaining.length > 0) {
    // Find the next SGR or escape sequence
    const sgrMatch = SGR_RE.exec(remaining);
    const escMatch = ALL_ESC_RE.exec(remaining);
    // Reset lastIndex since we're using exec on a global-flagged regex
    ALL_ESC_RE.lastIndex = 0;

    // Find the earliest escape of any kind
    let nextEscIndex = remaining.length;
    let nextEscLength = 0;
    let isSgr = false;
    let sgrParams = '';

    if (sgrMatch && sgrMatch.index !== undefined) {
      nextEscIndex = sgrMatch.index;
      nextEscLength = sgrMatch[0].length;
      isSgr = true;
      sgrParams = sgrMatch[1];
    }

    if (escMatch && escMatch.index !== undefined && escMatch.index < nextEscIndex) {
      // A non-SGR escape comes first — strip it
      nextEscIndex = escMatch.index;
      nextEscLength = escMatch[0].length;
      isSgr = false;
    }

    // Text before this escape
    if (nextEscIndex > 0) {
      const chunk = remaining.slice(0, nextEscIndex);
      if (chunk.length > 0) {
        const style = stateToStyle(state);
        spans.push({ text: chunk, style });
      }
    }

    if (nextEscLength === 0) break;

    // Apply SGR if it's a color/style sequence
    if (isSgr) {
      const params = sgrParams === '' ? [0] : sgrParams.split(';').map(Number);
      applySgr(params, state);
    }
    // Otherwise, strip the non-SGR escape (do nothing)

    remaining = remaining.slice(nextEscIndex + nextEscLength);
  }

  // Merge adjacent spans with identical styles
  const merged: AnsiSpan[] = [];
  for (const span of spans) {
    if (span.text.length === 0) continue;
    const prev = merged[merged.length - 1];
    if (prev && JSON.stringify(prev.style) === JSON.stringify(span.style)) {
      prev.text += span.text;
    } else {
      merged.push(span);
    }
  }

  return merged;
}
