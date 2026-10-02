import { TBadgeVariant } from "@/components/ui/badge";

export type TVariantStatusBadgesInput = {
    isListed?: boolean;
    readyToSell?: boolean;
};

export type TVariantStatusBadge = {
    id: string;
    label: string;
    variant: TBadgeVariant;
};

export function buildVariantStatusBadges(
    variant: TVariantStatusBadgesInput,
    options?: {
        inactiveVariant?: TBadgeVariant;
        includeReadyWhenFalse?: boolean;
    }
): TVariantStatusBadge[] {
    const inactiveVariant = options?.inactiveVariant ?? "outline";
    const includeReadyWhenFalse = options?.includeReadyWhenFalse ?? false;

    const badges: TVariantStatusBadge[] = [
        {
            id: variant.isListed ? "active" : "inactive",
            label: variant.isListed ? "Active" : "Inactive",
            variant: variant.isListed ? "success" : inactiveVariant,
        },
    ];

    if (variant.readyToSell || includeReadyWhenFalse) {
        badges.push({
            id: "ready-to-sell",
            label: variant.readyToSell ? "Ready to Sell" : "Not Ready to Sell",
            variant: variant.readyToSell ? "info" : "outline",
        });
    }

    return badges;
}
