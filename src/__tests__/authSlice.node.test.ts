/** @jest-environment node */

import { create } from "zustand";
import { createAuthSlice } from "@/store/slices/authSlice";

describe("createAuthSlice (node env)", () => {
    it("nextStep/prevStep do not crash without window", () => {
        const useTestStore = create(createAuthSlice);

        expect(() => useTestStore.getState().nextStep()).not.toThrow();
        expect(() => useTestStore.getState().prevStep()).not.toThrow();
    });
});
