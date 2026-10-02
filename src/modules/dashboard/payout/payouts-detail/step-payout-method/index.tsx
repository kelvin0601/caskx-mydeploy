"use client";

import InfoField from "@/components/shared/info-field";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import { global } from "@/types/global/global";

type StepPayoutMethodProps = {
    bankName: string;
    bankAccount: string;
    status?: global.TParticipantStatus;
    isActive?: boolean;
    isAccordion?: boolean;
};

export default function StepPayoutMethod({
    bankName,
    bankAccount,
    status,
    isActive = true,
}: StepPayoutMethodProps) {
    return (
        <StepRowAccordion
            title="Payout Method"
            value="payout-method"
            status={status}
            isActive={isActive}
            isAccordion={false}
        >
            <div className="border-bd-main pt-6">
                <div className="grid grid-cols-2 !gap-4">
                    <InfoField
                        label="Bank Name"
                        value={bankName}
                        valueClassName="uppercase"
                    />
                    {!!bankAccount && (
                        <InfoField
                            label="Bank Account"
                            value={`*************${bankAccount}`}
                            valueClassName="font-workSans "
                        />
                    )}
                </div>
            </div>
        </StepRowAccordion>
    );
}
