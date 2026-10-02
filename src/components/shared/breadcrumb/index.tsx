import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbProps = {
    items: BreadcrumbItem[];
    className?: string;
};

export default function Breadcrumb({ items, className }: BreadcrumbProps) {
    return (
        <div
            className={cn(
                "flex w-full flex-row items-center gap-2 text-sm",
                className
            )}
        >
            {items.map((item, index) => (
                <div
                    key={index}
                    className="flex min-w-0 items-center gap-2 last:flex-1 last:overflow-hidden"
                >
                    {index > 0 && (
                        <span className="select-none text-typo-disable">/</span>
                    )}
                    {item.href ? (
                        <Button
                            variant={"link-df"}
                            asChild
                            className="font-normal"
                        >
                            <LinkCustom
                                href={item.href}
                                className="whitespace-nowrap text-typo-primary transition-colors"
                            >
                                {item.label}
                            </LinkCustom>
                        </Button>
                    ) : (
                        <span className="leading-1 block min-w-0 truncate text-typo-soft">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
