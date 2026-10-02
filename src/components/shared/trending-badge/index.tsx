import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TrendingBadge({ className }: { className?: string }) {
    return (
        <Badge
            size={"sm"}
            variant="default"
            className={cn("mt-0.5", className)}
        >
            Trending
        </Badge>
    );
}
