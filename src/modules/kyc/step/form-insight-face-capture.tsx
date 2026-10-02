import ImagePlaceholder from "@/components/shared/image-placeholder";
import HeadingKyc from "../heading";
import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import { useKycStep } from "../provider/kyc-step-provider";

export default function FormInsightFaceCapture() {
    const { nextStep } = useKycStep();
    return (
        <div className="flex flex-col gap-4">
            <HeadingKyc title="Facial recognition" />
            <div className="grid h-[18.75rem] grid-cols-2 grid-rows-2 !gap-4">
                <div className="relative row-span-2 overflow-hidden rounded-md border border-bd-brown">
                    <div className="flex-center absolute right-2.5 top-2.5 z-30 flex h-[1.875rem] w-[1.875rem] rounded-full bg-success">
                        <ImagePreload
                            src={"/icons/icon-check.png"}
                            width={40}
                            height={40}
                        />
                    </div>
                    <ImagePlaceholder
                        src={"/images/face-insight-1.jpg"}
                        alt="face-insight-1"
                        imgClassName="img-h"
                        className="h-full"
                        width={200}
                        fetchPriority="high"
                        height={200}
                    />
                </div>
                <div className="relative row-span-1 overflow-hidden rounded-md border border-bd-brown">
                    <div className="flex-center absolute right-2.5 top-2.5 z-30 flex h-[1.875rem] w-[1.875rem] rounded-full bg-success">
                        <ImagePreload
                            src={"/icons/icon-error.png"}
                            width={40}
                            height={40}
                        />
                    </div>
                    <ImagePlaceholder
                        src={"/images/face-insight-2.jpg"}
                        alt="face-insight-2"
                        imgClassName="img-h"
                        fetchPriority="high"
                        width={200}
                        className="h-full"
                        height={200}
                    />
                </div>
                <div className="relative row-span-1 overflow-hidden rounded-md border border-bd-brown">
                    <div className="flex-center absolute right-2.5 top-2.5 z-30 flex h-[1.875rem] w-[1.875rem] rounded-full bg-success">
                        <ImagePreload
                            src={"/icons/icon-error.png"}
                            width={40}
                            height={40}
                        />
                    </div>
                    <ImagePlaceholder
                        src={"/images/face-insight-3.jpg"}
                        alt="face-insight-3"
                        width={200}
                        fetchPriority="high"
                        className="h-full"
                        height={200}
                        imgClassName="img-h"
                    />
                </div>
            </div>
            <div className="rounded-lg bg-bg-sf1 p-4">
                <div className="flex flex-col gap-3">
                    <div className="text-base font-medium capitalize text-typo-primary">
                        Important notes
                    </div>
                    <ul className="grid list-disc grid-cols-2 !gap-x-3 !gap-y-2">
                        <li className="ml-4 text-sm text-typo-soft">
                            Front and clear angle
                        </li>
                        <li className="ml-4 text-sm text-typo-soft">
                            Well-lit
                        </li>
                        <li className="ml-4 text-sm text-typo-soft">
                            Don’t occluded face
                        </li>
                        <li className="ml-4 text-sm text-typo-soft">
                            Don&apos;t take screenshots
                        </li>
                    </ul>
                </div>
            </div>
            <Button onClick={() => nextStep()} className="mx-auto w-max">
                Continue
            </Button>
        </div>
    );
}
