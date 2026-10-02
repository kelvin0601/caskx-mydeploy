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
import { APP_KEYS, SMS_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { setupGoogleAuthSchema } from "@/lib/validators";
import { LoginStep } from "@/modules/login";
import { authWith2Fa } from "@/services/auth-2fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import CredentialsVerifying from "./credentials-verifying";

export default function TwoFaCredentialsSignIn() {
    const { session, user: userStore, setCurrentStepLogin } = useAuth();
    const isEnabledFooter = userStore?.isSMSAuth && userStore?.isGoogleAuth;

    const verify2FaMutation = useMutation({
        mutationKey: [TWO_FA_KEYS.VERIFY_2FA],
        mutationFn: authWith2Fa.verifyAccountWith2Fa,
        gcTime: Infinity,
        retry: false,
    });

    const initiate2FaMutation = useMutation({
        mutationKey: [SMS_KEYS.INITIATE_SMS_2FA, APP_KEYS.APP],
        mutationFn: () =>
            authWith2Fa.chooseMethodSend2Fa({
                userId: session?.user?.id || "",
                method: "app" as const,
            }),
        gcTime: 0,
        retry: false,
    });

    const form = useForm({
        resolver: zodResolver(setupGoogleAuthSchema),
        defaultValues: {
            pin: "",
        },
    });

    const onSubmit = async (data: z.infer<typeof setupGoogleAuthSchema>) => {
        if (!session?.user?.id || !session?.user?.tempToken) return;
        const sessionUser = session.user;
        try {
            const result = await verify2FaMutation.mutateAsync({
                userId: sessionUser.id || "",
                tempToken: sessionUser.tempToken || "",
                token: data.pin,
            });
            if (result) {
                console.log("result____", result);

                const res = await updateSession({
                    user: {
                        ...result,
                        role: sessionUser.role,
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
                        Go To Your Authentication App
                    </h2>
                    <p className="font-inter text-sm leading-[1.5] text-typo-soft">
                        Enter the 6-digit code for this account from
                        Authentication App.
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

                {isEnabledFooter && (
                    <div className="mt-6 flex flex-row items-center justify-center gap-1 font-inter text-sm">
                        <span className="text-typo-note">
                            Prefer using your phone?
                        </span>
                        <Button
                            variant={"link"}
                            onClick={() => setCurrentStepLogin(LoginStep.SMS)}
                        >
                            Get SMS code
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
