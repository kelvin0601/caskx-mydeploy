"use client";

import { PropsWithChildren } from "react";
import { SecurityContentItemDialog } from "../security-content-item";
import { useStoreDialogWrap } from "../two-fa-form/provider/security-dialog-provider";
import { JSX } from "react";

type TProps = {
    title: string;
    subtitle?: string;
    rightAction?: JSX.Element;
    className?: string;
    subtitleClassName?: string
} & PropsWithChildren;

export default function SecurityItemResetDialog({
    children,
    ...itemProps
}: TProps) {
    const { setStep } = useStoreDialogWrap();

    return (
        <SecurityContentItemDialog
            {...itemProps}
            onOpenAction={() => setStep("checkPassword")}
            handleAfterClose={async () => {
                await new Promise((resolve) => setTimeout(resolve, 300));
                setStep("checkPassword");
            }}
        >
            {children}
        </SecurityContentItemDialog>
    );
}
