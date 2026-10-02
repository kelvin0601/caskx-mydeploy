import { AlertDialog } from "@/components/ui/alert-dialog";
import { useManageCask } from "../provider";
import AlertConfirm from "./alert-confirm";

export default function BidAlertWrap() {
    const { bidActionType, isOpenBidManager, setOpenBidManager } =
        useManageCask();

    return (
        <AlertDialog open={isOpenBidManager} onOpenChange={setOpenBidManager}>
            {renderBidAlert()[bidActionType]}
        </AlertDialog>
    );
}

export const renderBidAlert = () => {
    return {
        confirm: <AlertConfirm />,
    };
};

export type TAlertType = keyof ReturnType<typeof renderBidAlert>;
