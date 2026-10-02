import { KEY_DISCOUNT } from "@/lib/constants/key";
import { discountServices } from "@/services/discount";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type ApplyParams = {
    code: string;
    orderSubtotal: number;
    sessionId: string;
    enabled?: boolean;
};

export function useDiscount() {
    const queryClient = useQueryClient();

    const invalidate = () => {
        queryClient.invalidateQueries({
            queryKey: [KEY_DISCOUNT.ACTIVE_DISCOUNT],
        });
        queryClient.invalidateQueries({
            queryKey: [KEY_DISCOUNT.RESERVATION_DISCOUNT],
        });
    };

    const activeDiscountQuery = useQuery({
        queryKey: [KEY_DISCOUNT.ACTIVE_DISCOUNT],
        queryFn: discountServices.getActiveDiscountCode,
    });

    const reservationDiscountQuery = useQuery({
        queryKey: [KEY_DISCOUNT.RESERVATION_DISCOUNT],
        queryFn: discountServices.getReservationDiscountCode,
    });

    const applyDiscountMutation = useMutation({
        mutationKey: [KEY_DISCOUNT.APPLY_DISCOUNT],
        mutationFn: discountServices.applyDiscountCode,
        onSuccess: () => invalidate(),
    });

    const deleteDiscountMutation = useMutation({
        mutationKey: [KEY_DISCOUNT.DELETE_DISCOUNT],
        mutationFn: discountServices.deleteDiscountCode,
        onSuccess: () => invalidate(),
    });

    const confirmDiscountMutation = useMutation({
        mutationKey: [KEY_DISCOUNT.CONFIRM_DISCOUNT],
        mutationFn: discountServices.confirmDiscountCode,
        onSuccess: () => invalidate(),
    });

    const applyDiscount = (params: ApplyParams) =>
        applyDiscountMutation.mutateAsync(params);

    const removeDiscount = (reservationId: string) =>
        deleteDiscountMutation.mutateAsync({ reservationId });

    const confirmDiscount = (reservationId: string) =>
        confirmDiscountMutation.mutateAsync({ reservationId });

    return {
        // queries
        activeDiscountQuery,
        reservationDiscountQuery,
        // actions
        applyDiscount,
        removeDiscount,
        confirmDiscount,
        // states
        isApplying: applyDiscountMutation.isPending,
        isRemoving: deleteDiscountMutation.isPending,
        isConfirming: confirmDiscountMutation.isPending,
        invalidate,
    };
}

export default useDiscount;
