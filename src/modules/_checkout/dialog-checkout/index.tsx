"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { useCheckout } from "@/store/checkout";
import { useRouter } from "next/navigation";
import PopupConfirmCheckoutStatus from "../popup-conform";

const DialogCheckout = () => {
    const { isOpenPopup, popupCurrent, setIsOpenPopup } = useCheckout();
    const router = useRouter();
    const { status, ...rest } = popupCurrent;
    return (
        <Dialog open={isOpenPopup} onOpenChange={setIsOpenPopup}>
            <DialogContent>
                <DialogTitle className="sr-only">
                    {rest.title || "Checkout status"}
                </DialogTitle>
                <PopupConfirmCheckoutStatus
                    title={rest.title}
                    status={status ?? "wallet"}
                    buttonText={rest.buttonText}
                    action={() => {
                        setIsOpenPopup(false);
                        router.push(ROUTE_PUBLIC.HOME);
                    }}
                >
                    {rest.description}
                </PopupConfirmCheckoutStatus>
            </DialogContent>
        </Dialog>
    );
};

export default DialogCheckout;
