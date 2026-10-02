"use client";

import IconLoading from "@/components/shared/icons/icon-loading";
import SlideTransition, {
    TSlideTransition,
} from "@/components/shared/slide-transition";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useStoreAlertWrap } from "@/modules/wallet/provider/alert-wallet-provier";
import { AnimatePresence } from "motion/react";
import { PropsWithChildren } from "react";
import { useIsMobile } from "../../../hooks/use-mobile";
import { FormCheckPassword } from "./forms/form-check-password";
import { FormChooseTwoFa } from "./forms/form-choose-two-fa";
import { FormSetupGoogleAuth } from "./forms/form-google-auth";
import { FormGoogleAuthActive } from "./forms/form-google-auth-active";
import FormSessionAdd from "./forms/form-session-add";
import FormSessionEdit from "./forms/form-session-edit";
import { FormSetupSMSAuth } from "./forms/form-sms-auth";
import { FormSMSAuthActive } from "./forms/form-sms-auth-active";
import { useStoreDialogWrap } from "./provider/security-dialog-provider";

export default function TwoFaForm() {
    const { step, isLoading } = useStoreDialogWrap();
    const isMobile = useIsMobile();

    const { setIsOpenDialog, isOpen } = useStoreDialogWrap();
    const renderStep = (step: TStepType) => {
        return createRenderStep()[step]?.();
    };

    return isMobile ? (
        <Drawer
            key="form-two-fa-mobile"
            direction="bottom"
            open={isOpen}
            onOpenChange={setIsOpenDialog}
        >
            <DrawerContent className="mb:!max-h-[80vh]">
                <DrawerTitle className="sr-only">
                    Security verification
                </DrawerTitle>
                <AnimatePresence initial={false} mode="popLayout">
                    {renderStep(step)}
                </AnimatePresence>

                {isLoading && (
                    <div className="absolute inset-0">
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
    ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpenDialog}>
            <DialogContent
                onInteractOutside={(e) => e.preventDefault()}
                classClose="top-0"
                className="grid w-max min-w-[23.75rem] grid-cols-1 grid-rows-1 items-center overflow-hidden [&>*]:col-start-1 [&>*]:row-start-1"
            >
                <DialogTitle className="sr-only">
                    Security verification
                </DialogTitle>
                <AnimatePresence initial={false} mode="popLayout">
                    {renderStep(step)}
                </AnimatePresence>

                {isLoading && (
                    <div className="absolute inset-0">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="absolute inset-0 animate-pulse bg-background/80" />
                            <div className="h-20 w-20">
                                <IconLoading />
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

const createRenderStep = () => {
    return {
        checkPassword: () => {
            return (
                <SlideTransitionWrapper
                    isJustBack
                    className="checkPassword"
                    key={"checkPassword"}
                    duration={500}
                    direction="right"
                >
                    <FormCheckPassword />
                </SlideTransitionWrapper>
            );
        },
        chooseMethod: () => {
            return (
                <SlideTransitionWrapper
                    className="chooseMethod"
                    key={"chooseMethod"}
                    duration={500}
                >
                    <FormChooseTwoFa />
                </SlideTransitionWrapper>
            );
        },
        setupGoogleAuth: () => {
            return (
                <SlideTransitionWrapper
                    className="setupGoogleAuth"
                    key={"setupGoogleAuth"}
                    duration={500}
                >
                    <FormSetupGoogleAuth />
                </SlideTransitionWrapper>
            );
        },
        setupSMSAuth: () => {
            return (
                <SlideTransitionWrapper
                    className="setupSMSAuth"
                    key={"setupSMSAuth"}
                    duration={500}
                >
                    <FormSetupSMSAuth />
                </SlideTransitionWrapper>
            );
        },
        setupGoogleAuthActive: () => {
            return (
                <SlideTransitionWrapper
                    className="setupGoogleAuthActive"
                    key={"setupGoogleAuthActive"}
                    duration={500}
                >
                    <FormGoogleAuthActive />
                </SlideTransitionWrapper>
            );
        },
        setupSMSAuthActive: () => {
            return (
                <SlideTransitionWrapper
                    className="setupSMSAuthActive"
                    key={"setupSMSAuthActive"}
                    duration={500}
                >
                    <FormSMSAuthActive />
                </SlideTransitionWrapper>
            );
        },
        sessionAdd: () => {
            return (
                <SlideTransitionWrapper
                    className="sessionAdd"
                    key={"sessionAdd"}
                    duration={500}
                >
                    <FormSessionAdd />
                </SlideTransitionWrapper>
            );
        },
        sessionEdit: () => {
            return (
                <SlideTransitionWrapper
                    className="sessionEdit"
                    key={"sessionEdit"}
                    duration={500}
                >
                    <FormSessionEdit />
                </SlideTransitionWrapper>
            );
        },
    } as const;
};

const SlideTransitionWrapper = ({
    children,
    ...props
}: TSlideTransition & PropsWithChildren) => {
    const { isBackAction } = useStoreDialogWrap();
    // const slideRef = useRef<HTMLDivElement>(null);

    // useEffect(() => {
    //     const height = slideRef.current?.clientHeight;
    //     console.log(height);
    // }, [slideRef.current]);

    return (
        <SlideTransition
            {...props}
            // ref={slideRef}
            id={props.className}
            isBackAction={isBackAction}
        >
            {children}
        </SlideTransition>
    );
};

export type TStepType = keyof ReturnType<typeof createRenderStep>;

export const stepKeys = Object.keys(createRenderStep()) as TStepType[];
