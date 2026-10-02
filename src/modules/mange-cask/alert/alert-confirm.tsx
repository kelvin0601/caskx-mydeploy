import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useManageCask } from "../provider";

export default function BidAlertConfirm() {
    const { setOpenBidManager, dialogData, setIsConfirmed } = useManageCask();
    const handleCancel = () => {
        setIsConfirmed(false);
        setOpenBidManager(false);
    };

    const handleConfirm = () => {
        dialogData.actionConfirm?.();
        setIsConfirmed(true);
        setOpenBidManager(false);
    };

    return (
        <div className="flex flex-col items-center justify-center gap-6">
            <AlertDialogContent className="flex w-[25rem] flex-col gap-6 p-8">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        <div className="mx-auto size-20">
                            <ImagePreload
                                width={80}
                                height={80}
                                src={"/icons/trash-form.svg"}
                                alt="delete-person"
                                unoptimized
                                priority
                            />
                        </div>
                    </AlertDialogTitle>
                    <AlertDialogDescription className="!mt-6 text-center">
                        {dialogData.content}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-row justify-center gap-3">
                    <AlertDialogCancel className="w-32" onClick={handleCancel}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant={"secondary"}
                        size={"sm"}
                        className="w-32"
                        onClick={handleConfirm}
                    >
                        {dialogData.titleButtonConfirm}
                    </Button>
                </div>
            </AlertDialogContent>
        </div>
    );
}
