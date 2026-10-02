"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormMessage,
    FormRootError,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useDisableButtonForm } from "@/hooks/useDisableButtonForm";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { signInDefaultValues } from "@/lib/constants";
import { KEY_PREV_PAGE, KEY_RESET_PREV_PAGE } from "@/lib/constants/keyword";
import { ROUTE_AUTH, ROUTE_PUBLIC } from "@/lib/constants/route";
import { signInFormSchema } from "@/lib/validators";
import { LoginStep } from "@/modules/login";
import { auth } from "@/types";
import { logNextAuthClientDebug } from "@/lib/nextauth-client-debug";
import { zodResolver } from "@hookform/resolvers/zod";
import { deleteCookie, getCookie } from "cookies-next/client";
import { getSession, signIn } from "next-auth/react";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import LinkCustom from "../link-custom";
const CredentialsSignInForm = () => {
    const { setValue: setRememberLS, getValue: getRememberLS } =
        useLocalStorage({
            key: "rememberMe",
            defaultValue: false,
        });
    const { setValue: setEmailLS, getValue: getEmailLS } = useLocalStorage({
        key: "email",
        defaultValue: "",
    });

    const { setCurrentStepLogin, setMyUser, user } = useAuth();

    const form = useForm({
        resolver: zodResolver(signInFormSchema),
        defaultValues: {
            ...signInDefaultValues,
        },
    });
    const isDisableButton = useDisableButtonForm(form);

    const onSubmit = async (data: auth.TLoginUser) => {
        logNextAuthClientDebug("signIn.submit", {
            emailLength: data?.email?.length || 0,
            hasPassword: !!data?.password,
            rememberMe: !!data?.rememberMe,
        });
        setRememberLS(!!data?.rememberMe);
        setEmailLS(data?.email);
        await signIn("login", {
            ...data,
            redirect: false,
        })
            .then(async (res) => {
                logNextAuthClientDebug("signIn.response", {
                    ok: res?.ok,
                    status: res?.status,
                    error: res?.error,
                    url: res?.url,
                });
                const session = await getSession();
                logNextAuthClientDebug("session.loaded", {
                    hasSession: !!session,
                    hasUserId: !!session?.user?.id,
                    availableMethodsCount:
                        session?.user?.availableMethods?.length || 0,
                });

                if (res?.error) {
                    form.setError("root", {
                        type: "manual",
                        message: res?.error || "Invalid email or password",
                    });
                    return;
                }
                console.log("session?.user__________", session?.user);
                if (
                    session?.user?.availableMethods &&
                    session?.user?.availableMethods?.length > 0
                ) {
                    setMyUser({
                        ...user!,
                        phoneNumber: session?.user?.phoneNumber || "",
                        isGoogleAuth:
                            session?.user?.availableMethods?.includes("app"),
                        isSMSAuth:
                            session?.user?.availableMethods?.includes("sms"),
                    });
                    if (session?.user?.availableMethods.includes("app")) {
                        setCurrentStepLogin(LoginStep.AUTH_APP);
                    } else if (
                        session?.user?.availableMethods.includes("sms")
                    ) {
                        setCurrentStepLogin(LoginStep.SMS);
                    } else {
                        if (session?.user?.availableMethods?.includes("app")) {
                            setCurrentStepLogin(LoginStep.AUTH_APP);
                        } else {
                            setCurrentStepLogin(LoginStep.SMS);
                        }
                    }
                } else {
                    const prevUrl =
                        getCookie(KEY_PREV_PAGE) || ROUTE_PUBLIC.HOME;
                    // Clear navigation cookies immediately on client after a successful login
                    deleteCookie(KEY_PREV_PAGE, { path: "/" });
                    deleteCookie(KEY_RESET_PREV_PAGE, { path: "/" });
                    window.location.href = prevUrl;
                }
            })
            .catch((err) => {
                console.error("err 42424", err);
                logNextAuthClientDebug("signIn.error", {
                    message: err instanceof Error ? err.message : String(err),
                });
                form.setError("root", {
                    type: "manual",
                    message: err?.error || "Invalid email or password",
                });
            });
    };

    useEffect(() => {
        form.setValue("email", getEmailLS());
        form.setValue("rememberMe", getRememberLS());
    }, [getEmailLS(), getRememberLS()]);

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                id="sign-in"
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
                                            placeholder="johndoe@gmail.com"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <div className="space-y-1.5">
                                    <Label htmlFor="password" required>
                                        Password
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="password"
                                            type="password"
                                            variant="password"
                                            autoComplete="password"
                                            required
                                            placeholder="•••••••••"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormRootError />
                        <FormField
                            name="rememberMe"
                            control={form.control}
                            render={({ field }) => {
                                return (
                                    <div className="inline-flex w-full items-center justify-between">
                                        <FormControl>
                                            <div className="w-max content-start items-center space-x-2">
                                                <Checkbox
                                                    id="remember"
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                                <Label
                                                    htmlFor="remember"
                                                    className="cursor-pointer select-none text-typo-soft transition-colors peer-data-[state=checked]:text-typo-primary mb:text-sm"
                                                >
                                                    Remember me
                                                </Label>
                                            </div>
                                        </FormControl>
                                        <LinkCustom
                                            href={ROUTE_AUTH.FORGOT_PASSWORD}
                                            target="_self"
                                            className="hover-line-active text-sm font-medium !leading-[1.2] !text-typo-primary"
                                        >
                                            Forgot Password?
                                        </LinkCustom>
                                    </div>
                                );
                            }}
                        />
                    </div>

                    <div className="!mt-4 mb:!mt-5">
                        <Button
                            disabled={
                                isDisableButton || form.formState.isSubmitting
                            }
                            className="w-full"
                            variant="primary"
                            type="submit"
                            size={"xl"}
                        >
                            {form.formState.isSubmitting
                                ? "Logging In..."
                                : "Log In"}
                        </Button>
                    </div>
                    <div className="!mt-4 text-center text-sm text-typo-soft mb:!mt-5">
                        Don&apos;t have an account?
                        <LinkCustom
                            href={ROUTE_AUTH.SIGNUP}
                            target="_self"
                            className="hover-line-active ml-1 text-sm font-medium !text-typo-primary"
                        >
                            Sign Up
                        </LinkCustom>{" "}
                    </div>
                </div>
            </form>
        </Form>
    );
};

export default CredentialsSignInForm;
