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
import { CASK_KEYS } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import caskServices from "@/services/cask";
import {
    DUPLICATE_VARIANT_ID,
    NEW_VARIANT_ID,
} from "@/lib/constants/cask-variant";
import { useCaskVariants } from "@/store/dashboard/CaskProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function DeleteVintageDialog({ masterId }: { masterId?: string }) {
    const queryClient = useQueryClient();
    const {
        variants,
        pendingDeleteVariant,
        setPendingDeleteVariant,
        handleDeleteVariant,
    } = useCaskVariants();

    const deleteCaskVariantMutation = useMutation({
        mutationFn: (id: string) => caskServices.deleteCask(id),
    });

    const isOpen = pendingDeleteVariant !== null;
    const vintageYear = pendingDeleteVariant?.vintageYear;
    const isSingleVariant = variants.length === 1;

    const handleClose = () => {
        if (deleteCaskVariantMutation.isPending) return;
        setPendingDeleteVariant(null);
    };

    const handleConfirmDelete = async () => {
        if (!pendingDeleteVariant || deleteCaskVariantMutation.isPending)
            return;
        const id = String(pendingDeleteVariant.id ?? "");
        if (!id) return;

        const isPendingVariant =
            id.includes(NEW_VARIANT_ID) || id.includes(DUPLICATE_VARIANT_ID);

        try {
            if (!isPendingVariant) {
                await deleteCaskVariantMutation.mutateAsync(id);
            }
            handleDeleteVariant(id);
            const effectiveMasterId = masterId || pendingDeleteVariant.masterId;
            if (effectiveMasterId) {
                await Promise.all([
                    queryClient.refetchQueries({
                        queryKey: [
                            CASK_KEYS.CASK_ADMIN_DETAIL,
                            effectiveMasterId,
                        ],
                    }),
                    queryClient.invalidateQueries({
                        queryKey: [
                            CASK_KEYS.CASK_ADMIN_DETAIL,
                            effectiveMasterId,
                        ],
                    }),
                ]);
            }
            toast.success("Vintage deleted successfully.");
            setPendingDeleteVariant(null);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete vintage"));
        }
    };

    return (
        <AlertDialog
            open={isOpen}
            onOpenChange={(open) => !open && handleClose()}
        >
            <AlertDialogContent
                isShowClose
                className="w-full max-w-[31.25rem] gap-0 border-0 bg-bg-main p-0 shadow-none mb:max-w-[calc(100vw-2rem)]"
                classClose="rounded-lg p-2 text-icon-main hover:text-icon-highlight"
            >
                <AlertDialogHeader className="space-y-0 text-center sm:text-center">
                    <AlertDialogTitle className="mb-2 w-full font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                        Delete Vintage?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="w-full whitespace-pre-line text-center text-sm font-normal leading-[1.5] text-typo-soft">
                        {isSingleVariant
                            ? "Deleting this vintage will also delete its parent cask. Are you sure you want to proceed?"
                            : `This will permanently delete the ${
                                  vintageYear ? `${vintageYear} ` : ""
                              }vintage and all associated data. This action cannot be undone.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter className="mt-8 w-full items-start gap-1 mb:mt-6 mb:flex-col-reverse mb:gap-2">
                    <AlertDialogCancel
                        className="h-12 min-w-[9.375rem] flex-1 rounded-none border border-bd-main bg-transparent px-8 py-4 text-sm font-medium leading-none text-typo-primary outline-none hover:bg-transparent hover:text-typo-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:h-10 mb:w-full mb:min-w-0 mb:px-4 mb:py-2"
                        disabled={deleteCaskVariantMutation.isPending}
                        onClick={handleClose}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="h-12 min-w-[9.375rem] flex-1 rounded-none border-0 !bg-bg-dark-main px-8 py-4 text-sm font-medium leading-none !text-typo-dark-primary outline-none hover:!bg-bg-dark-main focus-visible:!bg-bg-dark-main focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typo-primary mb:h-10 mb:w-full mb:min-w-0 mb:px-4 mb:py-2"
                        disabled={deleteCaskVariantMutation.isPending}
                        onClick={handleConfirmDelete}
                    >
                        {deleteCaskVariantMutation.isPending
                            ? "Deleting..."
                            : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
