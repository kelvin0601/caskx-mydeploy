import IconStripe from "@/components/shared/icons/icon-stripe";

export default function StripeSecurityNotice() {
    return (
        <div className="flex min-w-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-normal leading-[1.5] text-typo-sub mb:whitespace-normal">
            <div className="flex h-5 w-[1.9375rem] shrink-0 items-center justify-center rounded-[2px] bg-[#EDEDFE] px-1 py-0.5 text-[#635BFF]">
                <IconStripe />
            </div>
            <span>Payments are securely processed by Stripe.</span>
        </div>
    );
}
