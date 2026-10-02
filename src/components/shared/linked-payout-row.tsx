import React from "react";
import IconChevonRight from "@/components/shared/icons/icon-chevon-right";

type LinkedPayoutRowProps = {
    code: string;
    email: string;
    amount: string | number;
    onClick?: () => void;
};

export default function LinkedPayoutRow({
    code,
    email,
    amount,
    onClick,
}: LinkedPayoutRowProps) {
    return (
        <div
            className="group flex cursor-pointer flex-row items-center justify-between gap-2 border-b py-3 transition-all last:border-b-0 hover:border-bd-brown"
            onClick={onClick}
        >
            <div className="flex flex-col">
                <h3 className="line-clamp-1 text-sm font-medium text-typo-primary">
                    {code}
                </h3>
                <div className="text-sm text-typo-note">{email}</div>
            </div>
            <div className="flex flex-row items-center gap-2">
                <div className="text-sm text-typo-primary">{amount}</div>
                <div className="size-4 text-typo-note transition-colors duration-300 group-hover:text-typo-primary">
                    <IconChevonRight />
                </div>
            </div>
        </div>
    );
}
