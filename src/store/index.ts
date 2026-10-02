import { env } from "@/config/env";
import { store } from "@/types/store";
import { create } from "zustand";
import { createAuthSlice } from "./slices/authSlice";
import { createCaskSlice } from "./slices/caskSlice";
import { devtools } from "zustand/middleware";
import { createDistilleriesSlice } from "./slices/distilleriesSlice";

// Account Store
export * from "./account";

export const useBoundStore = create<
    store.TAuth & store.TCask & store.TDistilleries
>()(
    devtools(
        (...a) => ({
            ...createAuthSlice(...a),
            ...createCaskSlice(...a),
            ...createDistilleriesSlice(...a),
        }),
        {
            enabled: env.isDevelopment,
        }
    )
);
