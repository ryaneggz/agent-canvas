import { describe, it, expect } from "vitest";
import { lineColor, lineIcon, statusColor, shellBadge } from "@/utils/lineFormatting";
import { T } from "@/theme";

describe("lineColor", () => {
  it("returns T.accent for stdin type", () => {
    expect(lineColor("stdin")).toBe(T.accent);
  });

  it("returns T.text for stdout type", () => {
    expect(lineColor("stdout")).toBe(T.text);
  });

  it("returns T.red for stderr type", () => {
    expect(lineColor("stderr")).toBe(T.red);
  });

  it("returns T.textDim for system type", () => {
    expect(lineColor("system")).toBe(T.textDim);
  });
});

describe("lineIcon", () => {
  it('returns "$" for stdin type', () => {
    expect(lineIcon("stdin")).toBe("$");
  });

  it('returns "│" for stdout type', () => {
    expect(lineIcon("stdout")).toBe("│");
  });

  it('returns "!" for stderr type', () => {
    expect(lineIcon("stderr")).toBe("!");
  });

  it('returns "·" for system type', () => {
    expect(lineIcon("system")).toBe("·");
  });
});

describe("statusColor", () => {
  it("returns T.green for active status", () => {
    expect(statusColor("active")).toBe(T.green);
  });

  it("returns T.red for error status", () => {
    expect(statusColor("error")).toBe(T.red);
  });

  it("returns T.textDim for idle status", () => {
    expect(statusColor("idle")).toBe(T.textDim);
  });
});

describe("shellBadge", () => {
  it("returns correct badge for bash", () => {
    const badge = shellBadge("bash");
    expect(badge.bg).toBe("rgba(192,132,252,0.15)");
    expect(badge.fg).toBe(T.accent);
    expect(badge.label).toBe("bash");
  });

  it("returns correct badge for zsh", () => {
    const badge = shellBadge("zsh");
    expect(badge.bg).toBe("rgba(34,211,238,0.12)");
    expect(badge.fg).toBe(T.cyan);
    expect(badge.label).toBe("zsh");
  });

  it("returns correct badge for sh", () => {
    const badge = shellBadge("sh");
    expect(badge.bg).toBe("rgba(251,191,36,0.12)");
    expect(badge.fg).toBe(T.amber);
    expect(badge.label).toBe("sh");
  });

  it("returns correct badge for fish", () => {
    const badge = shellBadge("fish");
    expect(badge.bg).toBe("rgba(52,211,153,0.12)");
    expect(badge.fg).toBe(T.green);
    expect(badge.label).toBe("fish");
  });
});
