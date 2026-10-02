import IconEdit from "@/components/shared/icons/icon-edit";
import IconTrash from "@/components/shared/icons/icon-trash";
import { AUTH_KEYS, DEVICE_KEYS, TWO_FA_KEYS } from "@/lib/constants/key";
import { authWith2Fa } from "@/services/auth-2fa";
import { auth } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import { cn } from "@/lib/utils";

type TSessionData = {
    id: string;
    name: string;
    className?: string;
};

export default function ItemAuthSession(props: TSessionData) {
    const { id, name, className } = props;
    const { setStep, setSessionData, setIsOpenDialog } = useStoreDialogWrap();
    const { setOpenAlert, setDataAlert, setTypeAlert } = useStoreAlertWrap();
    const queryClient = useQueryClient();

    const handleGetDevices = async () => {
        const data = await queryClient.ensureQueryData({
            queryKey: [DEVICE_KEYS.GET_DEVICES],
            queryFn: authWith2Fa.get2FaDevices,
        });
        return data?.devices?.filter(
            (device: auth.T2FaDevice) => device.isActive
        );
    };

    const deleteSessionMutation = useMutation({
        mutationFn: authWith2Fa.deleteDevice,
        onMutate: async () => {
            //set data optimistic
            queryClient.setQueryData(
                [DEVICE_KEYS.GET_DEVICES],
                (old: { devices: auth.T2FaDevice[] }) => {
                    return {
                        devices: old?.devices?.filter(
                            (device: auth.T2FaDevice) => device.id !== id
                        ),
                    };
                }
            );
        },
        onSuccess: () => {
            //invalidate query
            queryClient.prefetchQuery({
                queryKey: [DEVICE_KEYS.GET_DEVICES, TWO_FA_KEYS.STATUS],
                staleTime: 0,
            });
        },
    });

    const handleOpenEdit = () => {
        setSessionData({
            id,
            name,
        });

        setStep("sessionEdit");
    };
    const handleOpenDelete = async () => {
        const devicesActive = await handleGetDevices();
        setDataAlert({
            title: "Remove Device",
            content:
                devicesActive?.length > 1
                    ? `This will remove ${name} from your account. Continue?`
                    : "Removing this device will turn off two-factor authentication via an authenticator app. Continue?",
            actionPassed: async () => {
                try {
                    await deleteSessionMutation.mutateAsync(id);
                    const devicesActive = await handleGetDevices();
                    if (devicesActive.length < 1) {
                        setIsOpenDialog(false);

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
                    }
                    if (devicesActive?.length === 0) {
                        toast.success("Authenticator app is now disabled");
                    } else {
                        toast.success("Device removed");
                    }
                } catch (error) {
                    toast.error(
                        (error as Error)?.message || "Failed to delete device"
                    );
                }
            },
            titleButtonPassed: "Remove",
        });
        setTypeAlert("confirm");
        setOpenAlert(true);
    };

    return (
        <div
            className={cn(
                "group flex flex-row items-center justify-between gap-2 border border-transparent bg-bg-sf4 p-3 transition-all duration-300 hover:border-bd-main hover:shadow-[0_0.1875rem_0.5rem_0_rgba(23,0,0,0.10),0_0.25rem_0.375rem_0_rgba(15,0,0,0.10)]",
                className
            )}
        >
            <div className="flex-1 text-sm font-medium text-typo-primary">
                {name}
            </div>
            <div className="flex items-center gap-2">
                <div
                    className="h-4 w-4 cursor-pointer text-icon-main opacity-0 transition-all duration-300 hover:text-typo-primary group-hover:opacity-100"
                    onClick={handleOpenEdit}
                >
                    <IconEdit />
                </div>
                <div
                    className="h-4 w-4 cursor-pointer text-icon-main opacity-0 transition-all duration-300 hover:text-typo-primary group-hover:opacity-100"
                    onClick={handleOpenDelete}
                >
                    <IconTrash />
                </div>
            </div>
        </div>
    );
}
