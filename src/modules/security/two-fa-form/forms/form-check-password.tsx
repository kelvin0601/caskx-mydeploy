import { Button } from "@/components/ui/button";
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useAuthForm } from "@/hooks/useAuthForm";
import { CheckPasswordDefaultValues } from "@/lib/constants";
import { checkPasswordSchemaTwoFA } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useStoreAlertWrap } from "../provider/security-alert-provier";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import authService from "@/services/auth";
import { AUTH_KEYS } from "@/lib/constants/key";

export const FormCheckPassword = () => {
    const { user } = useAuth();
    const { setStep, setIsLoading } = useStoreDialogWrap();
    const { setTypeAlert, setOpenAlert } = useStoreAlertWrap();

    const form = useForm({
        resolver: zodResolver(checkPasswordSchemaTwoFA),
        defaultValues: CheckPasswordDefaultValues,
        mode: "onSubmit",
        reValidateMode: "onSubmit",
    });

    const { isDisabled, isPending, handleSubmit } = useAuthForm({
        form,
        mutationFn: async (data: z.infer<typeof checkPasswordSchemaTwoFA>) => {
            if (!user) throw new Error("User not found");
            return authService.verifyPassword({
                ...data,
                userId: user.id!,
            });
        },
        mutationKey: [AUTH_KEYS.VERIFY_PASSWORD],
        onSuccess: (result: { success: boolean; message?: string }) => {
            if (result.success) {
                setStep("chooseMethod");
            } else {
                form.setError("password", {
                    message: result.message || "Verification failed",
                });
            }
        },
        onError: (error) => {
            form.setError("password", {
                message: (error as Error)?.message,
            });
        },
    });

    const onSubmit = () => {
        if (!user) return;
        form.handleSubmit(() => {})();
    };

    const handleForgotPassword = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setOpenAlert(true);
        setTypeAlert("success");
        setIsLoading(false);
    };

    const isFormDisabled = isDisabled || isPending;
    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Please Re-enter Your Password
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        For your security, please re-enter your password to
                        continue.
                    </DialogDescription>
                </div>
            </DialogHeader>
            <Form {...form}>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 tb:space-y-5"
                >
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <FormLabel className="text-sm text-typo-primary">
                                    Password
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="•••••••••"
                                        required
                                        type="password"
                                        variant="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex w-full flex-col items-center justify-center gap-6 tb:gap-5">
                        <Button
                            variant={"action"}
                            type="submit"
                            size="xl"
                            className="w-full"
                            disabled={isFormDisabled}
                        >
                            Continue
                        </Button>
                        <Button
                            type="button"
                            onClick={handleForgotPassword}
                            variant={"link"}
                            className="text-sm font-medium !text-typo-primary"
                        >
                            Forgot Password?
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};
