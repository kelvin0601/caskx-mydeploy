import { useBoundStore } from "@/store";
import { useSessionWithCache } from "./useSession";

function handleCheckIsCurrentAuth(methods: string[] = []) {
    const isEnabled =
        methods.length > 0 &&
        (methods.includes("app") || methods.includes("sms"));
    return {
        isEnabled,
        isApp: isEnabled && methods.includes("app"),
        isSms: isEnabled && methods.includes("sms"),
    };
}

export function useAuth() {
    const { session, status } = useSessionWithCache();
    const {
        user,
        isLogin,
        currentStep,
        totalStep,
        isBackAction,
        setMyUser,
        reset,
        nextStep,
        prevStep,
        setCurrentStepLogin,
        setTotalStep,
    } = useBoundStore();

    const availableMethods = user?.availableMethods || [];
    const {
        isEnabled: is2faEnabled,
        isApp: is2faApp,
        isSms: is2faSms,
    } = handleCheckIsCurrentAuth(availableMethods);

    return {
        // Session
        session,
        status,
        accessToken: session?.user?.accessToken || null,

        // User
        user,
        isLogin,
        isAuthenticated: isLogin && !!user,
        isLoading: status === "loading",

        // 2FA
        is2faEnabled,
        is2faApp,
        is2faSms,

        // Actions
        setMyUser,
        reset,

        // Login steps
        currentStep,
        totalStep,
        isBackAction,
        nextStep,
        prevStep,
        setCurrentStepLogin,
        setTotalStep,
    };
}
