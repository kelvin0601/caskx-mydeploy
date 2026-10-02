import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogAction,
    AlertDialogDescription,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import React from "react";
import { useManageCask } from "../provider";

export default function BidAlertError() {
    const { setOpenBidManager, dialogData } = useManageCask();

    const handleClose = () => {
        setOpenBidManager(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <AlertDialogHeader>
                <ImagePreload
                    src="/icons/icon-error.png"
                    priority
                    width={80}
                    className="h-20 w-20"
                    height={80}
                />
            </AlertDialogHeader>
            <AlertDialogDescription className="text-center">
                <div className="text-red-600 text-lg font-semibold">Error</div>
                <div className="text-gray-600 mt-2 text-sm">
                    {dialogData.content ||
                        "Something went wrong. Please try again."}
                </div>
            </AlertDialogDescription>

            <div className="flex flex-row items-center gap-3">
                <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700 h-full w-32"
                    onClick={handleClose}
                >
                    OK
                </AlertDialogAction>
            </div>
        </div>
    );
}
