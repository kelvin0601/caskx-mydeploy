// Mock dependencies
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

import {
    calculateDistancePercentage,
    findClosestIndex,
    getDifference,
} from "@/helpers/carousel";

// ============================================
// Carousel Helpers
// ============================================
describe("calculateDistancePercentage()", () => {
    it("calculates percentage correctly", () => {
        expect(calculateDistancePercentage(100, 50)).toBe(50);
    });

    it("handles 100% distance", () => {
        expect(calculateDistancePercentage(200, 200)).toBe(100);
    });

    it("handles 0 distance", () => {
        expect(calculateDistancePercentage(100, 0)).toBe(0);
    });

    it("handles large values", () => {
        expect(calculateDistancePercentage(1000, 750)).toBe(75);
    });
});

describe("findClosestIndex()", () => {
    it("finds closest snap point", () => {
        const scrollSnaps = [0, 0.25, 0.5, 0.75, 1];
        expect(findClosestIndex(scrollSnaps, 30)).toBe(1); // closest to 0.25
    });

    it("finds first snap point", () => {
        const scrollSnaps = [0, 0.25, 0.5, 0.75, 1];
        expect(findClosestIndex(scrollSnaps, 0)).toBe(0);
    });

    it("finds last snap point", () => {
        const scrollSnaps = [0, 0.25, 0.5, 0.75, 1];
        expect(findClosestIndex(scrollSnaps, 100)).toBe(4);
    });

    it("finds middle snap point", () => {
        const scrollSnaps = [0, 0.25, 0.5, 0.75, 1];
        expect(findClosestIndex(scrollSnaps, 50)).toBe(2);
    });

    it("handles single snap point", () => {
        expect(findClosestIndex([0.5], 50)).toBe(0);
    });
});

describe("getDifference()", () => {
    it("calculates positive difference", () => {
        expect(getDifference(10, 5)).toBe(5);
    });

    it("calculates absolute difference", () => {
        expect(getDifference(5, 10)).toBe(5);
    });

    it("returns 0 for equal values", () => {
        expect(getDifference(5, 5)).toBe(0);
    });

    it("handles negative values", () => {
        expect(getDifference(-5, 5)).toBe(10);
    });

    it("handles decimal values", () => {
        expect(getDifference(10.5, 5.5)).toBe(5);
    });
});
