import IconBanking from "@/components/shared/icons/icon-banking";
import IconStripe from "@/components/shared/icons/icon-stripe";
import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PayoutMethod({
    bankName,
    last4,
    className,
}: {
    bankName?: string;
    last4?: string;
    className?: string;
}) {
    return (
        <section className={cn("flex flex-col gap-4", className)}>
            <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold leading-[1.2] text-typo-primary tb:text-base">
                    Payout method
                </h2>
                <p className="text-sm text-typo-soft">
                    Payout is issued once the buyer&apos;s payment is complete.
                </p>
            </div>
            <div className="flex min-h-[4.5rem] items-center gap-8 bg-bg-sf4 p-4">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-bg-sf4 p-2.5 text-icon-main">
                        <IconBanking />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col gap-1 whitespace-nowrap">
                        <p className="truncate text-base font-semibold text-typo-primary">
                            {bankName || "No payout method"}
                        </p>
                        {last4 ? (
                            <p className="truncate text-sm text-typo-note">
                                ****{last4}
                            </p>
                        ) : null}
                    </div>
                </div>
                <Button
                    asChild
                    variant="link"
                    className="h-auto shrink-0 p-0 text-sm font-medium"
                >
                    <LinkCustom href={ROUTE_PUBLIC.STRIPE_ONBOARDING}>
                        Edit
                    </LinkCustom>
                </Button>
            </div>
            <div className="flex items-start justify-center gap-2 text-sm text-typo-sub">
                <span className="h-5 w-[1.9375rem] shrink-0 text-[#635BFF] [&>svg]:h-full [&>svg]:w-full">
                    <IconStripe />
                </span>
                <span className="min-w-0 flex-1">
                    Payouts are securely processed by Stripe. Payouts are net of
                    a 5% processing fee.
                </span>
            </div>
        </section>
    );
}
