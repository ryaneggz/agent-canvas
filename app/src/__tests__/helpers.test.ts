import { describe, it, expect } from "vitest";
import { clamp, uid } from "@/utils/helpers";

describe("clamp", () => {
  it("returns min when value is below min", () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it("returns max when value is above max", () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("returns value when within range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("returns min when value equals min", () => {
    expect(clamp(0, 0, 10)).toBe(0);
  });

  it("returns max when value equals max", () => {
    expect(clamp(10, 0, 10)).toBe(10);
  });
});

describe("uid", () => {
  it("returns a string", () => {
    expect(typeof uid()).toBe("string");
  });

  it("returns a string of length 6", () => {
    expect(uid()).toHaveLength(6);
  });

  it("returns unique values on successive calls", () => {
    const a = uid();
    const b = uid();
    expect(a).not.toBe(b);
  });
});
