import { Button } from "@/components/ui/button";
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { AUTH_MESSAGES_ALERT } from "@/lib/constants";
import { AUTH_KEYS, SMS_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { convertTextHidden } from "@/lib/utils";
import { authWith2Fa } from "@/services/auth-2fa";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SwitchSecurity } from "../item-switch";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";

export const FormSMSAuthActive = () => {
    const { user } = useAuth();
    const { setOpenAlert, setDataAlert, setTypeAlert } = useStoreAlertWrap();
    const { setStep, setIsOpenDialog } = useStoreDialogWrap();
    const isJustOneActiveAuth =
        [user?.isGoogleAuth, user?.isSMSAuth].filter(Boolean).length === 1;
    const queryClient = useQueryClient();

    const disableSMS2FaMutation = useMutation({
        mutationKey: [SMS_KEYS.SMS_DISABLE],
        mutationFn: authWith2Fa.disableSMS2Fa,
    });
    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        SMS Authentication
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        We&apos;ll now ask for a login code whenever you log in
                        on a device that we don&apos;t recognise.
                    </DialogDescription>
                </div>
            </DialogHeader>
            <div className="flex flex-col gap-6 mb:gap-5">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between rounded-lg bg-bg-sf4 p-3">
                        <div className="font-workSans text-sm font-medium text-typo-primary">
                            {convertTextHidden(
                                user?.phoneNumber || "",
                                (user?.phoneNumber?.length || 3) - 3
                            )}
                        </div>
                        <SwitchSecurity
                            type="sms"
                            checked={user?.isSMSAuth}
                            actionSwitch={(open) => {
                                if (!open) {
                                    setDataAlert({
                                        title: "Turn off SMS Authentication",
                                        content:
                                            "Turning off SMS leaves Authenticator App as your only protection. Continue?",
                                        titleButtonPassed: "Turn off",
                                        titleButtonCanceled: "Cancel",
                                        actionPassed: async () => {
                                            try {
                                                if (!user?.id) {
                                                    throw new Error(
                                                        "User ID is required"
                                                    );
                                                }
                                                await disableSMS2FaMutation.mutateAsync(
                                                    {
                                                        userId: user?.id,
                                                    }
                                                );
                                                toast.success(
                                                    AUTH_MESSAGES_ALERT.sms
                                                );
                                                queryClient.invalidateQueries({
                                                    queryKey: [
                                                        SMS_KEYS.SMS_DISABLE,
                                                    ],
                                                });
                                                await Promise.allSettled([
                                                    queryClient.prefetchQuery({
                                                        queryKey: [
                                                            AUTH_KEYS.WHOAMI,
                                                        ],
                                                        staleTime: 0,
                                                        queryFn:
                                                            authWith2Fa.whoami,
                                                    }),

                                                    queryClient.prefetchQuery({
                                                        queryKey: [
                                                            TWO_FA_KEYS.STATUS,
                                                        ],
                                                        staleTime: 0,
                                                        queryFn:
                                                            authWith2Fa.status2FaDevices,
                                                    }),
                                                ]);
                                                setIsOpenDialog(false);
                                            } catch (error) {
                                                toast.error(
                                                    (error as Error)?.message ||
                                                        "Something went wrong"
                                                );
                                            }
                                        },
                                    });
                                    setTypeAlert("confirm");
                                    setOpenAlert(true);
                                }
                            }}
                        />
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
        </div>
    );
};
