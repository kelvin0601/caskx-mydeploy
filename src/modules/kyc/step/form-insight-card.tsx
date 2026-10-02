import IconFaceId from "@/components/shared/icons/icon-faceid";
import IconPassport from "@/components/shared/icons/icon-passport";
import { Button } from "@/components/ui/button";
import HeadingKyc from "../heading";
import { useKycStep } from "../provider/kyc-step-provider";

export default function FormInsightCard() {
    const { nextStep } = useKycStep();
    return (
        <div className="flex flex-col gap-4">
            <HeadingKyc
                title="Choose your card"
                description="Steps you need to complete for verification"
            />
            <div className="flex flex-col rounded-md bg-bg-sf1 px-4">
                <div className="flex flex-row items-center gap-3 border-b border-bd-brown py-4">
                    <div className="rounded-md border border-bd-main bg-bg-main p-2.5">
                        <div className="h-5 w-5">
                            <IconPassport />
                        </div>
                    </div>
                    <div className="text-base font-medium text-typo-primary">
                        Government-issued ID
                    </div>
                </div>
                <div className="flex flex-row items-center gap-3 py-4">
                    <div className="rounded-md border border-bd-main bg-bg-main p-2.5">
                        <div className="h-5 w-5">
                            <IconFaceId />
                        </div>
                    </div>
                    <div className="text-base font-medium text-typo-primary">
                        Facial recognition
                    </div>
                </div>
            </div>
            <Button
                className="mx-auto w-max"
                variant={"secondary"}
                onClick={nextStep}
            >
                Continue
            </Button>
        </div>
    );
}
