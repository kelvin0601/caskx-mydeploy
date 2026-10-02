import IconMail from "@/components/shared/icons/icon-mail";
import { cn } from "@/lib/utils";
import authService from "@/services/auth";
import { useBoundStore } from "@/store";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { useCaskDetail } from "../provider";

export default function PopupCheckEmail({ className }: { className?: string }) {
    const { setIsOpenDialogVerify } = useCaskDetail();
    const { user } = useBoundStore();
    const [countdown, setCountdown] = useState(60);

    const resendEmail = useMutation({
        mutationFn: authService.resendEmailVerification,
    });

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleResend = useCallback(async () => {
        if (countdown > 0) return;
        await resendEmail.mutateAsync(user?.email ?? "");
        setCountdown(60);
    }, [countdown, resendEmail, user?.email]);

    const maskEmail = (email?: string) => {
        if (!email) return "your email";
        const parts = email.split("@");
        if (parts.length !== 2) return email;
        const [name, domain] = parts;
        if (name.length <= 2) return `${name}******@${domain}`;
        return `${name.slice(0, 2)}******@${domain}`;
    };

    return (
        <div
            className={cn(
                "flex w-full flex-col items-center gap-8 tb:gap-6",
                className
            )}
        >
            {/* Circle Mail Icon Container */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-bd-brown-lighter bg-transparent text-bd-brown-lighter">
                <IconMail className="h-8 w-8" />
            </div>

            {/* Content Text Wrapper */}
            <div className="flex w-full flex-col items-center gap-2 text-center">
                <h3 className="font-reckless text-xl font-medium text-typo-primary">
                    Check Your Email
                </h3>
                <p className="max-w-sm font-inter text-sm leading-relaxed text-typo-soft">
                    We’ve sent a verification link to{" "}
                    <span className="font-semibold text-typo-primary">
                        {maskEmail(user?.email)}
                    </span>
                    . Please check your inbox and follow the instructions to
                    continue.
                </p>
            </div>

            {/* Resend Actions / Countdown */}
            <div className="flex items-center justify-center gap-1.5 text-sm font-medium">
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || resendEmail.isPending}
                    className={cn(
                        "select-none underline transition-colors duration-200",
                        countdown > 0 || resendEmail.isPending
                            ? "cursor-not-allowed text-typo-disable"
                            : "text-typo-primary hover:text-typo-primary/80"
                    )}
                >
                    {resendEmail.isPending ? "Resending..." : "Resend"}
                </button>
                {countdown > 0 && (
                    <span className="select-none text-typo-soft">
                        in 00:{countdown < 10 ? `0${countdown}` : countdown}
                    </span>
                )}
            </div>
        </div>
    );
}
