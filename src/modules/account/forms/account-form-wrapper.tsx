import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TAccountFormWrapperProps = {
    children: ReactNode;
    onClose: () => void;
    isSubmitting: boolean;
    isChanged?: boolean;
    isValid?: boolean;
    submitLabel?: string;
    submittingLabel?: string;
    className?: string;
};

export function AccountFormWrapper({
    children,
    onClose,
    isSubmitting,
    isChanged = true,
    isValid = true,
    submitLabel = "Save Changes",
    submittingLabel = "Saving…",
    className = "",
}: TAccountFormWrapperProps) {
    return (
        <>
            <ScrollArea
                className={cn(
                    "-mr-4 max-h-[50vh] pr-4 mb:max-h-[40vh]",
                    className
                )}
            >
                <div className="flex flex-col gap-4">{children}</div>
            </ScrollArea>
            <DialogFooter className="mt-6 flex flex-row justify-center gap-1 space-x-0 mb:sticky mb:bottom-0 mb:left-0 mb:right-0 mb:-ml-6 mb:mt-4 mb:w-[calc(100%+3rem)] mb:border-0 mb:bg-bg-main mb:px-6 mb:py-0 [&_button]:flex-1">
                <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    className="w-max mb:w-full"
                    onClick={onClose}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant={"action"}
                    size="xl"
                    disabled={isSubmitting || !isChanged || !isValid}
                    className="w-max mb:w-full"
                >
                    {isSubmitting ? submittingLabel : submitLabel}
                </Button>
            </DialogFooter>
        </>
    );
}
