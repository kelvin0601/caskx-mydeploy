import { cn } from "@/lib/utils";

type TInfoRowProps = {
    label: string;
    value: React.ReactNode;
    className?: string;
    orientation?: "horizontal" | "vertical";
};

export function InfoRow({
    label,
    value,
    className = "",
    orientation = "horizontal",
}: TInfoRowProps) {
    if (orientation === "vertical") {
        return (
            <div className={cn("flex flex-col gap-1", className)}>
                <div className="text-xs font-normal text-typo-note">
                    {label}
                </div>
                <div className="text-sm font-semibold leading-[1.2] text-typo-primary">
                    {value}
                </div>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-shrink-0 items-start", className)}>
            <div className="w-40 flex-shrink-0 whitespace-nowrap text-xs font-normal text-typo-note">
                {label}
            </div>
            <div className="text-sm font-semibold leading-[1.2] text-typo-primary">
                {value}
            </div>
        </div>
    );
}
