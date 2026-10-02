import AuthStatus from "@/components/shared/auth/popup-status";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import useGetMutationState from "@/hooks/useGetMutationState";
import { AUTH_KEYS } from "@/lib/constants";
import { useSession } from "next-auth/react";

export default function AlertError() {
    const { setOpenAlert } = useStoreAlertWrap();
    const { data: session } = useSession();
    const user = session?.user;
    const resendEmailCache = useGetMutationState({
        key: [AUTH_KEYS.FORGOT_PASSWORD, user?.email],
    });

    return (
        <div className="flex flex-col items-center justify-center gap-8 mb:gap-6">
            <AuthStatus
                status="resend"
                buttonText="Got it"
                title="Try again later"
                action={() => setOpenAlert(false)}
                messageError={resendEmailCache?.error?.message}
            >
                Something went wrong, please try again.
            </AuthStatus>
        </div>
    );
}
