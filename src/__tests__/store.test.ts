// Mock dependencies
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

import { create } from "zustand";
import { createAuthSlice } from "@/store/slices/authSlice";

// ============================================
// Auth Slice Tests
// ============================================
describe("createAuthSlice", () => {
    const useTestStore = create(createAuthSlice);

    beforeAll(() => {
        // jsdom doesn't implement scrollTo; mock to avoid console noise
        Object.defineProperty(window, "scrollTo", {
            value: jest.fn(),
            writable: true,
        });
    });

    beforeEach(() => {
        (window.scrollTo as jest.Mock).mockClear?.();
        useTestStore.setState({
            user: null,
            isLogin: false,
            currentStep: 1,
            totalStep: 3,
            isBackAction: false,
        });
    });

    it("has correct initial state", () => {
        const state = useTestStore.getState();
        expect(state.user).toBeNull();
        expect(state.isLogin).toBe(false);
        expect(state.currentStep).toBe(1);
        expect(state.totalStep).toBe(3);
        expect(state.isBackAction).toBe(false);
    });

    it("setMyUser sets user and isLogin", () => {
        const mockUser = { id: "1", email: "test@example.com" } as any;

        useTestStore.getState().setMyUser(mockUser);

        const state = useTestStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isLogin).toBe(true);
    });

    it("setMyUser with null sets isLogin to false", () => {
        useTestStore.getState().setMyUser(null);

        const state = useTestStore.getState();
        expect(state.user).toBeNull();
        expect(state.isLogin).toBe(false);
    });

    it("reset returns to initial state", () => {
        // Set some values first
        useTestStore.getState().setMyUser({ id: "1" } as any);
        useTestStore.getState().setCurrentStepLogin(3, true);

        // Reset
        useTestStore.getState().reset();

        const state = useTestStore.getState();
        expect(state.user).toBeNull();
        expect(state.isLogin).toBe(false);
        expect(state.currentStep).toBe(1);
        expect(state.isBackAction).toBe(false);
    });

    it("setCurrentStepLogin updates step and isBackAction", () => {
        useTestStore.getState().setCurrentStepLogin(2, true);

        const state = useTestStore.getState();
        expect(state.currentStep).toBe(2);
        expect(state.isBackAction).toBe(true);
    });

    it("setTotalStep updates totalStep", () => {
        useTestStore.getState().setTotalStep(5);

        expect(useTestStore.getState().totalStep).toBe(5);
    });

    it("nextStep increments currentStep", () => {
        useTestStore.getState().nextStep();

        expect(useTestStore.getState().currentStep).toBe(2);
        expect(useTestStore.getState().isBackAction).toBe(false);
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: "instant",
        });
    });

    it("prevStep decrements currentStep", () => {
        useTestStore.getState().setCurrentStepLogin(3);
        useTestStore.getState().prevStep();

        expect(useTestStore.getState().currentStep).toBe(2);
        expect(useTestStore.getState().isBackAction).toBe(true);
        expect(window.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: "instant",
        });
    });

    it("prevStep does not go below 1", () => {
        useTestStore.getState().prevStep();

        expect(useTestStore.getState().currentStep).toBe(1);
    });
});
