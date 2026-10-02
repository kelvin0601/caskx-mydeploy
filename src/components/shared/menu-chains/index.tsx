"use client";

import IconCheck from "@/components/shared/icons/icon-check";
import { Skeleton } from "@/components/ui/skeleton";
import { CHECKOUT_STATUS } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { cn, formatDateTime, handleCamelCaseToSnakeCase } from "@/lib/utils";
import { checkout } from "@/types/checkout";

export default function MenuChains({
    className,
    statusTransaction,
    menus,
}: {
    className?: string;
    statusTransaction: checkout.TTransactionStatus;
    menus: {
        title: string;
        href: string;
        isOpenWindow: boolean;
        step: string;
    }[];
}) {
    const { currentStep, expiryDate, transactions } = statusTransaction || {};
    const isSellerSigned = transactions?.every(
        (transaction) =>
            transaction.sellerAgreementStatus === EDocuSignStatus.ALL_SIGNED &&
            transaction?.sellerAgreementAdminSignerId !== null
    );

    return (
        <div className={cn("relative", className)}>
            <div className="sticky top-[6rem] flex max-w-[14.4375rem] flex-col gap-16 transition-all duration-500 header-hidden:top-[2rem] tb:top-20 tb:max-w-none tb:flex-row tb:justify-between tb:gap-2 mb:top-8">
                {menus.map((item, index, args) => {
                    const convertStep = handleCamelCaseToSnakeCase(
                        currentStep || ""
                    );
                    const isActive =
                        item.step === convertStep && isSellerSigned;
                    const idActive = args.findIndex(
                        (item) => item.step === convertStep
                    );
                    const isChecked =
                        index < idActive ||
                        (idActive == args.length - 1 &&
                            statusTransaction.status ===
                                CHECKOUT_STATUS.COMPLETED);

                    return (
                        <MenuCheckoutItem
                            item={item}
                            expiryDate={expiryDate}
                            index={index}
                            key={item.step}
                            isActive={isActive}
                            isChecked={isChecked}
                            args={args}
                        />
                    );
                })}
            </div>
        </div>
    );
}

const MenuCheckoutItem = ({
    item,
    index,
    isActive,
    expiryDate,
    isChecked,
    args,
}: {
    item: {
        title: string;
        href: string;
        isOpenWindow: boolean;
        step: string;
    };
    index: number;
    expiryDate?: string;
    isActive: boolean;
    isChecked: boolean;
    args: {
        title: string;
        href: string;
        isOpenWindow: boolean;
        step: string;
    }[];
}) => {
    const indexSlice = index === args.length - 1 ? 0 : 1;
    return (
        <button
            key={index}
            className={cn(
                "relative flex w-full flex-row capitalize after:absolute after:left-4 after:top-[calc(100%+0.5rem)] after:h-[3.125rem] after:w-0.5 after:border after:border-dashed after:border-bg-sf3 after:content-[''] last:after:hidden tb:w-max tb:after:!left-[calc(100%+1rem)] tb:after:top-1/2 tb:after:h-px tb:after:w-12 tb:after:-translate-y-1/2 mb:w-full mb:flex-1 mb:flex-shrink-0 mb:flex-col mb:items-center mb:after:!left-[calc(100%-1rem)] mb:after:-top-1 mb:after:!w-10 mb:after:translate-y-[1rem]",
                isChecked && "after:border-success"
            )}
        >
            <div
                className={cn(
                    "flex flex-row items-center gap-2 mb:flex-col",
                    isActive && "items-start tb:items-center"
                )}
            >
                <div
                    className={cn(
                        "text-typo-base flex-center flex h-8 w-8 rounded-full bg-bg-sf1 text-typo-primary mb:h-6 mb:w-6 mb:text-xs",
                        (isActive || isChecked) &&
                            "bg-success-100 text-success-darker"
                    )}
                >
                    {isChecked ? (
                        <div className="flex-center h-6 w-6 mb:h-4 mb:w-4 [&_path]:!stroke-success-darker">
                            <IconCheck />
                        </div>
                    ) : (
                        index + 1
                    )}
                </div>
                <div className="flex flex-col gap-1 text-start mb:text-center">
                    <div className="text-sm font-medium text-typo-primary mb:hidden">
                        {item.title}
                    </div>
                    <div className="hidden text-sm font-medium text-typo-primary mb:block">
                        {item.title
                            .split(" ")
                            .slice(indexSlice, indexSlice + 1)}
                    </div>
                    {isActive && !isChecked && (
                        <div className="text-start text-sm text-typo-soft tb:hidden tb:text-xs">
                            Complete on{" "}
                            {formatDateTime(expiryDate || "").dateOnly}
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
};

export const MenuSettingsSkeleton = ({ className }: { className?: string }) => {
    return (
        <div className={cn("relative", className)}>
            <div className="sticky top-[6rem] flex max-w-[14.4375rem] flex-col gap-2 transition-all duration-500 header-hidden:top-[2rem]">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        </div>
    );
};
