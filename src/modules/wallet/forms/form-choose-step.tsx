"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import IconBanking from "@/components/shared/icons/icon-banking";
import IconChevonRight from "@/components/shared/icons/icon-chevon-right";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconPlus from "@/components/shared/icons/icon-plus";
import { SecurityChildItem } from "@/components/shared/item-security";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { ItemSecuritySkeleton } from "@/modules/security/two-fa-form/skeleton/item-security";
import { useBoundStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import CardWallet from "../card-wallet";
import { useWalletContext } from "../provider/wallet-provider";
import { useStripePayouts } from "@/hooks/useStripePayouts";

export default function FormChooseStep() {
    const { setStep, wallet } = useWalletContext();
    const { user } = useBoundStore();
    const isHaveWallet = wallet.length > 0;

    const payoutsQuery = useStripePayouts(user?.stripeAccount?.id);

    const renderButtonAdd = () => {
        return (
            <Button
                variant={"outline"}
                onClick={() => {
                    setStep("addBanking");
                }}
            >
                <div className="h-4 w-4">
                    <IconPlus />
                </div>
                <span>Add method</span>
            </Button>
        );
    };

    const banks = useMemo(() => {
        const cloneData = { ...payoutsQuery.data };
        const externalAccounts = cloneData?.payouts?.externalAccounts;
        return externalAccounts?.map((item) => {
            return {
                id: item.id,
                name: item.bankName,
                last4: item.last4,
                status: item.status,
            };
        });
    }, [payoutsQuery.data]);

    if (payoutsQuery.isLoading) {
        return <SkeletonChooseStep />;
    }
    return (
        <div className="flex flex-col gap-12 tb:gap-0">
            <div className="flex flex-col gap-5">
                {/* <HeadingSettings
                    title="Payment method"
                    description="Securely handle your purchases - add, update, or remove your preferred payment options."
                    className="border-b-[0.0625rem] border-bd-brown pb-5"
                >
                    {isHaveWallet ? renderButtonAdd() : null}
                </HeadingSettings> */}
                {/* <div className="flex flex-col gap-2.5">
                    {isHaveWallet ? (
                        <ListPaymentMethods />
                    ) : (
                        <SecurityChildItem
                            isActive
                            title="Add your payment methods"
                            icon={<IconBanking />}
                            action={() => {
                                setStep("addBanking");
                            }}
                            rightContent={() => (
                                <div className="mr-4 h-5 w-5 [&_path]:stroke-[#A7B1B9]">
                                    <IconChevonRight />
                                </div>
                            )}
                        />
                    )}
                </div> */}
            </div>
            <div className="flex flex-col gap-5">
                <HeadingSettings
                    title="Payout method"
                    description="Get paid your way - manage how you receive returns from your cask trades."
                    className="border-b-[0.0625rem] border-bd-brown pb-5"
                />
                <div className="flex flex-col gap-2.5">
                    {banks && banks.length > 0 ? (
                        banks.map((item) => (
                            <SecurityChildItem
                                key={item.id}
                                title={item.name || "N/A"}
                                subTitle={`************ ${item.last4}`}
                                isActive
                                action={() => {}}
                                icon={<IconBanking />}
                                rightContent={() => (
                                    <div className="mr-4 h-5 w-5 [&_path]:stroke-[#A7B1B9]">
                                        <IconEdit />
                                    </div>
                                )}
                            />
                        ))
                    ) : (
                        <SecurityChildItem
                            title="Add your payout methods"
                            isActive
                            icon={<IconBanking />}
                            rightContent={() => (
                                <div className="mr-4 h-5 w-5 [&_path]:stroke-[#A7B1B9]">
                                    <IconChevonRight />
                                </div>
                            )}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

const ListPaymentMethods = () => {
    const payment_list = [
        {
            id: "visa",
            images: "/images/card-payment/visa.jpg",
            isDefault: true,
            number: "4332238212345678",
        },
        {
            id: "mastercard",
            images: "/images/card-payment/mastercard.jpg",
            isDefault: false,
            number: "2221000010000015",
        },

        {
            id: "jcb",
            images: "/images/card-payment/jcb.jpg",
            isDefault: false,
            number: "3528000000000007",
        },
        {
            id: "unionpay",
            images: "/images/card-payment/unionpay.jpg",
            isDefault: false,
            number: "6200000000000005",
        },
        {
            id: "amex",
            images: "/images/card-payment/amex.jpg",
            isDefault: false,
            number: "340000000000009",
        },
        {
            id: "diner_club",
            images: "/images/card-payment/diner_club.jpg",
            isDefault: false,
            number: "6011000010000012",
        },
        {
            id: "discover",
            images: "/images/card-payment/discover.jpg",
            isDefault: false,
            number: "6011000010000012",
        },
    ];

    return (
        <Carousel className="-mx-2.5">
            <CarouselContent className="flex w-full flex-row">
                {payment_list.map((item) => (
                    <CardWallet {...item} key={item.id} />
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export const SkeletonChooseStep = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 border-bd-main pb-5">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex flex-col gap-2.5">
                <ItemSecuritySkeleton haveMidContent isActive />
            </div>
            <div className="mt-6 flex w-full flex-row justify-between">
                <div className="flex flex-1 flex-col gap-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>
            <div className="mb-5 flex w-full flex-row justify-between">
                <div className="flex flex-1 flex-col gap-2">
                    <ItemSecuritySkeleton haveMidContent isActive />
                </div>
            </div>
        </div>
    );
};
