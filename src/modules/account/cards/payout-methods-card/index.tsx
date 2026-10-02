import { Button } from "@/components/ui/button";
import { InfoRow } from "@/components/shared/info-row";
import { StatusBadge } from "@/components/shared/status-badge";
import { stripe } from "@/types/stripe";

type TPayoutMethodsCardProps = {
    mappedProfile: stripe.TAccountProfile;
    onEdit: () => void;
    status: string;
};

export function PayoutMethodsCard({
    mappedProfile,
    onEdit,
    status,
}: TPayoutMethodsCardProps) {
    const externalAccounts =
        mappedProfile.rawStripeData?.external_accounts?.data || [];

    return (
        <div className="isolate flex flex-col gap-4 border-t border-bd-main pt-8 tb:pt-6">
            <div className="z-[2] flex flex-row items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Payout methods
                    </h3>
                    <p className="text-sm font-normal text-typo-soft opacity-40">
                        Bank accounts where your payouts will be sent
                    </p>
                </div>
                <Button
                    variant="link"
                    className="h-auto shrink-0 p-0 font-medium text-typo-primary"
                    onClick={onEdit}
                >
                    Update
                </Button>
            </div>

            <div className="flex flex-col gap-4">
                {externalAccounts.length === 0 ? (
                    <div className="bg-bg-sf4 p-4 text-sm italic text-typo-soft opacity-60">
                        No payout methods connected.
                    </div>
                ) : (
                    externalAccounts.map((account) => (
                        <div key={account.id} className="z-[1] bg-bg-sf4 p-4">
                            <div className="mb-4 flex flex-row items-center justify-between">
                                <h4 className="text-sm font-semibold text-typo-primary">
                                    {account.bank_name}{" "}
                                    {account.default_for_currency &&
                                        "(Default)"}
                                </h4>
                                <StatusBadge status={account.status} />
                            </div>
                            <div className="flex flex-row gap-4 tb:gap-4 mb:flex-col mb:gap-4">
                                <InfoRow
                                    label="Account number"
                                    orientation="vertical"
                                    className="flex-1"
                                    value={`•••• ${account.last4}`}
                                />
                                <InfoRow
                                    label="Currency"
                                    orientation="vertical"
                                    className="flex-1"
                                    value={account.currency.toUpperCase()}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
