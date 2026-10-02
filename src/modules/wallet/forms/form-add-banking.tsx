"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import IconStripe from "@/components/shared/icons/icon-stripe";
import ImagePreload from "@/components/shared/image-preload";
import { SecurityChildItem } from "@/components/shared/item-security";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn, detectCardType } from "@/lib/utils";
import { cardPaymentSchema } from "@/lib/validators";
import { SelectFlag } from "@/modules/kyc/select-flag";
import { useBoundStore } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import parsePhoneNumberFromString from "libphonenumber-js";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useWalletContext } from "../provider/wallet-provider";
export default function FormAddBanking() {
    const { user } = useBoundStore();
    const { setStep, setWallet, wallet } = useWalletContext();
    const dataNumber = parsePhoneNumberFromString(user?.phoneNumber || "");

    const form = useForm({
        resolver: zodResolver(cardPaymentSchema),
        defaultValues: {
            cardNumber: "",
            cardHolderName: "",
            cardExpirationDate: "",
            cardCvv: "",
            billingAddress: {
                country: dataNumber?.country || "US",
                address: "",
            },
            zipCode: "",
        },
    });
    const onSubmit = (data: z.infer<typeof cardPaymentSchema>) => {
        setStep("chooseStep", true);
        setWallet([
            ...wallet,
            {
                id: Date.now().toString(),
                name: "Test",
                number: data.cardNumber,
                images: `/icons/payments/${detectCardType(data.cardNumber) || "error"}.png`,
                isDefault: false,
            },
        ]);
        toast.success("Payment methods updated");
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex w-full flex-col gap-5">
                <HeadingSettings
                    title="Add a Credit card"
                    description="Update your card details here."
                    className="w-full border-b-[1px] border-bd-brown pb-5"
                >
                    <div className="flex flex-1 flex-row justify-end gap-2 self-end">
                        {PAYMENT_METHODS.map((item) => (
                            <div
                                key={item.id}
                                className={cn(
                                    "overflow-hidden rounded-sm border-[0.2px] border-bd-brown",
                                    item.background
                                )}
                            >
                                <div className="h-8 w-12">
                                    <ImagePreload
                                        width={90}
                                        height={60}
                                        className="h-full w-full"
                                        src={item.icon}
                                        alt={item.name}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </HeadingSettings>
                <div className="flex flex-col gap-2.5">
                    <SecurityChildItem
                        isActive
                        subTitle={() => (
                            <div className="whitespace-nowrap">
                                We use Stripe to process payments securely. Your
                                details stay private and protected.
                            </div>
                        )}
                        title="Your information is protected"
                        icon={
                            <div className="absolute left-1/2 top-1/2 w-[2.1875rem] -translate-x-1/2 -translate-y-1/2">
                                <IconStripe />
                            </div>
                        }
                    />
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="flex flex-col space-y-5">
                            <FormField
                                control={form.control}
                                name="cardNumber"
                                render={({ field }) => {
                                    const validCardType = detectCardType(
                                        field.value.replace(/[^\d]/g, "")
                                    );
                                    return (
                                        <FormItem className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                            <FormLabel
                                                className="font-semibold capitalize"
                                                htmlFor="cardNumber"
                                            >
                                                Card Number
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <div className="absolute left-2.5 top-1/2 z-10 h-6 w-[2.125rem] -translate-y-1/2 rounded-[0.25rem] border border-solid border-bd-surface">
                                                        <ImagePreload
                                                            width={60}
                                                            height={30}
                                                            src={`/icons/payments/${validCardType ? validCardType : "error"}.png`}
                                                            alt={validCardType}
                                                        />
                                                    </div>
                                                    <Input
                                                        {...field}
                                                        required
                                                        value={field.value
                                                            .replace(
                                                                /[^\d]/g,
                                                                ""
                                                            )
                                                            .replace(
                                                                /^(\d{16})\d+/,
                                                                "$1"
                                                            )
                                                            .replace(
                                                                /(\d{4})(?=\d)/g,
                                                                "$1 "
                                                            )}
                                                        className="!pl-[3.25rem]"
                                                        placeholder="Card Number"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="col-start-2 !mt-2" />
                                        </FormItem>
                                    );
                                }}
                            />
                            <FormField
                                control={form.control}
                                name="cardExpirationDate"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                        <FormLabel
                                            className="font-semibold capitalize"
                                            htmlFor="cardExpirationDate"
                                        >
                                            Expiration Date
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                required
                                                placeholder="Expiration Date (MM/YY)"
                                            />
                                        </FormControl>
                                        <FormMessage className="col-start-2 !mt-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cardCvv"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                        <FormLabel
                                            className="font-semibold capitalize"
                                            htmlFor="cardCvv"
                                        >
                                            CVV Code
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                required
                                                placeholder="CVV Code"
                                            />
                                        </FormControl>
                                        <FormMessage className="col-start-2 !mt-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="cardHolderName"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                        <FormLabel
                                            className="font-semibold capitalize"
                                            htmlFor="cardHolderName"
                                        >
                                            Cardholder Name
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                required
                                                placeholder="Cardholder Name"
                                            />
                                        </FormControl>
                                        <FormMessage className="col-start-2 !mt-2" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="billingAddress"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                        <FormLabel
                                            className="font-semibold capitalize"
                                            htmlFor="billingAddress"
                                        >
                                            Billing Address
                                        </FormLabel>
                                        <FormControl>
                                            <div className="flex w-full flex-row items-start gap-4 [&_>*]:flex-1">
                                                <SelectFlag<
                                                    z.infer<
                                                        typeof cardPaymentSchema
                                                    >
                                                >
                                                    field={{
                                                        ...field,

                                                        value:
                                                            field.value
                                                                ?.country || "",
                                                        onChange: (value) => {
                                                            field.onChange({
                                                                ...field.value,
                                                                country: value,
                                                            });
                                                        },
                                                    }}
                                                />
                                                <div className="space-y-0">
                                                    <Input
                                                        {...field}
                                                        value={
                                                            field.value.address
                                                        }
                                                        onChange={(e) => {
                                                            field.onChange({
                                                                ...field.value,
                                                                address:
                                                                    e.target
                                                                        .value,
                                                            });
                                                        }}
                                                        required
                                                        placeholder="Street Address"
                                                    />
                                                    <FormMessage
                                                        className="col-start-2 !mt-2"
                                                        field={"address"}
                                                    />
                                                </div>
                                            </div>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="zipCode"
                                render={({ field }) => (
                                    <FormItem className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                        <FormLabel
                                            className="font-semibold capitalize"
                                            htmlFor="zipCode"
                                        >
                                            ZIP Code
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                required
                                                placeholder="ZIP Code"
                                                className="placeholder:capitalize"
                                            />
                                        </FormControl>
                                        <FormMessage className="col-start-2 !mt-2" />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-[1fr_2.81fr] gap-x-12 space-y-0">
                                <div className="col-start-2 text-sm text-typo-soft">
                                    Your card may be charged to make sure
                                    it&apos;s valid. That amount will be
                                    automatically refunded. By adding a card,
                                    you have read and agree to our{" "}
                                    <div className="hover-line-active">
                                        terms
                                    </div>{" "}
                                    and{" "}
                                    <div className="hover-line-active">
                                        conditions
                                    </div>
                                    .
                                </div>
                            </div>

                            <div className="flex flex-row justify-end gap-3">
                                <Button
                                    variant={"outline"}
                                    onClick={() => {
                                        setStep("chooseStep", true);
                                    }}
                                >
                                    Back
                                </Button>
                                <Button type="submit" variant={"secondary"}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
const PAYMENT_METHODS = [
    {
        id: 1,
        name: "Visa",
        icon: "/icons/payments/visa.png",
        background: "bg-[#E7EBFA]",
    },
    {
        id: 2,
        name: "Credit card",
        icon: "/icons/payments/mastercard.png",
        background: "bg-[#FFEFE5]",
    },
    {
        id: 3,
        name: "Discover",
        icon: "/icons/payments/discover.png",
        background: "bg-[#FEF3E9]",
    },
    {
        id: 4,
        name: "Dinners Club",
        icon: "/icons/payments/diner_club.png",
        background: "bg-[#E5F0F5]",
    },
    {
        id: 5,
        name: "JCB",
        icon: "/icons/payments/jcb.png",
        background: "bg-[#E7EBFA]",
    },
    {
        id: 6,
        name: "American Express",
        icon: "/icons/payments/amex.png",
        background: "bg-[#E5F1FA]",
    },
    {
        id: 7,
        name: "UnionPay",
        icon: "/icons/payments/unionpay.png",
        background: "bg-[#E5F0F0]",
    },
];
