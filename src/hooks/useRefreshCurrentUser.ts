"use client";

import { AUTH_KEYS } from "@/lib/constants/key";
import authService from "@/services/auth";
import { useBoundStore } from "@/store";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

export function useRefreshCurrentUser() {
    const queryClient = useQueryClient();
    const setMyUser = useBoundStore((state) => state.setMyUser);

    return useCallback(async () => {
        const user = await queryClient.fetchQuery({
            queryKey: [AUTH_KEYS.WHOAMI],
            queryFn: authService.whoami,
            staleTime: 0,
        });
        const twoFactorMethods = user.twoFactorMethods;
        const currentUser = {
            ...user,
            isGoogleAuth: twoFactorMethods?.includes("app"),
            isSMSAuth: twoFactorMethods?.includes("sms"),
        };

        setMyUser(currentUser);

        return currentUser;
    }, [queryClient, setMyUser]);
}
