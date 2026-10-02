"use client";

import { Badge } from "@/components/ui/badge";
import { CaskVariantItem } from "@/store/dashboard/CaskProvider";
import { buildVariantStatusBadges } from "./variant-status-badges";

export function VintageItem({ variant }: { variant: CaskVariantItem }) {
    const tags = buildVariantStatusBadges(variant, {
        inactiveVariant: "warning",
    });

    return (
        <div className="flex w-full min-w-0 flex-col gap-1.5">
            <div className="truncate text-sm font-semibold leading-[1.5] text-[#1B0D03]">
                {variant.vintageYear ?? "New vintage"}
            </div>
            <div className="flex flex-row flex-wrap gap-1">
                {tags.map((item) => {
                    return (
                        <Badge
                            key={item.id}
                            variant={item.variant}
                            size="xs"
                            className={
                                item.id === "active"
                                    ? "!bg-[#0E070214] !text-[#058134]"
                                    : item.id === "ready-to-sell"
                                      ? "!bg-[#0E070214] !text-[#056DFF]"
                                      : "!bg-[#0E070214] !text-[#FF8C00]"
                            }
                        >
                            {item.label}
                        </Badge>
                    );
                })}
            </div>
        </div>
    );
}
