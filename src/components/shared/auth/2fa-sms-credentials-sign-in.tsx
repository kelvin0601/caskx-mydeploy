import CredentialsVerifying from "./credentials-verifying";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { updateSession } from "@/config/auth";
import { useAuth } from "@/hooks/useAuth";
import { SMS_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { convertTextHidden } from "@/lib/utils";
import { setupGoogleAuthSchema } from "@/lib/validators";
import { LoginStep } from "@/modules/login";
import { authWith2Fa } from "@/services/auth-2fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function SMS2FaCredentialsSignIn() {
    const { session, user, setCurrentStepLogin } = useAuth();
    const isEnabledFooter = user?.isSMSAuth && user?.isGoogleAuth;
    const [countdown, setCountdown] = useState(45);

    useEffect(() => {
        if (countdown === 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const formatTime = (seconds: number) => {
        return `00:${seconds.toString().padStart(2, "0")}`;
    };

    const verify2FaMutation = useMutation({
        mutationKey: [TWO_FA_KEYS.VERIFY_2FA],
        mutationFn: authWith2Fa.verifySMS2FaAuth,
        gcTime: Infinity,
    });

    const initiate2FaMutation = useQuery({
        queryKey: [SMS_KEYS.INITIATE_SMS_2FA, SMS_KEYS.SMS],
        queryFn: () =>
            authWith2Fa.chooseMethodSend2Fa({
                userId: session?.user?.id || "",
                method: "sms",
            }),
        retry: false,
        gcTime: 0,
    });

    const handleResend = async () => {
        if (countdown > 0) return;
        try {
            await initiate2FaMutation.refetch();
            setCountdown(45); // Reset countdown
        } catch (error) {
            console.error("Resend OTP error:", error);
        }
    };

    const form = useForm({
        resolver: zodResolver(setupGoogleAuthSchema),
        defaultValues: {
            pin: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof setupGoogleAuthSchema>) => {
        if (!session?.user?.id || !session?.user?.tempToken) return;
        try {
            const result = await verify2FaMutation.mutateAsync({
                userId: session.user.id,
                tempToken: session.user.tempToken,
                otpCode: data.pin,
            });

            if (result) {
                const res = await updateSession({
                    user: {
                        ...result,
                        role: session.user.role,
                    },
                });
                if (res?.user) {
                    window.location.href = ROUTE_PUBLIC.HOME;
                }
            }
        } catch (error) {
            form.setError("pin", {
                message: (error as Error)?.message || "Invalid 2FA code",
            });
        }
    };

    const pinValue = form.watch("pin");
    useEffect(() => {
        if (pinValue && pinValue.length === 6) {
            form.handleSubmit(onSubmit)();
        }
    }, [pinValue]);

    useEffect(() => {
        if (initiate2FaMutation.error) {
            form.setError("pin", {
                message:
                    initiate2FaMutation.error?.message || "Invalid 2FA code",
            });
        }
    }, [initiate2FaMutation.error]);

    const hasError = !!form.formState.errors.pin;
    const displayPhone = convertTextHidden(user?.phoneNumber || "", 4);
    const isVerifying =
        verify2FaMutation.isPending || verify2FaMutation.isSuccess;

    if (isVerifying) {
        return <CredentialsVerifying />;
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="relative flex w-full flex-col"
            >
                {/* Header text inside the modal - Gap is 32px to inputs */}
                <div className="mb-8 flex select-none flex-col gap-2 text-center tb:mb-6 mb:mb-6">
                    <h2 className="font-reckless text-xl font-medium text-typo-primary">
                        Check Your Phone
                    </h2>
                    <p className="font-inter text-sm leading-[1.5] text-typo-soft">
                        Enter the 6-digit code we sent to
                        <br /> {displayPhone}
                    </p>
                </div>

                <FormField
                    control={form.control}
                    name="pin"
                    render={({ field }) => (
                        <FormItem className="space-y-0">
                            <FormControl>
                                <InputOTP
                                    {...field}
                                    autoFocus
                                    onChange={(e) => {
                                        const value = e.replace(/[^0-9]/g, "");
                                        field.onChange(value);
                                    }}
                                    maxLength={6}
                                    className="w-full"
                                >
                                    <InputOTPGroup className="w-full justify-center gap-1">
                                        <InputOTPSlot
                                            index={0}
                                            isError={hasError}
                                            className="rounded-none"
                                        />
                                        <InputOTPSlot
                                            index={1}
                                            isError={hasError}
                                            className="rounded-none"
                                        />
                                        <InputOTPSlot
                                            index={2}
                                            isError={hasError}
                                            className="rounded-none"
                                        />
                                        <InputOTPSlot
                                            index={3}
                                            isError={hasError}
                                            className="rounded-none"
                                        />
                                        <InputOTPSlot
                                            index={4}
                                            isError={hasError}
                                            className="rounded-none"
                                        />
                                        <InputOTPSlot
                                            index={5}
                                            isError={hasError}
                                            className="rounded-none"
                                        />
                                    </InputOTPGroup>
                                </InputOTP>
                            </FormControl>
                            <FormMessage className="!mt-1.5 text-center font-inter text-sm text-error" />
                        </FormItem>
                    )}
                />

                {/* Footer area - Gap is 24px from inputs */}
                <div className="mt-6 flex flex-col gap-4">
                    {/* Resend Block - Gap is 4px horizontally */}
                    <div className="flex select-none flex-row items-center justify-center gap-1 text-sm">
                        <Button
                            variant="link"
                            disabled={countdown > 0}
                            onClick={handleResend}
                            className="h-auto p-0 font-medium text-typo-primary"
                        >
                            Resend
                        </Button>
                        {countdown > 0 && (
                            <span className="font-inter text-typo-note">
                                in {formatTime(countdown)}
                            </span>
                        )}
                    </div>

                    {/* Switch Block - Horizontal single line! Gap is 4px horizontally */}
                    {isEnabledFooter && (
                        <div className="flex flex-row items-center justify-center gap-1 border-t border-bg-dark-main/10 pt-4 font-inter text-sm">
                            <span className="text-typo-note">
                                Prefer using your app?
                            </span>
                            <Button
                                variant="link"
                                className="h-auto p-0 font-medium text-typo-primary"
                                onClick={() =>
                                    setCurrentStepLogin(
                                        LoginStep.AUTH_APP,
                                        true
                                    )
                                }
                            >
                                Get authenticator code
                            </Button>
                        </div>
                    )}
                </div>
            </form>
        </Form>
    );
}
