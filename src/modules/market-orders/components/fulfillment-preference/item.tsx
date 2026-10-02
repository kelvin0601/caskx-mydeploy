import { Badge, BadgeProps } from "@/components/ui/badge";
import { LabelWithOutForm } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

type FulfillmentPreferenceItemProps = {
    title: string;
    description: React.ReactNode;
    variant?: BadgeProps["variant"];
    value?: string;
    label?: string;
};

export default function FulfillmentPreferenceItem({
    title,
    description,
    variant,
    value,
    label,
}: FulfillmentPreferenceItemProps) {
    return (
        <LabelWithOutForm
            htmlFor={value}
            className="flex flex-1 cursor-pointer gap-3 rounded-md border border-bd-main p-4 text-left font-normal transition-colors has-[:checked]:border-brand has-[:checked]:bg-bg-sf2 mb:col-span-full"
        >
            {value ? (
                <div className="shrink-0 pt-1">
                    <RadioGroupItem value={value} id={value} />
                </div>
            ) : null}
            <div className="flex min-w-0 flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-typo-primary">
                        {title}
                    </span>
                    {label ? (
                        <Badge
                            size="xs"
                            variant={variant}
                            className="capitalize"
                        >
                            {label}
                        </Badge>
                    ) : null}
                </div>
                {description ? (
                    <span className="break-words text-sm text-typo-soft">
                        {description}
                    </span>
                ) : null}
            </div>
        </LabelWithOutForm>
    );
}
