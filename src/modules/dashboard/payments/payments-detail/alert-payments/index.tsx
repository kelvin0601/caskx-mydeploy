import ImagePreload from "@/components/shared/image-preload";
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AlertPayments({
    onConfirm,
}: {
    onConfirm: () => void;
}) {
    return (
        <AlertDialogContent className="gap-6">
            <AlertDialogHeader>
                <AlertDialogTitle className="flex flex-col items-center">
                    <ImagePreload
                        className="h-20 w-20"
                        width={160}
                        height={160}
                        src="/icons/checked-noti.svg"
                    />
                </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
                Are you sure you want to mark this order as complete?
            </AlertDialogDescription>
            <AlertDialogFooter className="flex flex-row items-center justify-center gap-3">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onConfirm}>
                    Continue
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    );
}
