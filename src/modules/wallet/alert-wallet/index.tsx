import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useStoreAlertWrap } from "../provider/alert-wallet-provier";
import { useStoreDialogWrap } from "../provider/dialog-wallet-provider";

export default function AlertWallet() {
    const { data, setOpenAlert } = useStoreAlertWrap();
    const { setIsOpenDialog } = useStoreDialogWrap();
    return (
        <AlertDialogContent className="flex w-[25rem] flex-col gap-6 p-8">
            <AlertDialogHeader>
                <AlertDialogTitle>
                    <div className="mx-auto size-20">
                        <ImagePreload
                            width={80}
                            height={80}
                            src={"/icons/trash-form.svg"}
                            alt="delete-card"
                            unoptimized
                            priority
                        />
                    </div>
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                    Are you sure you want to delete this payment method?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-row justify-center gap-3">
                <AlertDialogCancel className="w-32">Cancel</AlertDialogCancel>
                <Button
                    variant={"secondary"}
                    size={"sm"}
                    className="w-32"
                    onClick={() => {
                        data.actionPassed?.();
                        setOpenAlert(false);
                        setIsOpenDialog(false);
                    }}
                >
                    Delete
                </Button>
            </div>
        </AlertDialogContent>
    );
}
