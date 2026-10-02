"use client";

import MenuChains from "@/components/shared/menu-chains";
// import { DialogCheckout } from "@/modules/checkout";
import { useCheckout } from "@/store/checkout";
import { checkout } from "@/types/checkout";
import React, { useEffect } from "react";

export default function CheckoutLayout({
    children,
    sessionId,
    statusCheckout,
    menus,
}: {
    children: React.ReactNode;
    sessionId: string;
    statusCheckout: checkout.TTransactionStatus;
    menus: {
        title: string;
        href: string;
        isOpenWindow: boolean;
        step: string;
    }[];
}) {
    const { setSessionId, setStatusTransaction } = useCheckout();

    useEffect(() => {
        setSessionId(sessionId);
        if (statusCheckout) {
            setStatusTransaction(statusCheckout);
        }
    }, [sessionId, setSessionId, setStatusTransaction, statusCheckout]);
    return (
        <div>
            <div className="flex flex-col">
                <div className="container">
                    <div className="grid h-full grid-cols-12 tb:grid-cols-6 mb:grid-cols-4">
                        <div className="col-start-2 -col-end-2 tb:hidden">
                            <h1 className="pb-5 pt-7 text-2xl font-semibold">
                                Check out{" "}
                            </h1>
                        </div>
                        <div className="col-start-2 -col-end-2 grid grid-cols-4 !gap-x-0 border-t border-bd-brown tb:col-start-1 tb:-col-end-1 tb:grid-cols-6">
                            <MenuChains
                                className="col-span-1 pt-[3.75rem] tb:!col-span-6 tb:col-start-1 tb:col-end-1 tb:pt-10 mb:pt-8"
                                statusTransaction={statusCheckout}
                                menus={menus}
                            />
                            <div className="col-span-3 min-h-[80vh] border-l border-bd-brown py-[3.75rem] pb-[3.75rem] pl-[5.625rem] tb:col-start-1 tb:-col-end-1 tb:border-none tb:p-0 tb:pt-6 mb:mt-0 mb:min-h-[60vh]">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <DialogCheckout /> */}
        </div>
    );
}
