"use client";

import PasswordStrength from "@/components/shared/auth/password-strength";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AUTH_KEYS } from "@/lib/constants";
import { updatePasswordWithCheckPasswordCurrentSchema } from "@/lib/validators";
import authService from "@/services/auth";
import { useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useStoreAlertWrap } from "../two-fa-form/provider/security-alert-provier";
import { useStoreDialogWrap } from "../two-fa-form/provider/security-dialog-provider";

type TPasswordFormFieldsProps = {
    form: UseFormReturn<
        z.infer<typeof updatePasswordWithCheckPasswordCurrentSchema>
    >;
    onSubmit: (
        data: z.infer<typeof updatePasswordWithCheckPasswordCurrentSchema>
    ) => void | Promise<void>;
    isDisabled: boolean;
};

export default function PasswordFormFields({
    form,
    onSubmit,
    isDisabled,
}: TPasswordFormFieldsProps) {
    const { setIsLoading } = useStoreDialogWrap();
    const { setTypeAlert, setOpenAlert, setDataAlert } = useStoreAlertWrap();
    const { data: session } = useSession();
    const email = session?.user?.email || "";

    const resendForgotPassword = useMutation({
        mutationFn: authService.forgotPassword,
        mutationKey: [AUTH_KEYS.FORGOT_PASSWORD, email],
        gcTime: Infinity,
    });
    const handleForgotPassword = async () => {
        try {
            setIsLoading(true);
            if (email) {
                await resendForgotPassword.mutateAsync({ email });
            }
            toast.success("Password reset email has been sent to your email");
            setTypeAlert("success");
        } catch {
            setTypeAlert("error");
        } finally {
            setIsLoading(false);
            setOpenAlert(true);
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm text-typo-primary">
                                Current password
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm text-typo-primary">
                                New password
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="•••••••••"
                                    required
                                    variant="password"
                                    type="password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                            <PasswordStrength password={field.value} />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem className="space-y-1.5">
                            <FormLabel className="text-sm text-typo-primary">
                                Confirm password
                            </FormLabel>
                            <FormControl>
                                <Input
                                    required
                                    type="password"
                                    variant="password"
                                    placeholder="•••••••••"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="!mt-6 flex w-full flex-col items-center justify-center gap-6 tb:!mt-5 tb:gap-5 mb:sticky mb:bottom-0 mb:bg-bg-main">
                    <Button
                        variant={"action"}
                        type="submit"
                        className="w-full"
                        size="xl"
                        disabled={isDisabled}
                    >
                        Continue
                    </Button>
                    <Button
                        variant={"link"}
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm font-medium !text-typo-primary"
                    >
                        Forgot Password?
                    </Button>
                </div>
            </form>
        </Form>
    );
}
