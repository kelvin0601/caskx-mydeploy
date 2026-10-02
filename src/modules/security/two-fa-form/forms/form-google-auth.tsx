import ImagePreload from "@/components/shared/image-preload";
import CustomTooltip, {
    TCustomTooltipRef,
} from "@/components/shared/tooltips-custom";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useDisableButtonForm } from "@/hooks/useDisableButtonForm";
import { AUTH_KEYS, DEVICE_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { convertSpaceBetweenWords } from "@/lib/utils";
import { setupGoogleAuthSchema } from "@/lib/validators";
import { authWith2Fa } from "@/services/auth-2fa";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ItemSetupGoogleAuth } from "../item-setup-google-auth";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import { HeaderSkeleton } from "../skeleton/header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import useGetStateQuery from "@/hooks/useGetStateQuery";

export const FormSetupGoogleAuth = () => {
    const { setStep, setIsOpenDialog, sessionData, setSessionData } =
        useStoreDialogWrap();
    const tooltipRef = useRef<TCustomTooltipRef>(null);
    const { user, setMyUser } = useAuth();
    const queryClient = useQueryClient();
    const getDevicesQuery = useGetStateQuery({
        key: [DEVICE_KEYS.GET_DEVICES],
        fetchFn: authWith2Fa.get2FaDevices,
    });
    const devicesActive = getDevicesQuery?.data?.devices.filter(
        (dv) => dv.isActive
    );

    const enableGoogleQuery = useQuery({
        queryKey: [TWO_FA_KEYS.ENABLE_GOOGLE_AUTH],
        queryFn: () => {
            return authWith2Fa.enable2FaGoogleAuthDevice({
                deviceName: sessionData?.name,
            });
        },
        refetchOnWindowFocus: false,
    });

    const verifyGoogleMutation = useMutation({
        mutationKey: [TWO_FA_KEYS.VERIFY_GOOGLE_AUTH],
        mutationFn: authWith2Fa.verify2FaDevices,
    });
    const isNotAuth =
        [user?.twoFactorEnabled, user?.isSMSAuth].filter(Boolean).length === 0;

    const form = useForm<z.infer<typeof setupGoogleAuthSchema>>({
        resolver: zodResolver(setupGoogleAuthSchema),
        defaultValues: {
            pin: "",
        },
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });

    const onSubmit = async (data: z.infer<typeof setupGoogleAuthSchema>) => {
        if (!enableGoogleQuery.data?.deviceId) return;
        try {
            await verifyGoogleMutation.mutateAsync({
                deviceId: enableGoogleQuery.data?.deviceId,
                token: data.pin,
            });
            handleContinue();

            if (devicesActive?.length) {
                toast.success("Device Added");
            } else {
                toast.success("Authenticator app is now enabled");
            }

            // invalidate query
            queryClient.invalidateQueries({
                queryKey: [TWO_FA_KEYS.ENABLE_GOOGLE_AUTH],
            });
            // Prefetch multiple queries in parallel
            await Promise.allSettled([
                queryClient.prefetchQuery({
                    queryKey: [DEVICE_KEYS.GET_DEVICES],
                    queryFn: authWith2Fa.get2FaDevices,
                    staleTime: 0,
                }),
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
        } catch (error) {
            form.setError("pin", {
                message: (error as Error).message,
                type: "manual",
            });
        }
        setMyUser({
            ...user!,
            isGoogleAuth: true,
        });
        setSessionData(undefined);
    };
    const handleBack = () => {
        setStep("chooseMethod", true);
    };
    const handleContinue = async () => {
        setIsOpenDialog(false);
        await new Promise((resolve) => setTimeout(resolve, 100));
        setStep("checkPassword");
    };
    const isDisable = useDisableButtonForm(form);
    const isLoading = enableGoogleQuery.isLoading;
    const isMobile = useIsMobile();
    const WrapAuthDiv = isMobile ? ScrollArea : "div";
    if (isLoading) return <FormGoogleAuthSkeleton />;
    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Set Up Authenticator App
                    </DialogTitle>
                </div>
            </DialogHeader>
            <WrapAuthDiv className="mb:max-h-[60vh]">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-5">
                        <ItemSetupGoogleAuth
                            title="1. Download the authenticator app on your devices"
                            description="Authenticator apps can be downloaded from the App Store, Google Play, or other app stores."
                        />
                        <ItemSetupGoogleAuth
                            title="2. Scan this QR code"
                            description="Scan this QR code with the Authenticator app."
                        >
                            <div className="flex flex-row items-end gap-5">
                                <div className="relative h-[7.5rem] w-[7.5rem] flex-shrink-0 overflow-hidden rounded-md border border-bd-brown">
                                    {enableGoogleQuery.data?.qrCodeUrl && (
                                        <ImagePreload
                                            src={
                                                enableGoogleQuery.data
                                                    ?.qrCodeUrl
                                            }
                                            alt="QR authenticator"
                                            width={120}
                                            height={120}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex h-[7.5rem] flex-1 flex-row items-end gap-2 mb:flex-col mb:items-start mb:justify-between">
                                    <div className="break-words text-sm font-semibold leading-[1.2] text-typo-note">
                                        {enableGoogleQuery?.data?.secret &&
                                            convertSpaceBetweenWords({
                                                text: enableGoogleQuery.data
                                                    .secret,
                                                wordCount: 4,
                                            })}
                                    </div>
                                    <div
                                        className="w-max"
                                        onClick={() => {
                                            if (!enableGoogleQuery.data?.secret)
                                                return;
                                            navigator.clipboard.writeText(
                                                enableGoogleQuery.data.secret
                                            );
                                            tooltipRef?.current?.setIsShow(
                                                true
                                            );
                                        }}
                                        onMouseLeave={() => {
                                            tooltipRef?.current?.setIsShow(
                                                false
                                            );
                                        }}
                                    >
                                        <CustomTooltip
                                            childClass="bottom-[calc(100%)] left-1/2 -translate-x-1/2"
                                            content={"Security key copied!"}
                                            isHide={false}
                                            isTrigger={true}
                                            ref={tooltipRef}
                                        >
                                            <Button
                                                variant="link"
                                                className="h-auto p-0 font-medium text-typo-primary"
                                            >
                                                Copy Key
                                            </Button>
                                        </CustomTooltip>
                                    </div>
                                </div>
                            </div>
                        </ItemSetupGoogleAuth>
                        <ItemSetupGoogleAuth
                            title="3. Copy and enter 6-digit code"
                            description="After the QR code has been scanned, the Authenticator app will generate a 6-digit code. Copy the code and come back to enter it."
                        >
                            <div className="mt-1 flex flex-col gap-2">
                                <Form {...form}>
                                    <form
                                        onSubmit={form.handleSubmit(onSubmit)}
                                        className="flex w-full flex-col gap-8 overflow-hidden mb:gap-6"
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
                                                                const value =
                                                                    e.replace(
                                                                        /[^0-9]/g,
                                                                        ""
                                                                    );
                                                                field.onChange(
                                                                    value
                                                                );
                                                            }}
                                                            maxLength={6}
                                                            className="w-full"
                                                        >
                                                            <InputOTPGroup className="w-full justify-start gap-1">
                                                                <InputOTPSlot
                                                                    index={0}
                                                                    className="h-12 w-12"
                                                                />
                                                                <InputOTPSlot
                                                                    index={1}
                                                                    className="h-12 w-12"
                                                                />
                                                                <InputOTPSlot
                                                                    index={2}
                                                                    className="h-12 w-12"
                                                                />
                                                                <InputOTPSlot
                                                                    index={3}
                                                                    className="h-12 w-12"
                                                                />
                                                                <InputOTPSlot
                                                                    index={4}
                                                                    className="h-12 w-12"
                                                                />
                                                                <InputOTPSlot
                                                                    index={5}
                                                                    className="h-12 w-12"
                                                                />
                                                            </InputOTPGroup>
                                                        </InputOTP>
                                                    </FormControl>
                                                    <FormMessage className="mt-1.5" />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex w-full flex-row gap-1">
                                            <Button
                                                className="flex-1"
                                                variant={"outline"}
                                                type="button"
                                                size="xl"
                                                onClick={handleBack}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                type="submit"
                                                className="flex-1"
                                                disabled={
                                                    isDisable ||
                                                    form.formState.isSubmitting
                                                }
                                                variant={"action"}
                                                size="xl"
                                            >
                                                Continue
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </div>
                        </ItemSetupGoogleAuth>
                    </div>
                </div>
            </WrapAuthDiv>
        </div>
    );
};

export const FormGoogleAuthSkeleton = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <Skeleton className="h-8 w-64 tb:h-6" />
                </div>
            </div>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-72" />
                        <div className="mt-2 flex flex-row items-end gap-5">
                            <Skeleton className="h-[7.5rem] w-[7.5rem] flex-shrink-0 rounded-md" />
                            <div className="flex flex-1 flex-col gap-2 pb-2">
                                <Skeleton className="h-4 w-48" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-4 w-full" />
                        <div className="mt-3 flex flex-row gap-1">
                            <Skeleton className="h-12 w-12 flex-1 rounded-none" />
                            <Skeleton className="h-12 w-12 flex-1 rounded-none" />
                            <Skeleton className="h-12 w-12 flex-1 rounded-none" />
                            <Skeleton className="h-12 w-12 flex-1 rounded-none" />
                            <Skeleton className="h-12 w-12 flex-1 rounded-none" />
                            <Skeleton className="h-12 w-12 flex-1 rounded-none" />
                        </div>
                    </div>
                </div>
                <div className="flex w-full flex-row gap-1">
                    <Skeleton className="h-12 flex-1 rounded-md" />
                    <Skeleton className="h-12 flex-1 rounded-md" />
                </div>
            </div>
        </div>
    );
};
