import { describe, expect, it } from "vitest";
import {
  formatLocalTime24,
  formatTime24Value,
  isCompleteTime24,
} from "@/lib/templates/date";

describe("24-hour time formatting", () => {
  it("uses zero-padded HH:mm without seconds", () => {
    expect(formatLocalTime24(new Date(2026, 0, 2, 3, 4, 59))).toBe("03:04");
    expect(formatLocalTime24(new Date(2026, 0, 2, 20, 32, 15))).toBe("20:32");
  });

  it("normalizes valid values and rejects incomplete or invalid values", () => {
    expect(formatTime24Value("7:05")).toBe("07:05");
    expect(formatTime24Value("23:59")).toBe("23:59");
    expect(formatTime24Value("24:00")).toBe("");
    expect(formatTime24Value("09:60")).toBe("");
    expect(formatTime24Value("09")).toBe("");
    expect(isCompleteTime24("09:05")).toBe(true);
    expect(isCompleteTime24("9:05")).toBe(false);
  });
});
