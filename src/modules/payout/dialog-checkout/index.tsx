import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { useCheckout } from "@/store/checkout";
import { redirect } from "next/navigation";
import PopupConfirmCheckoutStatus from "../popup-conform";

const DialogCheckout = () => {
    const { isOpenPopup, popupCurrent, setIsOpenPopup } = useCheckout();
    return (
        <Dialog open={isOpenPopup} onOpenChange={setIsOpenPopup}>
            <DialogContent>
                <DialogTitle className="sr-only">
                    {popupCurrent.title || "Checkout status"}
                </DialogTitle>
                <PopupConfirmCheckoutStatus
                    status="wallet"
                    title={popupCurrent.title}
                    buttonText={popupCurrent.buttonText}
                    action={() => {
                        setIsOpenPopup(false);
                        redirect(ROUTE_PUBLIC.HOME);
                    }}
                >
                    {popupCurrent.description}
                </PopupConfirmCheckoutStatus>
            </DialogContent>
        </Dialog>
    );
};

export default DialogCheckout;
