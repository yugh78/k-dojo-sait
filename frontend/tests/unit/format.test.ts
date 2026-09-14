import { describe, expect, it } from "vitest";
import { ageOutsideRange, formatPrice } from "../../app/utils/format";
describe("public content formatting", () => {
  it("keeps prices readable in Russian", () =>
    expect(formatPrice("4500.00").replace(/\s/g, " ")).toBe("4 500"));
  it("includes the boundary ages of Mowgli", () => {
    expect(ageOutsideRange(3, 3, 7)).toBe(false);
    expect(ageOutsideRange(7, 3, 7)).toBe(false);
    expect(ageOutsideRange(8, 3, 7)).toBe(true);
  });
  it("does not invent an upper age limit", () =>
    expect(ageOutsideRange(45, 7, null)).toBe(false));
});
