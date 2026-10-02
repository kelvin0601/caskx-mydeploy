import { Badge, BadgeProps } from "@/components/ui/badge";
import { LabelWithOutForm } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

export const FulfillmentPreferenceItem = ({
    title,
    description,
    variant,
    value,
    label,
}: {
    title: string;
    description: string;
    variant?: BadgeProps["variant"];
    value?: string;
    label?: string;
}) => {
    return (
        <div className="flex cursor-pointer flex-row-reverse items-start justify-between gap-3 rounded-md border border-bd-brown p-4 [&>*]:cursor-pointer">
            <LabelWithOutForm
                htmlFor={value}
                className="flex flex-1 flex-col gap-1"
            >
                <div className="flex flex-row items-start gap-3">
                    <h3 className="text-base font-medium text-typo-primary">
                        {title}
                    </h3>
                    <Badge variant={variant}>{label}</Badge>
                </div>
                <div
                    className="text-sm text-typo-soft"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            </LabelWithOutForm>
            {value && (
                <div className="pt-1">
                    <RadioGroupItem value={value} id={value} />
                </div>
            )}
        </div>
    );
};
