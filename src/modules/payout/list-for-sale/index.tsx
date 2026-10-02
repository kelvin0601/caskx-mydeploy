import ImagePlaceholder from "@/components/shared/image-placeholder";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

type TListForSale = {
    title?: string;
    description?: string;
    buttonText?: string;
    className?: string;
    imageSrc?: string;
} & PropsWithChildren;

export default function ListForSale({
    title = "Deposit processing in progress",
    description = "The transfers typically take 3 days to complete. We will notify you as soon as it's confirmed, and provide instructions on the next steps.",
    imageSrc,
    className,
}: TListForSale) {
    return (
        <div
            className={cn(
                "flex-center flex-col space-y-8 p-6 mb:space-y-6",
                className
            )}
        >
            <div className="flex-center relative flex-col">
                <div className="max-w-[30.125rem]">
                    <div className="flex-center flex flex-col gap-6">
                        <div className="h-44 w-56">
                            <ImagePlaceholder
                                src={
                                    imageSrc ||
                                    "/images/processing_checkout.png"
                                }
                                width={440}
                                height={360}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <div className="text-center text-lg font-semibold text-typo-primary">
                                {title}
                            </div>
                            <div
                                className="text-typo-secondary text-center text-sm"
                                dangerouslySetInnerHTML={{
                                    __html: description,
                                }}
                            />
                        </div>
                        <Button
                            variant={"secondary"}
                            onClick={() => redirect(ROUTE_PUBLIC.HOME)}
                        >
                            Back to home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
