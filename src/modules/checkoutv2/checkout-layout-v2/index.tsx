"use client";

import React from "react";
import { checkout } from "@/types/checkout";
import { CheckoutProvider } from "@/store/checkout";
import CheckoutWorkspace from "../checkout-workspace";
import DialogCheckoutV2 from "../dialog-checkout-v2";

type TCheckoutLayoutV2Props = {
    children: React.ReactNode;
    statusCheckout: checkout.TTransactionStatus;
    sessionId: string;
};

export default function CheckoutLayoutV2({
    children,
    statusCheckout,
    sessionId,
}: TCheckoutLayoutV2Props) {
    return (
        <CheckoutProvider
            initialStatus={statusCheckout}
            initialSessionId={sessionId}
        >
            <div className="flex h-full w-full flex-1 bg-bg-main text-typo-primary">
                <CheckoutWorkspace statusCheckout={statusCheckout}>
                    {children}
                </CheckoutWorkspace>
                <DialogCheckoutV2 />
            </div>
        </CheckoutProvider>
    );
}
