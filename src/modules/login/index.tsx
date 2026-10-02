"use client";

import TwoFaCredentialsSignIn from "@/components/shared/auth/2fa-credentials-sign-in";
import SMS2FaCredentialsSignIn from "@/components/shared/auth/2fa-sms-credentials-sign-in";
import CredentialsHead from "@/components/shared/auth/credentials-head";
import CredentialsSignInForm from "@/components/shared/auth/credentials-signin-form";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { AnimatePresence, m } from "motion/react";
import {
    LoginStepProvider,
    useLoginStep,
} from "./provider/login-step-provider";

export default function LoginModuleWrap() {
    return (
        <LoginStepProvider>
            <LoginModule />
        </LoginStepProvider>
    );
}

export enum LoginStep {
    CREDENTIALS = 1,
    AUTH_APP = 2,
    SMS = 3,
}

function LoginModule() {
    const { currentStep, setCurrentStep } = useLoginStep();

    return (
        <div className="relative w-full">
            {/* Background credentials form, always visible */}
            <div className="flex min-h-[50vh] w-full flex-col justify-center mb:items-start mb:justify-start">
                <CredentialsHead title="Welcome Back!" />
                <CredentialsSignInForm />
            </div>

            {/* 2FA Dialog Overlay */}
            <Dialog
                open={
                    currentStep === LoginStep.AUTH_APP ||
                    currentStep === LoginStep.SMS
                }
                onOpenChange={(open) => {
                    if (!open) {
                        setCurrentStep(LoginStep.CREDENTIALS, true);
                    }
                }}
            >
                <DialogContent
                    onInteractOutside={(e) => e.preventDefault()}
                    className="flex max-w-[23.25rem] flex-col gap-8 rounded-none border-none bg-bg-main shadow-2xl tb:gap-6 tb:p-0 mb:gap-6 [&>button]:h-10 [&>button]:w-10 [&>button]:rounded-lg [&>button]:p-2.5 [&>button]:text-typo-note [&>button]:transition-colors [&>button]:hover:bg-black/5 [&>button]:active:bg-black/10 [&>button_svg]:h-5 [&>button_svg]:w-5"
                >
                    <DialogTitle className="sr-only">
                        Two-factor authentication
                    </DialogTitle>
                    {/* Render step with transition */}
                    <AnimatePresence mode="wait" initial={false}>
                        {currentStep === LoginStep.AUTH_APP && (
                            <m.div
                                key="auth-app"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.25 }}
                                className="flex w-full flex-col gap-8"
                            >
                                <TwoFaCredentialsSignIn />
                            </m.div>
                        )}
                        {currentStep === LoginStep.SMS && (
                            <m.div
                                key="sms"
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -15 }}
                                transition={{ duration: 0.25 }}
                                className="flex w-full flex-col gap-8"
                            >
                                <SMS2FaCredentialsSignIn />
                            </m.div>
                        )}
                    </AnimatePresence>
                </DialogContent>
            </Dialog>
        </div>
    );
}
