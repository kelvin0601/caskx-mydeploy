"use client";

import { cn } from "@/lib/utils";
import { useKycStep } from "../provider/kyc-step-provider";

export default function ProgressBar() {
    const { currentStep, totalStep } = useKycStep();
    return (
        <div className="mx-auto h-1.5 w-full">
            <div className="relative h-full w-full rounded-sm bg-bg-sf1">
                <div
                    style={{
                        width: `${((currentStep - 1) / (totalStep - 2)) * 100}%`,
                    }}
                    className={cn(
                        "absolute left-0 top-0 z-10 h-full rounded-sm bg-brand transition-all duration-500"
                    )}
                ></div>
            </div>
        </div>
    );
}
