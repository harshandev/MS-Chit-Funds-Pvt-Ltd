import { describe, expect, it } from "vitest";
import { computeBreakdown, validateRules, type SchemeRules } from "./chit";
import { rupees, formatINR, formatLakh } from "./money";

const rules: SchemeRules = {
  grossChit: rupees(100000), tickets: 20, instalments: 20, instalment: rupees(5000),
  commissionBps: 500, maxDiscountBps: 3000, dividendBasis: "all_tickets", prizedReceivesDividend: false,
};

describe("computeBreakdown", () => {
  it("calculates a 20% discount example", () => {
    const b = computeBreakdown(rules, 2000, 1);
    expect(b.discount).toBe(rupees(20000));
    expect(b.commission).toBe(rupees(5000));
    expect(b.netChit).toBe(rupees(80000));
    expect(b.distributable).toBe(rupees(15000));
    expect(b.dividendPerTicket).toBe(rupees(750));
    expect(b.payableNonWinner).toBe(rupees(4250));
    expect(b.payableWinner).toBe(rupees(5000));
    expect(b.remainingAfterWin).toBe(19);
    expect(b.futureObligationWinner).toBe(rupees(95000));
  });
  it("never produces negative distributable", () => {
    expect(computeBreakdown(rules, 100, 1).distributable).toBe(0);
  });
});

describe("validateRules", () => {
  it("accepts valid input", () => expect(validateRules(rules, 1500)).toEqual([]));
  it("rejects discount above cap and negatives", () => {
    expect(validateRules(rules, 4000).some((i) => i.field === "discount")).toBe(true);
    expect(validateRules(rules, -1).some((i) => i.field === "discount")).toBe(true);
  });
});

describe("money", () => {
  it("formats Indian grouping", () => {
    expect(formatINR(rupees(100000))).toContain("1,00,000");
    expect(formatLakh(rupees(300000))).toBe("₹3 lakh");
  });
});
