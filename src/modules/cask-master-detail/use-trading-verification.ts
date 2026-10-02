"use client";

import { useRefreshCurrentUser } from "@/hooks/useRefreshCurrentUser";
import { useBoundStore } from "@/store";
import { auth } from "@/types";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useCaskDetail } from "./provider";

export function useTradingVerification() {
    const user = useBoundStore((state) => state.user);
    const refreshCurrentUser = useRefreshCurrentUser();
    const { setDialogType, setIsOpenDialogVerify } = useCaskDetail();
    const [isCheckingVerification, setIsCheckingVerification] = useState(false);
    const verificationPromiseRef =
        useRef<Promise<auth.TUserSchema | null> | null>(null);

    const getVerifiedUser = useCallback(async () => {
        if (verificationPromiseRef.current) {
            return verificationPromiseRef.current;
        }

        const verificationPromise = (async () => {
            setIsCheckingVerification(true);

            try {
                const currentUser =
                    user?.isVerified === true
                        ? user
                        : await refreshCurrentUser();

                if (currentUser.isVerified === true) {
                    return currentUser;
                }

                setDialogType("verify");
                setIsOpenDialogVerify(true);
                return null;
            } catch (error) {
                console.error("Failed to refresh current user", error);
                toast.error("Unable to check your verification status", {
                    description: "Please try again in a moment.",
                });
                return null;
            } finally {
                setIsCheckingVerification(false);
            }
        })();

        verificationPromiseRef.current = verificationPromise;

        try {
            return await verificationPromise;
        } finally {
            verificationPromiseRef.current = null;
        }
    }, [user, refreshCurrentUser, setDialogType, setIsOpenDialogVerify]);

    const runIfVerified = useCallback(
        async (
            action: (verifiedUser: auth.TUserSchema) => void | Promise<void>
        ) => {
            const verifiedUser = await getVerifiedUser();

            if (!verifiedUser) return false;

            await action(verifiedUser);
            return true;
        },
        [getVerifiedUser]
    );

    return { isCheckingVerification, runIfVerified };
}
