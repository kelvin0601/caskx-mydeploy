import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import AlertConfirm from "./alert-confirm";
import AlertError from "./alert-error";
import AlertSuccess from "./alert-resend-email-success";

export default function AlertWrap() {
    const { type, isOpen, setOpenAlert } = useStoreAlertWrap();

    return (
        <AlertDialog open={isOpen} onOpenChange={setOpenAlert}>
            <AlertDialogTitle></AlertDialogTitle>
            <AlertDialogContent isShowClose className="w-[25rem]">
                {renderAlert()[type]}
            </AlertDialogContent>
        </AlertDialog>
    );
}
export const renderAlert = () => {
    return {
        confirm: <AlertConfirm />,
        success: <AlertSuccess />,
        error: <AlertError />,
    };
};

export type TAlertType = keyof ReturnType<typeof renderAlert>;
