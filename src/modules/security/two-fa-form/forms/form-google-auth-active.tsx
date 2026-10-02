import IconPlus from "@/components/shared/icons/icon-plus";
import { Button } from "@/components/ui/button";
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_KEYS, DEVICE_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { authWith2Fa } from "@/services/auth-2fa";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import ItemAuthSession from "../item-auth-session";
import { ItemTwoFa } from "../item-two-fa";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import { AUTH_OPTIONS } from "./form-choose-two-fa";
import { HeaderSkeleton } from "../skeleton/header-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export const FormGoogleAuthActive = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { setStep, setIsOpenDialog } = useStoreDialogWrap();
    const { setOpenAlert, setDataAlert, setTypeAlert } = useStoreAlertWrap();
    const isJustOneActiveAuth =
        [user?.isGoogleAuth, user?.isSMSAuth].filter(Boolean).length === 1;
    const getDevicesQuery = useQuery({
        queryKey: [DEVICE_KEYS.GET_DEVICES],
        queryFn: authWith2Fa.get2FaDevices,
    });
    const turnOffGoogleAuthMutation = useMutation({
        mutationFn: authWith2Fa.disable2FaGoogleAuthDevices,
        mutationKey: [TWO_FA_KEYS.DISABLE_GOOGLE_AUTH],
    });
    const devices =
        getDevicesQuery?.data?.devices?.filter((item) => item.isActive) || [];

    if (getDevicesQuery.isLoading) return <FormGoogleAuthActiveSkeleton />;
    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Authenticator App
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        We&apos;ll now ask for a login code whenever you log in
                        on a device that we don&apos;t recognise.
                    </DialogDescription>
                </div>
            </DialogHeader>

            <div className="flex flex-col gap-8 mb:gap-6">
                <ItemTwoFa
                    {...AUTH_OPTIONS.GOOGLE}
                    isActive={user?.isGoogleAuth}
                    isRecommended
                    type="google"
                    actionSwitch={(open) => {
                        if (!open) {
                            setDataAlert({
                                actionPassed: async () => {
                                    await turnOffGoogleAuthMutation.mutateAsync();
                                    toast.success(
                                        "Authenticator app is now disabled"
                                    );
                                    setIsOpenDialog(false);

                                    await Promise.allSettled([
                                        queryClient.invalidateQueries({
                                            queryKey: [
                                                TWO_FA_KEYS.ENABLE_GOOGLE_AUTH,
                                            ],
                                        }),
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
                                            queryFn:
                                                authWith2Fa.status2FaDevices,
                                        }),
                                    ]);
                                },
                                title: "Turn off Two-Factor Authentication",
                                titleButtonPassed: "Turn off",
                                content: isJustOneActiveAuth
                                    ? "Turning off SMS leaves Authenticator App as your only protection. Continue?"
                                    : "Turning off Authenticator App leaves SMS authentication as your only protection. Continue",
                            });
                            setTypeAlert("confirm");
                            setOpenAlert(true);
                        }
                    }}
                />

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-typo-primary">
                            Connected devices
                        </div>
                        <div className="text-sm text-typo-sub">
                            Add multiple devices to get codes from authenticator
                            app.
                        </div>
                    </div>
                    <ScrollArea className="-mx-5 max-h-44 flex-col overflow-y-auto px-3">
                        <div className="flex flex-col gap-2 px-2 pb-2">
                            {devices?.map((device, i, args) => {
                                if (!device.isActive) return null;
                                return (
                                    <ItemAuthSession
                                        key={device.id}
                                        id={device.id}
                                        name={device.deviceName}
                                        // className={i === args.length - 1 ? "mb-1" : ""}
                                    />
                                );
                            })}
                        </div>
                    </ScrollArea>
                    <div className="flex flex-row gap-2">
                        <Button
                            className="!flex w-max flex-row items-center gap-1"
                            variant={"link"}
                            onClick={() => {
                                setStep("sessionAdd");
                            }}
                        >
                            Add Device
                        </Button>
                        <div className="h-4 w-4">
                            <IconPlus />
                        </div>
                    </div>
                </div>
            </div>

            <Button
                className="w-full"
                variant={"outline"}
                size="xl"
                onClick={() => {
                    setStep("chooseMethod", true);
                }}
            >
                Back
            </Button>
        </div>
    );
};

export const FormGoogleAuthActiveSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            <HeaderSkeleton />
            <div className="flex flex-col gap-5">
                <Skeleton className="flex w-full flex-row items-center justify-between bg-bg-sf2 p-4">
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-2 w-1/2 rounded-md" />
                        <Skeleton className="h-2 w-1/4 rounded-md" />
                    </div>
                    <Skeleton className="rounded-12 h-6 w-11"></Skeleton>
                </Skeleton>
                <div className="flex w-full flex-col gap-2 border-b border-solid border-bd-main pb-5">
                    <Skeleton className="h-2 w-1/3" />
                    <Skeleton className="h-2 w-1/4" />
                </div>
                <div className="flex flex-col gap-2">
                    <Skeleton className="flex flex-row items-center justify-between border border-solid bg-bg-sf2 px-3 py-2">
                        <Skeleton className="h-2 w-1/3" />
                        <div className="flex flex-row items-center gap-2">
                            <Skeleton className="h-6 w-6 rounded-md" />
                            <Skeleton className="h-6 w-6 rounded-md" />
                        </div>
                    </Skeleton>
                </div>
                <Skeleton className="h-2 w-1/3" />
            </div>
        </div>
    );
};
