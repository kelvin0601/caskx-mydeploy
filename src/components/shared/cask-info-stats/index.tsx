import { cn, formatNumber } from "@/lib/utils";
import type { cask } from "@/types/cask";

type CaskInfoStatsProps = {
    caskData?: cask.TCask;
    className?: string;
};

export default function CaskInfoStats({
    caskData,
    className,
}: CaskInfoStatsProps) {
    const vintage =
        caskData?.vintageYear ??
        (caskData?.distillationDate
            ? new Date(caskData.distillationDate).getFullYear()
            : "N/A");
    const bottleVolume = Number(caskData?.bottleVolume);
    const stats = [
        {
            label: "Region",
            value:
                caskData?.master?.region?.name ||
                caskData?.region?.name ||
                "N/A",
        },
        {
            label: "Distillery",
            value:
                caskData?.master?.distillery?.name ||
                caskData?.distillery?.name ||
                "N/A",
        },
        {
            label: "Vintage",
            value: vintage,
        },
        {
            label: "RLA",
            value: caskData?.rla
                ? `${formatNumber(Number(caskData.rla))} Litres`
                : "N/A",
        },
        {
            label: "ABV",
            value: caskData?.abv
                ? `${formatNumber(Number(caskData.abv))}%`
                : "N/A",
        },
        {
            label: "OLA",
            value: caskData?.ola
                ? `${formatNumber(Number(caskData.ola))} Litres`
                : "N/A",
        },
        {
            label: "Bottles",
            value: caskData?.estimatedBottleCount || "N/A",
        },
        {
            label: "Bottle Volume",
            value: caskData?.bottleVolume
                ? Number.isNaN(bottleVolume)
                    ? caskData.bottleVolume
                    : `${formatNumber(bottleVolume)}ml`
                : "N/A",
        },
    ];

    return (
        <div className={cn("grid grid-cols-2 !gap-2", className)}>
            {stats.map((item) => (
                <div
                    key={item.label}
                    className="flex min-w-0 flex-col gap-1 bg-bg-sf4 p-3"
                >
                    <span className="text-xs font-normal leading-none text-typo-note">
                        {item.label}
                    </span>
                    <span className="truncate text-sm font-semibold text-typo-primary">
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
