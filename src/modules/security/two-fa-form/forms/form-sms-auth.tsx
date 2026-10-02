import { Button } from "@/components/ui/button";
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { useAuth } from "@/hooks/useAuth";
import { cn, convertTextHidden } from "@/lib/utils";
import { setupGoogleAuthSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import { useDisableButtonForm } from "@/hooks/useDisableButtonForm";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authWith2Fa } from "@/services/auth-2fa";
import { AUTH_KEYS, SMS_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import AuthStatus from "@/components/shared/auth/popup-status";

export const FormSetupSMSAuth = () => {
    const { setStep, setIsOpenDialog } = useStoreDialogWrap();
    const { setMyUser, user } = useAuth();
    const isNotAuth =
        [user?.twoFactorEnabled, user?.isSMSAuth].filter(Boolean).length === 0;
    const queryClient = useQueryClient();
    const [timeLeft, setTimeLeft] = useState(60);

    useEffect(() => {
        if (timeLeft <= 0) {
            form.setError("pin", { message: "" });
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const form = useForm<z.infer<typeof setupGoogleAuthSchema>>({
        resolver: zodResolver(setupGoogleAuthSchema),
        defaultValues: {
            pin: "",
        },
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });
    //init sms 2fa
    const startInitSMS2FaQuery = useQuery({
        queryKey: [SMS_KEYS.SMS_START_INIT],
        queryFn: () => authWith2Fa.startInitSMS2Fa({ id: user?.id || "" }),
        staleTime: 60,
    });

    // verify sms 2fa
    const smsAuthVerifyMutation = useMutation({
        mutationKey: [SMS_KEYS.SMS_VERIFY, SMS_KEYS.SMS_ENABLE],
        mutationFn: (data: { code: string }) =>
            authWith2Fa.verifySMS2FaEnable({
                userId: user?.id || "",
                otpCode: data?.code,
            }),
        onSuccess: (d) => {
            if (!d.success) {
                form.setError("pin", {
                    message: d?.message || "Something went wrong",
                });
            }
        },
        onError: (error) => {
            form.setError("pin", {
                message: error?.message || "Something went wrong",
            });
        },
    });

    // after verify to enable sms 2fa
    const smsAuthEnableMutation = useMutation({
        mutationKey: [SMS_KEYS.SMS_ENABLE],
        mutationFn: () => authWith2Fa.enabledSMS2Fa({ id: user?.id || "" }),
    });
    const onSubmit = async (data: z.infer<typeof setupGoogleAuthSchema>) => {
        try {
            const res = await smsAuthVerifyMutation.mutateAsync({
                code: data.pin,
            });
            if (!res.success) {
                throw new Error(res.message);
            }
            await smsAuthEnableMutation.mutateAsync();

            queryClient.invalidateQueries({
                queryKey: [SMS_KEYS.SMS_START_INIT],
            });
            // Prefetch multiple queries in parallel
            await Promise.allSettled([
                queryClient.prefetchQuery({
                    queryKey: [AUTH_KEYS.WHOAMI],
                    staleTime: 0,
                    queryFn: authWith2Fa.whoami,
                }),
                queryClient.prefetchQuery({
                    queryKey: [TWO_FA_KEYS.STATUS],
                    staleTime: 0,
                    queryFn: authWith2Fa.status2FaDevices,
                }),
            ]);
            if (isNotAuth) {
                toast.success("Two-factor authentication is on");
            } else {
                toast.success("SMS authentication is on");
            }
            setIsOpenDialog(false);

            await new Promise((resolve) => setTimeout(resolve, 100));

            if (user) {
                setMyUser({
                    ...user,
                    isSMSAuth: true,
                });
            }
            setStep("checkPassword");
        } catch (error) {
            form.setError("pin", {
                message: (error as Error)?.message || "Something went wrong",
                type: "manual",
            });
        }
    };
    const handleBack = () => {
        setStep("chooseMethod", true);
    };
    const handleResendCode = async () => {
        if (timeLeft > 0) return;
        try {
            const result = await startInitSMS2FaQuery.refetch();
            if (!result.data?.success) {
                form.setError("pin", {
                    message: result.data?.message || "Something went wrong",
                });
                const seconds = result.data?.message.replace(/[^0-9]/g, "");
                setTimeLeft(Number(seconds));
                return;
            } else {
                toast.success("Verification code resent");
            }
        } catch (error) {
            form.setError("pin", {
                message: (error as Error)?.message || "Something went wrong",
                type: "manual",
            });
            toast.success("Verification code resent");
        }
    };
    useEffect(() => {
        if (startInitSMS2FaQuery.error) {
            toast.error(
                startInitSMS2FaQuery?.error?.message || "Something went wrong"
            );
        }
    }, [startInitSMS2FaQuery.error]);

    const isDisabled = form.formState.isSubmitting;

    if (startInitSMS2FaQuery.isLoading) return <FormSetupSMSSkeleton />;

    if (form.formState.isSubmitting) {
        return (
            <div className="flex flex-col gap-8 pb-4">
                <DialogHeader className="hidden">
                    <DialogTitle>Verifying Code</DialogTitle>
                </DialogHeader>
                <AuthStatus status="pending" title="Verifying Code">
                    We are confirming your details. This might take a moment.
                </AuthStatus>
            </div>
        );
    }

    const number = convertTextHidden(
        user?.phoneNumber || "",
        (user?.phoneNumber?.length || 3) - 3
    );
    return (
        <div className="flex flex-col gap-8">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="items-center text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Enter Confirmation Code
                    </DialogTitle>
                    <DialogDescription
                        className="text-center text-sm text-typo-soft"
                        dangerouslySetInnerHTML={{
                            __html: `Enter the code that we sent to <span class="font-workSans">${number}</span>`,
                        }}
                    />
                </div>
            </DialogHeader>
            <div className="flex flex-col">
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex w-full flex-col gap-4"
                    >
                        <FormField
                            control={form.control}
                            name="pin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <InputOTP
                                            {...field}
                                            onChange={(e) => {
                                                const value = e.replace(
                                                    /[^0-9]/g,
                                                    ""
                                                );
                                                field.onChange(value);
                                                if (value.length === 6) {
                                                    onSubmit({ pin: value });
                                                }
                                            }}
                                            maxLength={6}
                                            className="w-full"
                                        >
                                            <InputOTPGroup className="w-full gap-1">
                                                <InputOTPSlot
                                                    index={0}
                                                    className="h-12 w-12 flex-1"
                                                />
                                                <InputOTPSlot
                                                    index={1}
                                                    className="h-12 w-12 flex-1"
                                                />
                                                <InputOTPSlot
                                                    index={2}
                                                    className="h-12 w-12 flex-1"
                                                />
                                                <InputOTPSlot
                                                    index={3}
                                                    className="h-12 w-12 flex-1"
                                                />
                                                <InputOTPSlot
                                                    index={4}
                                                    className="h-12 w-12 flex-1"
                                                />
                                                <InputOTPSlot
                                                    index={5}
                                                    className="h-12 w-12 flex-1"
                                                />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormMessage className="mt-1.5 max-w-[20rem]" />
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-col items-center justify-center gap-6 mb:gap-5">
                            <div className="flex flex-row items-center gap-1">
                                <Button
                                    type="button"
                                    variant="link"
                                    className={cn(
                                        "h-auto p-0 font-medium text-typo-primary",
                                        timeLeft > 0 &&
                                            "!text-typo-disable [--text-color:hsl(var(--disable-text))]"
                                    )}
                                    onClick={handleResendCode}
                                    disabled={timeLeft > 0}
                                >
                                    Resend
                                </Button>
                                {timeLeft > 0 && (
                                    <div className="text-sm text-typo-soft">
                                        in {formatTime(timeLeft)}
                                    </div>
                                )}
                            </div>
                            <div className="flex w-full">
                                <Button
                                    className="w-full"
                                    type="button"
                                    variant={"outline"}
                                    size="xl"
                                    onClick={handleBack}
                                    disabled={isDisabled}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

const FormSetupSMSSkeleton = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <Skeleton className="h-8 w-64 tb:h-6" />
                    <Skeleton className="h-4 w-72" />
                </div>
            </div>
            <div className="flex flex-col">
                <div className="flex w-full flex-col gap-6">
                    <div className="flex flex-row gap-1">
                        <Skeleton className="h-12 w-12 flex-1" />
                        <Skeleton className="h-12 w-12 flex-1" />
                        <Skeleton className="h-12 w-12 flex-1" />
                        <Skeleton className="h-12 w-12 flex-1" />
                        <Skeleton className="h-12 w-12 flex-1" />
                        <Skeleton className="h-12 w-12 flex-1" />
                    </div>
                    <div className="flex flex-col items-center justify-center gap-6">
                        <Skeleton className="h-4 w-32" />
                        <div className="flex w-full">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
