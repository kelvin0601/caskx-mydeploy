import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { checkoutServices } from "@/services/checkout";
import { checkout } from "@/types/checkout";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";

export const useCheckoutAction = (
    options?: Omit<
        UseMutationOptions<
            checkout.TTransactionStatus,
            unknown,
            unknown,
            unknown
        >,
        "mutationFn" | "mutationKey"
    >
) => {
    const createSession = useMutation({
        mutationFn: checkoutServices.createSession,
        mutationKey: [CHECKOUT_KEYS.CREATE_SESSION],
        ...options,
    });

    return {
        createSession,
    };
};
