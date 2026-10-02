import { cn } from "@/lib/utils";

type TRankBadgeProps = {
    rank: number;
    showCount?: boolean;
    className?: string;
};

const RANK_STYLES: Record<
    number,
    {
        background: string;
        border: string;
        color: string;
    }
> = {
    1: {
        background:
            "linear-gradient(180deg, rgba(255, 246, 194, 0.50) 0%, rgba(246, 166, 28, 0.50) 100%)",
        border: "1px solid rgba(243, 188, 82, 0.80)",
        color: "#B8842F",
    },
    2: {
        background: "linear-gradient(180deg, #F8F8F8 0%, #CDCDCD 100%)",
        border: "1px solid rgba(165, 165, 165, 0.50)",
        color: "#6B6B6B",
    },
    3: {
        background:
            "linear-gradient(180deg, rgba(255, 239, 229, 0.50) 0%, rgba(188, 128, 87, 0.50) 100%)",
        border: "1px solid rgba(208, 166, 126, 0.80)",
        color: "#81542E",
    },
};

export default function RankBadge({
    rank,
    className,
    showCount,
}: TRankBadgeProps) {
    if (rank > 3 || rank < 1) {
        if (!showCount) return;
        return (
            <span
                className={cn(
                    "flex h-10 w-10 items-center justify-center text-xs font-semibold text-typo-primary tb:size-8",
                    className
                )}
            >
                {showCount ? rank : null}
            </span>
        );
    }

    const { background, border, color } = RANK_STYLES[rank] || {};

    return (
        <div
            style={{ background, color, borderRadius: "999px" }}
            className={cn(
                "relative flex size-10 items-center justify-center text-xs font-bold shadow-sm tb:size-8",
                className
            )}
        >
            <div
                className="absolute inset-2 rounded-full tb:inset-1"
                style={{ border }}
            />
            {rank}
        </div>
    );
}
