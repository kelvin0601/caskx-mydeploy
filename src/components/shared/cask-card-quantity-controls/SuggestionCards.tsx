import { Badge, TBadgeVariant } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";

export type TSuggestionItem = {
    id: string;
    label: string;
    price: number;
    badgeVariant?: TBadgeVariant;
    badgeClassName?: string;
};

export type TSuggestionCardsProps = {
    suggestions: TSuggestionItem[];
    selectedId: string | null;
    onSelect: (item: TSuggestionItem) => void;
    isLoading?: boolean;
    title?: string;
    className?: string;
};

export default function SuggestionCards({
    suggestions,
    selectedId,
    onSelect,
    isLoading = false,
    title = "Suggested Bids (Per cask)",
    className = "",
}: TSuggestionCardsProps) {
    if (isLoading) {
        return (
            <div className={`flex flex-col ${className}`}>
                <h3 className="mb-1.5 font-medium text-typo-primary">
                    {title}
                </h3>
                <div className="flex flex-row gap-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <CardSuggestionSkeleton key={index} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${className}`}>
            <h3 className="mb-1.5 font-medium text-typo-primary">{title}</h3>
            <div className="flex flex-row gap-4 tb:gap-2">
                {suggestions.map((item) => (
                    <CardSuggestion
                        key={item.id}
                        item={item}
                        isSelected={selectedId === item.id}
                        onClick={() => onSelect(item)}
                    />
                ))}
            </div>
        </div>
    );
}

export const CardSuggestion = ({
    item,
    isSelected,
    onClick,
    className,
}: {
    item: TSuggestionItem;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}) => {
    return (
        <Card
            className={cn(
                "h-20 w-full cursor-pointer border border-bd-main bg-bg-main p-4 transition-all hover:bg-bg-sf2 mb:h-[4.9375rem]",
                isSelected && "bg-bg-sf2",
                className
            )}
            onClick={onClick}
        >
            <div className="flex-center flex h-full w-full flex-col gap-1.5">
                <div className="text-sm font-semibold text-typo-primary">
                    {formatCurrency(item.price)}
                </div>
                <Badge
                    size="sm"
                    variant={item.badgeVariant ?? "default"}
                    className={item.badgeClassName}
                >
                    {item.label}
                </Badge>
            </div>
        </Card>
    );
};

export const CardSuggestionSkeleton = ({
    className,
}: {
    className?: string;
}) => {
    return (
        <Card
            className={cn(
                "h-20 w-full border-none bg-bg-sf2 p-4 mb:h-[4.9375rem]",
                className
            )}
        />
    );
};
