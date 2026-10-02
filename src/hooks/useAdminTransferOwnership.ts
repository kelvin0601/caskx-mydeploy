import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { checkoutServices } from "@/services/checkout";
import { getErrorMessage } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAdminTransferOwnership(sessionId: string) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (file: File) =>
            checkoutServices.adminTransferOwnership(sessionId, file),
        mutationKey: [CHECKOUT_KEYS.ADMIN_TRANSFER_OWNERSHIP, sessionId],
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_ADMIN_SESSIONS],
            });
            queryClient.invalidateQueries({
                queryKey: [CHECKOUT_KEYS.GET_ADMIN_SESSIONS, sessionId],
            });
            toast.success("Ownership transferred successfully");
        },
        onError: (error) => {
            toast.error(getErrorMessage(error, "Failed to transfer ownership"));
        },
    });

    const transferOwnership = async (file: File) => {
        return mutation.mutateAsync(file);
    };

    return {
        transferOwnership,
        isTransferring: mutation.isPending,
    };
}
