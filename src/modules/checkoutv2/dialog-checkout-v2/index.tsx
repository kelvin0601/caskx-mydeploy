"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCheckout } from "@/store/checkout";
import { useRouter } from "next/navigation";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import IconCard from "@/components/shared/icons/icon-card";

export default function DialogCheckoutV2() {
    const { isOpenPopup, setIsOpenPopup, statusTransaction } = useCheckout();
    const router = useRouter();

    const expiryDate = statusTransaction?.expiryDate;
    const formatExpiryDate = (dateStr?: string) => {
        if (!dateStr) return "Payment Due";
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "Payment Due";
        const datePart = d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
        return `Due date: ${datePart}`;
    };

    const handleBackToHome = () => {
        setIsOpenPopup(false);
        router.push(ROUTE_PUBLIC.HOME);
    };

    const handlePayNow = () => {
        setIsOpenPopup(false);
    };

    return (
        <Dialog open={isOpenPopup} onOpenChange={setIsOpenPopup}>
            <DialogContent>
                <DialogTitle className="sr-only">Payment due</DialogTitle>
                <div className="flex w-full flex-col items-center gap-8">
                    {/* Circle credit card icon wrapper */}
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-icon-main text-bd-brown">
                        <div className="size-8 text-icon">
                            <IconCard />
                        </div>
                    </div>

                    {/* Text content wrapper */}
                    <div className="flex w-full flex-col items-center gap-2 text-center">
                        <h3 className="font-reckless text-xl font-medium text-typo-primary">
                            {formatExpiryDate(expiryDate)}
                        </h3>
                        <p className="text-sm text-typo-soft">
                            Please complete your deposit by this date to secure
                            your cask.
                        </p>
                    </div>

                    {/* Button row */}
                    <div className="flex w-full items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="lg"
                            className="flex-1 font-semibold"
                            onClick={handleBackToHome}
                        >
                            Back to home
                        </Button>
                        <Button
                            variant="action"
                            size="lg"
                            className="flex-1 font-semibold"
                            onClick={handlePayNow}
                        >
                            Pay now
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
