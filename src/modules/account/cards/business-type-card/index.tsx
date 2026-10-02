import { Button } from "@/components/ui/button";
import { InfoRow } from "@/components/shared/info-row";
import { stripe } from "@/types/stripe";

type TBusinessTypeCardProps = {
    mappedProfile: stripe.TAccountProfile;
    onEdit: () => void;
    status: string;
};

export function BusinessTypeCard({
    mappedProfile,
    onEdit,
}: TBusinessTypeCardProps) {
    // Prefer rawStripeData.company for extra Stripe fields
    const business =
        mappedProfile.rawStripeData?.business_profile ||
        ({} as stripe.TStripeAccountRaw["business_profile"]);

    return (
        <div className="isolate flex flex-col gap-4 border-t border-bd-main pt-8 tb:pt-6">
            <div className="z-[2] flex flex-col gap-2">
                <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                    Business details
                </h3>
                <p className="text-sm font-normal text-typo-soft">
                    Information about your business entity
                </p>
            </div>
            <div className="z-[1] bg-bg-sf4 p-4">
                <div className="mb-4 flex flex-row items-center justify-between">
                    <h4 className="text-sm font-semibold text-typo-primary">
                        {business.name || "Company Name"}
                    </h4>
                    <Button
                        variant="link"
                        className="h-auto p-0 font-medium text-typo-primary"
                        onClick={onEdit}
                    >
                        Update
                    </Button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4 tb:gap-4 mb:flex-col mb:gap-4">
                        {mappedProfile.businessType && (
                            <InfoRow
                                label="Business Type"
                                orientation="vertical"
                                className="flex-1"
                                value={
                                    <span className="capitalize">
                                        {mappedProfile.businessType}
                                    </span>
                                }
                            />
                        )}
                        {business.url && (
                            <InfoRow
                                label="Website"
                                orientation="vertical"
                                className="flex-1"
                                value={
                                    <a
                                        href={business.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover-line-active"
                                    >
                                        {business.url}
                                    </a>
                                }
                            />
                        )}
                    </div>
                    <div className="flex flex-row gap-4 tb:gap-4 mb:flex-col mb:gap-4">
                        {business.support_email && (
                            <InfoRow
                                label="Support Email"
                                orientation="vertical"
                                className="flex-1"
                                value={business.support_email}
                            />
                        )}
                        {business.support_phone && (
                            <InfoRow
                                label="Support Phone"
                                orientation="vertical"
                                className="flex-1"
                                value={business.support_phone}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
