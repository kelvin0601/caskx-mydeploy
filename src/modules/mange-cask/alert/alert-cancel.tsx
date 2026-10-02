import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import React from "react";
import { useManageCask } from "../provider";

export default function BidAlertCancel() {
    const { setOpenBidManager, dialogData, setIsConfirmed } = useManageCask();

    const handleCancel = () => {
        setIsConfirmed(false);
        setOpenBidManager(false);
    };

    const handleConfirm = () => {
        // Cancel bid logic here
        console.log("Cancelling bid:", dialogData);
        dialogData.actionConfirm?.();
        setIsConfirmed(true);
        setOpenBidManager(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <AlertDialogHeader>
                <ImagePreload
                    src="/icons/icon-trash.svg"
                    priority
                    width={80}
                    className="h-20 w-20"
                    height={80}
                />
            </AlertDialogHeader>
            <AlertDialogDescription className="text-center">
                Are you sure you want to cancel your bid for{" "}
                <strong className="font-semibold text-typo-primary">
                    {dialogData.caskName}
                </strong>
                ?
                <br />
                <span className="text-gray-500 text-sm">
                    This action cannot be undone.
                </span>
            </AlertDialogDescription>

            <div className="flex flex-row items-center gap-3">
                <AlertDialogCancel
                    className="h-full w-32"
                    onClick={handleCancel}
                >
                    Keep Bid
                </AlertDialogCancel>
                <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 h-full w-32"
                    onClick={handleConfirm}
                >
                    Cancel Bid
                </AlertDialogAction>
            </div>
        </div>
    );
}
