import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import React from "react";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import { Button } from "@/components/ui/button";

export default function AlertConfirm() {
    const { setOpenAlert, data, setIsPassed } = useStoreAlertWrap();
    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <AlertDialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <AlertDialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        {data?.title || "Remove Device"}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-sm text-typo-soft">
                        {data?.content}
                    </AlertDialogDescription>
                </div>
            </AlertDialogHeader>
            <div className="flex w-full flex-row gap-1">
                <AlertDialogCancel asChild>
                    <Button
                        className="flex-1"
                        variant={"outline"}
                        size="xl"
                        onClick={() => {
                            setIsPassed(false);
                            setOpenAlert(false);
                        }}
                    >
                        {data?.titleButtonCanceled || "Cancel"}
                    </Button>
                </AlertDialogCancel>
                <AlertDialogAction
                    variant={"action"}
                    size={"xl"}
                    className="flex-1"
                    onClick={() => {
                        data?.actionPassed?.();
                        setIsPassed(true);
                        setOpenAlert(false);
                    }}
                >
                    {data?.titleButtonPassed || "Remove"}
                </AlertDialogAction>
            </div>
        </div>
    );
}
