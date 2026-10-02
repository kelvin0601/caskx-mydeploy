"use client";

import IconChevonLeft from "@/components/shared/icons/icon-chevon-left";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { redirect } from "next/navigation";
import ProgressBar from "./progress-bar";
import { KycStepProvider, useKycStep } from "./provider/kyc-step-provider";
import StepsKyc from "./step";

export default function KycModuleWrap() {
    return (
        <KycStepProvider>
            <KycModule />
        </KycStepProvider>
    );
}

function KycModule() {
    const { currentStep, totalStep, prevStep } = useKycStep();
    const isLastStep = currentStep === totalStep;
    const handleBack = () => {
        if (currentStep === 1) {
            redirect(ROUTE_PUBLIC.SETTINGS_SECURITY);
        } else {
            prevStep();
        }
    };
    return (
        <div className="container grid grid-cols-12 bg-bg-main py-20">
            <div className="col-start-5 -col-end-5 mx-auto flex w-full max-w-[30rem] flex-col">
                {!isLastStep && <ProgressBar />}
                <div className="mt-20 flex flex-col gap-6">
                    {!isLastStep && (
                        <div
                            onClick={(e) => {
                                if (currentStep === 1) {
                                    e.preventDefault();
                                    redirect(ROUTE_PUBLIC.SETTINGS_SECURITY);
                                } else {
                                    handleBack();
                                }
                            }}
                            className="hover-line mx-auto w-max font-medium text-typo-primary"
                        >
                            <div className="flex flex-row items-center gap-1">
                                <div className="h-4 w-4">
                                    <IconChevonLeft />
                                </div>
                                Back
                            </div>
                        </div>
                    )}

                    <StepsKyc />
                </div>
            </div>
        </div>
    );
}
