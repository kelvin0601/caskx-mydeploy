"use client";

import { Button } from "@/components/ui/button";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getErrorMessage } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { offerOrderAdapter } from "../../adapters/offer-order-adapter";
import { MARKET_ORDER_KIND } from "../../constants";
import { MARKET_ORDER_KEYS } from "../../query-keys";
import type { OrderDraft } from "../../types";
import { hasOfferMatch, resolveCheckoutSessionId } from "../../utils";

type ConfirmOfferFooterProps = {
    id: string;
    draft: OrderDraft;
    onBack: () => void;
    onComplete: () => void;
    submit?: typeof offerOrderAdapter.create;
    successToastMessage?: string;
};

export default function ConfirmOfferFooter({
    id,
    draft,
    onBack,
    onComplete,
    submit = offerOrderAdapter.create,
    successToastMessage,
}: ConfirmOfferFooterProps) {
    const router = useRouter();
    const { invalidateAllForBid } = useInvalidateCaskCache();
    const createMutation = useMutation({
        mutationKey: MARKET_ORDER_KEYS.create(MARKET_ORDER_KIND.OFFER),
        mutationFn: submit,
    });

    const handleConfirm = async () => {
        try {
            const response = await createMutation.mutateAsync({
                caskId: id,
                draft,
            });
            const targetBidId =
                (response &&
                typeof response === "object" &&
                "id" in response &&
                typeof (response as { id: unknown }).id === "string"
                    ? (response as { id: string }).id
                    : undefined) ||
                (response &&
                typeof response === "object" &&
                "bidId" in response &&
                typeof (response as { bidId: unknown }).bidId === "string"
                    ? (response as { bidId: string }).bidId
                    : undefined);

            const hasMatch = hasOfferMatch(response);
            const checkoutSessionId = hasMatch
                ? await resolveCheckoutSessionId(response, targetBidId)
                : undefined;

            if (checkoutSessionId) {
                toast.success(
                    successToastMessage
                        ? `${successToastMessage}. Redirecting to payment...`
                        : "Order confirmed. Offer placed for remaining casks. Redirecting to payment..."
                );
            } else if (successToastMessage) {
                toast.success(successToastMessage);
            } else if (hasMatch) {
                toast.success(
                    "Order confirmed. Offer placed for remaining casks."
                );
            } else {
                toast.success("Offer placed!");
            }

            onComplete();
            if (checkoutSessionId) {
                setTimeout(() => {
                    router.push(
                        `${ROUTE_PUBLIC.CHECKOUT}/${checkoutSessionId}/${ROUTE_PUBLIC.CHECKOUT_PAY_DEPOSIT}`
                    );
                }, 1000);
            }
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    "Something went wrong. Please try again."
                )
            );
        } finally {
            invalidateAllForBid(id);
        }
    };

    return (
        <div className="mt-auto flex w-full items-center gap-2 bg-bg-main dk:justify-end tb:justify-end mb:justify-normal mb:gap-1">
            <Button
                className="h-12 tb:h-10 tb:flex-none mb:flex-1"
                variant="outline"
                onClick={onBack}
            >
                Back
            </Button>
            <Button
                disabled={createMutation.isPending}
                className="h-12 tb:h-10 tb:flex-none mb:flex-1"
                onClick={handleConfirm}
            >
                {createMutation.isPending ? "Confirming..." : "Confirm Offer"}
            </Button>
        </div>
    );
}
