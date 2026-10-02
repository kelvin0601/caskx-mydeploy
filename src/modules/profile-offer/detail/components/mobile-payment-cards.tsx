import IconMinus from "@/components/shared/icons/icon-minus";
import IconPlus from "@/components/shared/icons/icon-plus";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type MobilePaymentCardItem = {
    id: string;
    number: number;
    matchingDate: string;
    quantity: number;
    price: string;
    subtotal: string;
    stage: string;
    stageVariant: BadgeProps["variant"];
    onView: () => void;
};

function DetailRow({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) {
    return (
        <div className="flex min-w-0 items-center justify-between gap-4 text-sm">
            <span className="shrink-0 text-typo-soft">{label}</span>
            <span className="min-w-0 truncate text-right font-medium text-typo-primary">
                {value}
            </span>
        </div>
    );
}

export default function MobilePaymentCards({
    items,
}: {
    items: MobilePaymentCardItem[];
}) {
    if (items.length === 0) return null;

    return (
        <Accordion
            type="single"
            collapsible
            defaultValue={items[0].id}
            className="hidden flex-col gap-2 mb:flex"
        >
            {items.map((item) => (
                <AccordionItem
                    key={item.id}
                    value={item.id}
                    className="border-none px-4 outline outline-1 -outline-offset-1 outline-bd-main"
                >
                    <AccordionTrigger
                        className="group pb-3 pt-4 text-sm font-medium leading-[1.5] text-typo-primary mb:py-4"
                        classNameChevron="hidden"
                    >
                        <span>{item.number}</span>
                        <span
                            className="size-4 text-icon-main group-data-[state=open]:hidden"
                            aria-hidden="true"
                        >
                            <IconPlus />
                        </span>
                        <span
                            className="hidden size-4 text-icon-main group-data-[state=open]:block"
                            aria-hidden="true"
                        >
                            <IconMinus />
                        </span>
                    </AccordionTrigger>

                    <AccordionContent className="pb-[0.6875rem]">
                        <div className="flex flex-col gap-1.5">
                            <DetailRow
                                label="Matching date"
                                value={item.matchingDate}
                            />
                            <DetailRow label="Quantity" value={item.quantity} />
                            <DetailRow label="Price" value={item.price} />
                            <DetailRow label="Subtotal" value={item.subtotal} />
                        </div>
                        <Button
                            variant="outline"
                            className="mt-3 h-10 w-full"
                            onClick={item.onView}
                        >
                            View
                        </Button>
                    </AccordionContent>

                    <div className="flex min-w-0 items-center justify-between gap-4 border-t border-bd-main pb-4 pt-3 text-sm">
                        <span className="text-typo-soft">Stage</span>
                        <Badge
                            variant={item.stageVariant}
                            size="sm"
                            className="h-5 max-w-[70%] truncate font-semibold"
                        >
                            {item.stage}
                        </Badge>
                    </div>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
