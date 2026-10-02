"use client";

import IconCoppy from "@/components/shared/icons/icon-coppy";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";

type TGridDetailItemProps = {
    label: string;
    value: string;
};

export default function GridDetailItem({ label, value }: TGridDetailItemProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy text: ", err);
        }
    };

    return (
        <div className="flex w-full flex-col gap-1">
            <span className="text-xs leading-none text-typo-note">{label}</span>
            <div className="flex items-center gap-2">
                <span className="break-all text-sm font-semibold text-typo-primary">
                    {value}
                </span>
                <Button
                    variant="empty"
                    className="w-max !min-w-0 shrink-0 !p-0 text-typo-soft hover:text-typo-primary"
                    onClick={handleCopy}
                >
                    {copied ? (
                        <Check className="h-4 w-4 text-success" />
                    ) : (
                        <div className="size-4 text-icon-main">
                            <IconCoppy />
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );
}
