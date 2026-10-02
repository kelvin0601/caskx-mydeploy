import { useMemo } from "react";

export default function useCheckAuthStatus(methods: string[] = []) {
    const handleCheckIsCurrentAuth = (methods: string[] = []) => {
        const isEnabled =
            methods.length > 0 &&
            (methods.includes("app") || methods.includes("sms"));
        return {
            isEnabled,
            isApp: isEnabled && methods.includes("app"),
            isSms: isEnabled && methods.includes("sms"),
        };
    };
    const status = useMemo(() => {
        return handleCheckIsCurrentAuth(methods);
    }, [methods]);

    return { ...status };
}
