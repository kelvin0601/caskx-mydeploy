"use client";

import IconLoading from "@/components/shared/icons/icon-loading";
import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { useKycStep } from "../provider/kyc-step-provider";

type TFaceCaptureProps = {
    aspectRatio?: number;
    facingMode?: "user" | "environment";
};

export default function FaceCapture({
    aspectRatio = 1,
    facingMode = "user",
}: TFaceCaptureProps) {
    const webcamRef = useRef<Webcam>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { nextStep, setFormData } = useKycStep();

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot({
            width: 1920,
            height: 1080,
        });
        if (imageSrc) {
            const fileImage = new File([imageSrc], "avatar.jpg", {
                type: "image/jpeg",
            });
            setFormData({
                avatarImages: fileImage,
            });
            setImgSrc(imageSrc);
        }
    }, [webcamRef]);

    const retake = () => {
        setImgSrc(null);
    };

    return (
        <div className="mx-auto w-full max-w-md">
            <div className="flex justify-center">
                {imgSrc ? (
                    <div
                        className="relative w-full overflow-hidden rounded-lg"
                        style={{
                            aspectRatio: aspectRatio,
                        }}
                    >
                        <ImagePreload
                            src={imgSrc || "/placeholder.svg"}
                            alt="Captured face"
                            width={1920}
                            height={1080}
                            className="h-auto w-full max-w-[400px] -scale-x-100 rounded-md"
                        />
                    </div>
                ) : (
                    <div
                        className="relative w-full overflow-hidden rounded-lg"
                        style={{
                            aspectRatio: aspectRatio,
                        }}
                    >
                        <div
                            className={cn(
                                "absolute inset-0 transition-opacity duration-700",
                                isLoading && "opacity-100"
                            )}
                        >
                            <div className="flex-center absolute inset-0 flex animate-pulse bg-primary/5">
                                <div className="h-20 w-20">
                                    <IconLoading />
                                </div>
                            </div>
                        </div>
                        <div
                            className={cn(
                                "absolute inset-0 opacity-0 transition-opacity duration-700",
                                !isLoading && "opacity-100"
                            )}
                        >
                            <div
                                style={{
                                    aspectRatio: aspectRatio,
                                }}
                                className={cn(
                                    "absolute left-1/2 top-1/2 z-20 h-[73%] w-auto -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border-2 border-white-main transition-all"
                                )}
                            >
                                <div className="h-full w-full p-2.5">
                                    <Webcam
                                        audio={false}
                                        onUserMedia={() => {
                                            setIsLoading(false);
                                        }}
                                        onUserMediaError={() => {
                                            setIsLoading(false);
                                        }}
                                        ref={webcamRef}
                                        screenshotQuality={1}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            aspectRatio: aspectRatio,
                                            facingMode: facingMode,
                                        }}
                                        className="h-full w-full -scale-x-100 rounded-md object-cover"
                                    />
                                </div>
                            </div>
                            <div className="relative blur-sm">
                                <div className="absolute inset-0 z-20"></div>
                                <Webcam
                                    audio={false}
                                    screenshotQuality={0.01}
                                    videoConstraints={{
                                        aspectRatio: aspectRatio,
                                        facingMode: facingMode,
                                    }}
                                    className="h-auto w-full -scale-x-100 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-6 flex justify-center gap-4">
                {imgSrc ? (
                    <>
                        <Button onClick={retake} variant="outline">
                            Retake
                        </Button>
                        <Button variant="secondary" onClick={nextStep}>
                            Submit
                        </Button>
                    </>
                ) : (
                    <div onClick={capture} className="cursor-pointer">
                        <ImagePreload
                            className="h-[3.75rem] w-[3.75rem] select-none"
                            src={"/icons/icon-camera.svg"}
                            width={80}
                            height={80}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
