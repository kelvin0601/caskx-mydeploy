import { cn } from "@/lib/utils";

type TProfileSliderBarProps = {
    leftLabel: string;
    rightLabel: string;
    position: number; // 1–7
};

export default function ProfileSliderBar({
    leftLabel,
    rightLabel,
    position,
}: TProfileSliderBarProps) {
    return (
        <div className="flex items-center justify-between">
            <span className="w-[4.375rem] shrink-0 text-left text-sm font-medium leading-normal text-typo-primary">
                {leftLabel}
            </span>
            <div className="flex flex-1 items-center gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-1.5 flex-1",
                            i + 1 === position ? "bg-brand" : "bg-bg-sf3"
                        )}
                    />
                ))}
            </div>
            <span className="w-[4.375rem] shrink-0 text-right text-sm font-medium leading-normal text-typo-primary">
                {rightLabel}
            </span>
        </div>
    );
}
