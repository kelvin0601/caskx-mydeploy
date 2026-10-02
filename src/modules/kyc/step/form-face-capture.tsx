import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";
import HeadingKyc from "../heading";

const FaceCapture = dynamic(() => import("../face-captured"), {
    ssr: false,
    loading: () => <Skeleton className="aspect-[478/272] w-full" />,
});

export default function FormFaceCapture() {
    return (
        <div className="flex flex-col gap-6">
            <HeadingKyc title="Facial recognition" />
            <FaceCapture aspectRatio={478 / 272} />
            <div className="text-center text-sm text-typo-note">
                This information is used for identity verification only, and
                will be kept secure by Cask Exchange Platform
            </div>
        </div>
    );
}
