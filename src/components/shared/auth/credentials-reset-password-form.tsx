"use client";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormMessage,
    FormRootError,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthForm } from "@/hooks/useAuthForm";
import { UpdatePasswordDefaultValues } from "@/lib/constants";
import { AUTH_KEYS } from "@/lib/constants/key";
import { updatePasswordFormSchema } from "@/lib/validators";
import authService from "@/services/auth";
import { auth } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import PasswordStrength from "./password-strength";

const CredentialsResetPasswordForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const form = useForm({
        resolver: zodResolver(updatePasswordFormSchema),
        defaultValues: UpdatePasswordDefaultValues,
    });

    const { isDisabled, isPending, handleSubmit } = useAuthForm({
        form,
        mutationFn: (data: auth.TUpdatePassword) =>
            authService.resetPassword({
                token: token || "",
                password: data.newPassword,
            }),
        mutationKey: [AUTH_KEYS.RESET_PASSWORD],
        onError: (error) => {
            form.setError("root", {
                type: "manual",
                message:
                    (error as { message?: string })?.message ||
                    "Something went wrong",
            });
        },
    });
    const onSubmit = async () => {
        handleSubmit();
    };

    return (
        <ErrorBoundary errorComponent={() => <FormRootError />}>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    id="update-password"
                    className="w-full"
                    onChange={() => form.clearErrors("root")}
                >
                    <div className="space-y-4">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="newPassword" required>
                                            New password
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="newPassword"
                                                type="password"
                                                variant="password"
                                                required
                                                autoComplete="off"
                                                placeholder="•••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        <PasswordStrength
                                            password={field.value}
                                        />
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label
                                            htmlFor="confirmPassword"
                                            required
                                        >
                                            Confirm new password
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                variant="password"
                                                required
                                                autoComplete="off"
                                                placeholder="•••••••••"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormRootError />
                        </div>
                        <div>
                            <Button
                                disabled={isDisabled || isPending}
                                className="w-full"
                                variant="primary"
                                type="submit"
                                size="xl"
                            >
                                {isPending ? "Submitting..." : "Continue"}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </ErrorBoundary>
    );
};

export default CredentialsResetPasswordForm;
