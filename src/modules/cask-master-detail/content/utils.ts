import { formatCurrency } from "@/lib/utils";

export function formatVolume(val: number): string {
    if (val === 0) return "N/A";
    if (val >= 1000000) {
        return `£${(val / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (val >= 1000) {
        return `£${(val / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    }
    return formatCurrency(val);
}
