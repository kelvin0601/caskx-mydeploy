import AuthStatus from "@/components/shared/auth/popup-status";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import { useMutation } from "@tanstack/react-query";
import authService from "@/services/auth";
import { useBoundStore } from "@/store";
import { toast } from "sonner";
import { AUTH_KEYS } from "@/lib/constants";

export default function AlertSuccess() {
    const { setOpenAlert } = useStoreAlertWrap();
    const { user } = useBoundStore();

    const forgotPasswordMutation = useMutation({
        mutationFn: authService.forgotPassword,
        mutationKey: [AUTH_KEYS.FORGOT_PASSWORD],
        onSuccess: () => {
            toast.success("Verification email resent successfully");
        },
    });

    const handleResend = async () => {
        if (!user?.email) {
            toast.error("User email not found");
            return;
        }
        await forgotPasswordMutation.mutateAsync({ email: user.email });
    };

    if (forgotPasswordMutation.isPending) {
        return (
            <div className="flex w-full flex-col items-center justify-center gap-6">
                <AuthStatus
                    status="pending"
                    title="Resending Email..."
                    className="mb:!space-y-6"
                >
                    We are resending the verification instructions to your
                    mailbox. This might take a moment.
                </AuthStatus>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center justify-center gap-6">
            <AuthStatus
                status="resend"
                buttonText="Resend Email"
                buttonVariant="action"
                className="mb:!space-y-6"
                title="Check Your Mailbox"
                action={handleResend}
                messageError={
                    forgotPasswordMutation.error?.message
                }
                secondaryLinkAction={() => setOpenAlert(false)}
            >
                Please follow the instructions in your mailbox to verify your
                account. If you don’t see it, check your spam folder or your
                credentials.
            </AuthStatus>
        </div>
    );
}
