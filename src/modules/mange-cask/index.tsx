"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import BidAlertWrap from "./alert";
import DialogWrap from "./dialog";
import BuyingSidebar from "./sidebar";
import { ManageCask } from "./provider";

const ManageCaskProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SidebarProvider className="min-h-fit">
            <ManageCask>
                <div className="container grid grid-cols-12">
                    <div className="col-start-2 -col-end-2 flex flex-col">
                        {children}
                        <BuyingSidebar />
                    </div>
                </div>
                <BidAlertWrap />
                <DialogWrap />
            </ManageCask>
        </SidebarProvider>
    );
};

export default ManageCaskProvider;
