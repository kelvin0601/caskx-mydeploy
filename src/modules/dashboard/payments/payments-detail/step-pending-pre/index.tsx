"use client";

import React from "react";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import IconArrowRight from "@/components/shared/icons/icon-arrow-right";
import StatusAlert from "@/components/shared/status-alert";

import { handleRenderFallbackText, formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ROUTE_DASHBOARD } from "@/lib/constants";
import { global } from "@/types/global/global";

type Participant = {
    code: string;
    email: string;
    status: global.TParticipantStatus;
    onClick: () => void;
};

export default function StepPendingPre({
    participants,
    status,
    expiryDate,
    isAccordion = true,
    isDisabled = false,
}: {
    participants: {
        code: string;
        email: string;
        status: global.TParticipantStatus;
    }[];
    status: global.TParticipantStatus;
    expiryDate?: string;
    isAccordion?: boolean;
    isDisabled?: boolean;
}) {
    const router = useRouter();
    const ParticipantRow = ({
        email,
        status,
        onClick,
    }: Omit<Participant, "code">) => (
        <div
            onClick={onClick}
            className="group flex cursor-pointer items-center justify-between border-b px-4 py-3 transition-all duration-300 last:border-b-0 hover:border-bd-brown"
        >
            <div className="flex items-center gap-2">
                <span
                    className={`h-2 w-2 rounded-full ${
                        status === "completed"
                            ? "bg-success"
                            : status === "expired"
                              ? "bg-typo-disable"
                              : "bg-brand"
                    }`}
                />
                <span className="text-sm text-typo-primary">
                    {handleRenderFallbackText(email)}
                </span>
            </div>
            <div className="flex flex-row items-center gap-2">
                <div
                    className={`text-sm capitalize ${
                        status === "completed"
                            ? "text-success"
                            : status === "expired"
                              ? "text-typo-disable"
                              : "text-warn-darker"
                    }`}
                >
                    {status}
                </div>
                <div className="size-4 text-typo-note transition-colors duration-300 group-hover:text-typo-primary">
                    <IconArrowRight />
                </div>
            </div>
        </div>
    );

    return (
        <StepRowAccordion
            title="Pending (Pre-Step 1)"
            value="pending-pre-step-1"
            status={status}
            isActive={!isDisabled}
            isAccordion={isAccordion}
            isDisabled={isDisabled}
        >
            {status === "pending" && expiryDate && (
                <StatusAlert
                    variant="pending"
                    title="Waiting for Seller Agreements"
                    description={`Expires: ${formatDateTime(expiryDate).dateOnly}`}
                />
            )}

            <div className="rounded-xl">
                {participants.map((p) => (
                    <ParticipantRow
                        onClick={() => {
                            console.log(p.code);
                            router.push(`${ROUTE_DASHBOARD.PAYOUT}/${p.code}`);
                        }}
                        key={p.email}
                        email={p.email}
                        status={p.status}
                    />
                ))}
            </div>
        </StepRowAccordion>
    );
}
