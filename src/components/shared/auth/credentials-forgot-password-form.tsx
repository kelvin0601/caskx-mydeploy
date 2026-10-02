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
import { ForgotPasswordDefaultValues } from "@/lib/constants";
import { AUTH_KEYS } from "@/lib/constants/key";
import { ROUTE_AUTH } from "@/lib/constants/route";
import { forgotPasswordFormSchema } from "@/lib/validators";
import authService from "@/services/auth";
import { auth } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import LinkCustom from "../link-custom";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "sonner";

const CredentialsForgotPasswordForm = () => {
    const { setValue } = useLocalStorage({ key: "email_forgot_password" });
    const form = useForm({
        resolver: zodResolver(forgotPasswordFormSchema),
        defaultValues: ForgotPasswordDefaultValues,
    });
    const { isDisabled, isPending, handleSubmit } = useAuthForm({
        form,
        mutationFn: authService.forgotPassword,
        mutationKey: [AUTH_KEYS.FORGOT_PASSWORD],
        onSuccess: () => {
            toast.success("Verification email sent successfully!", {
                description: "Please check your mailbox",
            });
        },
        onError: (error) => {
            form.setError("root", {
                type: "manual",
                message:
                    (error as { message?: string })?.message ||
                    "Something went wrong",
            });
        },
    });
    const onSubmit = async (data: auth.TForgotPassword) => {
        setValue(data.email);
        handleSubmit();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="forgot-password"
                className="w-full"
                onChange={() => form.clearErrors("root")}
            >
                <div className="space-y-4">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="email" required>
                                        Email
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="email"
                                            type="text"
                                            autoComplete="email"
                                            required
                                            placeholder="Ex: johndoe@gmail.com"
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
                    <div className="text-center text-sm text-typo-soft">
                        Or return to{" "}
                        <LinkCustom
                            href={ROUTE_AUTH.LOGIN}
                            target="_self"
                            className="!text-typo-primary"
                        >
                            <span className="hover-line-active font-medium">
                                Log In
                            </span>
                        </LinkCustom>
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default CredentialsForgotPasswordForm;
