import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogAction,
    AlertDialogDescription,
    AlertDialogHeader,
} from "@/components/ui/alert-dialog";
import React from "react";
import { useManageCask } from "../provider";

export default function BidAlertSuccess() {
    const { setOpenBidManager } = useManageCask();

    const handleClose = () => {
        setOpenBidManager(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <AlertDialogHeader>
                <ImagePreload
                    src="/icons/icon-check.png"
                    priority
                    width={80}
                    className="h-20 w-20"
                    height={80}
                />
            </AlertDialogHeader>
            <AlertDialogDescription className="text-center">
                <div className="text-green-600 text-lg font-semibold">
                    Success!
                </div>
                <div className="text-gray-600 mt-2 text-sm">
                    Your action has been completed successfully.
                </div>
            </AlertDialogDescription>

            <div className="flex flex-row items-center gap-3">
                <AlertDialogAction
                    className="bg-green-600 hover:bg-green-700 h-full w-32"
                    onClick={handleClose}
                >
                    OK
                </AlertDialogAction>
            </div>
        </div>
    );
}
