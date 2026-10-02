import ImagePlaceholder from "@/components/shared/image-placeholder";
import { handleRenderFallbackText } from "@/lib/utils";

type TCaskSummaryProps = {
    imageUrl?: string;
    name?: string;
    vintageYear?: string | number | null;
    className?: string;
};

export default function CaskSummary({
    imageUrl,
    name,
    vintageYear,
    className,
}: TCaskSummaryProps) {
    return (
        <div
            className={`flex flex-1 items-center gap-4 mb:gap-2.5 ${className || ""}`}
        >
            <div className="relative h-[3.75rem] w-[3.75rem] shrink-0 overflow-hidden rounded-full border-[1.5px] border-bd-main bg-bg-sf2">
                <div className="absolute inset-[2.5px] overflow-hidden rounded-full border-[0.5px] border-bd-brown-lighter p-1">
                    <ImagePlaceholder
                        src={imageUrl}
                        width={120}
                        height={120}
                        alt={name || "Cask Image"}
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>
            </div>
            <div className="flex flex-col">
                <h4 className="text-base font-semibold text-typo-primary">
                    {handleRenderFallbackText(name)}
                </h4>
                <div className="flex items-center gap-1">
                    <span className="text-sm text-typo-soft">Vintage</span>
                    <span className="text-sm font-semibold text-typo-primary">
                        {handleRenderFallbackText(vintageYear)}
                    </span>
                </div>
            </div>
        </div>
    );
}
