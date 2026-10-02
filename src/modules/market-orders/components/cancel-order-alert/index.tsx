"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { KEY_ASK, KEY_BID } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MARKET_ORDER_KIND } from "../../constants";
import { useMarketOrderManagement } from "../../management/context";
import { MARKET_ORDER_KEYS } from "../../query-keys";

export default function CancelOrderAlert() {
    const { adapter, selectedOrder, isCancelOpen, closeCancel } =
        useMarketOrderManagement();
    const queryClient = useQueryClient();
    const { definition } = adapter.editor;
    const config = definition.labels;
    const matchedQuantity = Math.max(
        0,
        Number(selectedOrder?.quantity ?? 0) -
            Number(selectedOrder?.remainingQuantity ?? 0)
    );
    const remainingQuantity = Number(selectedOrder?.remainingQuantity ?? 0);
    const isPartiallyMatched = matchedQuantity > 0;

    const cancelMutation = useMutation<unknown, Error, void>({
        mutationKey: MARKET_ORDER_KEYS.cancel(
            definition.kind,
            selectedOrder?.id
        ),
        mutationFn: () => {
            if (!selectedOrder?.id) throw new Error("Order not found");
            return adapter.cancel(selectedOrder.id);
        },
        onSuccess: async () => {
            const name = definition.labels.successName ?? "Listing";
            toast.success(
                isPartiallyMatched
                    ? "Remaining casks cancelled successfully."
                    : `${name} cancelled successfully.`
            );
            closeCancel();
            const isOffer = definition.kind === MARKET_ORDER_KIND.OFFER;
            await queryClient.invalidateQueries({
                queryKey: adapter.listQueryKey,
            });
            await queryClient.invalidateQueries({
                queryKey: isOffer ? [KEY_BID.BID_DETAIL] : [KEY_ASK.ASK_LIST],
            });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(
                    error,
                    "Something went wrong. Please try again."
                )
            );
        },
    });

    const title = isPartiallyMatched
        ? "Cancel remaining quantity?"
        : config.cancelTitle;
    const confirmLabel = isPartiallyMatched
        ? "Cancel remaining"
        : config.cancelLabel;

    return (
        <AlertDialog
            open={isCancelOpen}
            onOpenChange={(open) => {
                if (!open) closeCancel();
            }}
        >
            <AlertDialogContent
                isShowClose
                className="max-w-[31.25rem] border-none bg-bg-main"
                classClose="right-0 top-0"
            >
                <AlertDialogHeader className="text-center">
                    <AlertDialogTitle className="text-center font-reckless text-xl font-medium leading-none text-typo-primary">
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="mt-2 text-center text-sm leading-normal text-typo-soft">
                        {isPartiallyMatched ? (
                            <>
                                <span className="font-medium text-typo-primary">
                                    {matchedQuantity}
                                </span>{" "}
                                {matchedQuantity === 1
                                    ? "cask is"
                                    : "casks are"}{" "}
                                already matched and will continue to proceed.{" "}
                                <span className="font-medium text-typo-primary">
                                    {remainingQuantity}
                                </span>{" "}
                                unmatched{" "}
                                {remainingQuantity === 1 ? "cask" : "casks"}{" "}
                                will be cancelled and removed from the
                                marketplace.
                            </>
                        ) : (
                            config.cancelDescription
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-8 gap-1 tb:mt-6">
                    <AlertDialogCancel className="h-12 flex-1 tb:h-10 mb:w-full">
                        {config.keepLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="action"
                        className="h-12 flex-1 tb:h-10 mb:w-full"
                        disabled={cancelMutation.isPending}
                        onClick={(event) => {
                            event.preventDefault();
                            cancelMutation.mutate();
                        }}
                    >
                        {cancelMutation.isPending
                            ? "Cancelling..."
                            : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
