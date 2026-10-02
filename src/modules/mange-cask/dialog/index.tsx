import { Dialog } from "@/components/ui/dialog";
import { useManageCask } from "../provider";
import DialogTransaction from "./dialog-transaction";
import DialogDownloadDocuments from "./dialog-download-document";

export default function DialogWrap() {
    const { dialogType, isOpenDialog, setIsOpenDialog } = useManageCask();
    return (
        <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog} modal>
            {renderDialog()[dialogType]}
        </Dialog>
    );
}

export const renderDialog = () => {
    return {
        view_transaction: <DialogTransaction />,
        download_documents: <DialogDownloadDocuments />,
    };
};

export type TDialogType = keyof ReturnType<typeof renderDialog>;
