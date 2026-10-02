"use client";

import SlideTransition, {
    TSlideTransition,
} from "@/components/shared/slide-transition";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { Dialog } from "@/components/ui/dialog";
import { AnimatePresence } from "motion/react";
import { PropsWithChildren } from "react";
import AlertWallet from "./alert-wallet";
import DialogWallet from "./dialog-wallet";
import FormAddBanking from "./forms/form-add-banking";
import FormChooseStep from "./forms/form-choose-step";
import {
    AlertWalletProvider,
    useStoreAlertWrap,
} from "./provider/alert-wallet-provier";
import {
    DialogWrapProvider,
    useStoreDialogWrap,
} from "./provider/dialog-wallet-provider";
import { useWalletContext, WalletProvider } from "./provider/wallet-provider";

const Wallet = () => {
    return (
        <WalletProvider>
            <AlertWalletProvider>
                <DialogWrapProvider>
                    <WalletInner />
                    <AlertInner />
                    <DialogInner />
                </DialogWrapProvider>
            </AlertWalletProvider>
        </WalletProvider>
    );
};

const WalletInner = () => {
    const { step } = useWalletContext();
    return (
        <div className="grid grid-cols-1 overflow-hidden [&>_div]:col-start-1 [&>_div]:row-start-1">
            <AnimatePresence initial={false}>
                {renderStep()[step]?.()}
            </AnimatePresence>
        </div>
    );
};

const DialogInner = () => {
    const { isOpen, setIsOpenDialog } = useStoreDialogWrap();
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpenDialog}>
            <DialogWallet />
        </Dialog>
    );
};
const AlertInner = () => {
    const { isOpen, setOpenAlert } = useStoreAlertWrap();
    return (
        <AlertDialog open={isOpen} onOpenChange={setOpenAlert}>
            <AlertWallet />
        </AlertDialog>
    );
};

const renderStep = () => {
    return {
        chooseStep: () => {
            return (
                <SlideTransitionWrapper
                    className="chooseStep"
                    key={"chooseStep"}
                    duration={500}
                >
                    <FormChooseStep />
                </SlideTransitionWrapper>
            );
        },
        addBanking: () => {
            return (
                <SlideTransitionWrapper
                    className="addBanking"
                    key={"addBanking"}
                    duration={500}
                >
                    <FormAddBanking />
                </SlideTransitionWrapper>
            );
        },
    };
};

const SlideTransitionWrapper = ({
    children,
    ...props
}: TSlideTransition & PropsWithChildren) => {
    const { isBackAction } = useWalletContext();
    return (
        <SlideTransition
            {...props}
            id={props.className}
            isBackAction={isBackAction}
        >
            {children}
        </SlideTransition>
    );
};
export type TWallet = keyof ReturnType<typeof renderStep>;

export default Wallet;
