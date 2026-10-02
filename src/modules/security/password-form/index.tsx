import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DrawerClose,
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useAuthForm } from "@/hooks/useAuthForm";
import {
    ROUTE_AUTH,
    UpdatePasswordWithCheckPasswordCurrentDefaultValues,
} from "@/lib/constants";
import { AUTH_KEYS } from "@/lib/constants/key";
import { updatePasswordWithCheckPasswordCurrentSchema } from "@/lib/validators";
import authService from "@/services/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useStoreDialogWrap } from "../two-fa-form/provider/security-dialog-provider";
import { useEffect } from "react";
import { signOut } from "next-auth/react";
import { deleteCookie } from "cookies-next/client";
import { KEY_PREV_PAGE, KEY_RESET_PREV_PAGE } from "@/lib/constants/keyword";
import useResponsive from "@/hooks/useResponsive";
import PasswordFormFields from "./password-form-fields";
import { ScrollArea } from "@/components/ui/scroll-area";
import IconLoading from "@/components/shared/icons/icon-loading";

export default function PasswordForm() {
    const form = useForm({
        resolver: zodResolver(updatePasswordWithCheckPasswordCurrentSchema),
        defaultValues: UpdatePasswordWithCheckPasswordCurrentDefaultValues,
    });
    const { setIsOpenDialog, isOpen, isLoading } = useStoreDialogWrap();
    const queryClient = useQueryClient();
    const { isDisabled, isPending, handleSubmit } = useAuthForm({
        form,
        mutationFn: authService.changePassword,
        mutationKey: [AUTH_KEYS.CHANGE_PASSWORD],
        invalidateQueries: [[AUTH_KEYS.WHOAMI]],
        onSuccess: () => {
            setIsOpenDialog(false);
            toast.success("Your password has been reset successfully.");
            deleteCookie(KEY_PREV_PAGE, { path: "/" });
            deleteCookie(KEY_RESET_PREV_PAGE, { path: "/" });
            signOut({
                callbackUrl: ROUTE_AUTH.LOGIN,
            });
        },
        onError: (error) => {
            form.setError("oldPassword", {
                message: (error as Error)?.message,
            });
        },
    });

    const onSubmit = () => {
        handleSubmit();
    };
    const isFormDisabled = isDisabled || isPending;
    useEffect(() => {
        if (!isOpen) {
            form.reset();
        }
    }, [isOpen]);
    const { isDesktop, isTablet } = useResponsive();
    return isDesktop || isTablet ? (
        <DialogContent
            onInteractOutside={(e) => e.preventDefault()}
            className="w-[31.25rem] gap-8"
            key={"form-password-desktop"}
        >
            <DialogHeader className="mb-8 border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Change Password
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        Update your password here. Enter your current and new
                        password.
                    </DialogDescription>
                </div>
            </DialogHeader>
            <PasswordFormFields
                form={form}
                onSubmit={onSubmit}
                isDisabled={isFormDisabled}
            />
            {isLoading && (
                <div className="absolute inset-0 z-50">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 animate-pulse bg-background/80" />
                        <div className="h-20 w-20">
                            <IconLoading />
                        </div>
                    </div>
                </div>
            )}
        </DialogContent>
    ) : (
        <Drawer
            key="form-password-mobile"
            direction="bottom"
            open={isOpen}
            onOpenChange={setIsOpenDialog}
        >
            <DrawerContent className="max-h-[80dvh]">
                <DrawerHeader className="border-none pb-0 text-center">
                    <div className="flex w-full flex-col items-center gap-2">
                        <DrawerTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                            Change Password
                        </DrawerTitle>
                        <DrawerDescription className="text-center text-sm text-typo-soft">
                            Update your password here. Enter your current and
                            new password.
                        </DrawerDescription>
                    </div>
                </DrawerHeader>
                <ScrollArea className="mt-8 max-h-[60vh] tb:mt-6">
                    <PasswordFormFields
                        form={form}
                        onSubmit={onSubmit}
                        isDisabled={isFormDisabled}
                    />
                </ScrollArea>
                {isLoading && (
                    <div className="absolute inset-0 z-50">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 animate-pulse bg-background/80" />
                            <div className="h-20 w-20">
                                <IconLoading />
                            </div>
                        </div>
                    </div>
                )}
            </DrawerContent>
        </Drawer>
    );
}
