"use client";

import { Button } from "@/components/ui/button";
import { useInvalidateCaskCache } from "@/hooks/useInvalidateCaskCache";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { listingOrderAdapter } from "../../adapters/listing-order-adapter";
import { MARKET_ORDER_KIND } from "../../constants";
import { MARKET_ORDER_KEYS } from "../../query-keys";
import type { OrderDraft } from "../../types";

type ConfirmListingFooterProps = {
    id: string;
    draft: OrderDraft;
    onBack: () => void;
    onComplete: () => void;
    submit?: typeof listingOrderAdapter.create;
};

export default function ConfirmListingFooter({
    id,
    draft,
    onBack,
    onComplete,
    submit = listingOrderAdapter.create,
}: ConfirmListingFooterProps) {
    const { invalidateAllForAsk } = useInvalidateCaskCache();
    const router = useRouter();
    const mutation = useMutation({
        mutationKey: MARKET_ORDER_KEYS.create(MARKET_ORDER_KIND.LISTING),
        mutationFn: submit,
    });

    const handleSubmit = async () => {
        try {
            const { matchSummary, id: payoutId } = await mutation.mutateAsync({
                caskId: id,
                draft,
            });
            if (matchSummary?.totalMatchedQuantity > 0) {
                toast.success(
                    matchSummary.remainingQuantity > 0
                        ? "Sale confirmed. Listing placed for remaining casks. Redirecting to payout..."
                        : "Sale confirmed. Redirecting to payout..."
                );
                setTimeout(
                    () => router.push(`${ROUTE_PUBLIC.PAYOUT}/${payoutId}`),
                    1000
                );
            } else {
                toast.success("Listing placed.");
            }
            onComplete();
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to place ask"));
        } finally {
            invalidateAllForAsk(id);
        }
    };

    return (
        <div className="mt-auto flex w-full items-center gap-2 bg-bg-main dk:justify-end tb:justify-end mb:gap-1">
            <Button
                variant="outline"
                className="h-12 tb:h-10 mb:flex-1"
                onClick={onBack}
            >
                Back
            </Button>
            <Button
                className="h-12 tb:h-10 mb:flex-1"
                disabled={mutation.isPending}
                onClick={handleSubmit}
            >
                {mutation.isPending ? "Submitting..." : "Submit listing"}
            </Button>
        </div>
    );
}
