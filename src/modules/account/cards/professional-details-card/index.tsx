import { InfoRow } from "@/components/shared/info-row";
import { Button } from "@/components/ui/button";
import { stripe } from "@/types/stripe";

type TProfessionalDetailsCardProps = {
    mappedProfile: stripe.TAccountProfile;
    onEdit: () => void;
    status: string;
};

export function ProfessionalDetailsCard({
    mappedProfile,
    onEdit,
}: TProfessionalDetailsCardProps) {
    return (
        <div className="isolate flex flex-col gap-4 border-t border-bd-main pt-8 tb:pt-6">
            <div className="z-[2] flex flex-col gap-2">
                <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                    Professional details
                </h3>
                <p className="text-sm font-normal text-typo-soft">
                    Information about your professional background and entity
                </p>
            </div>
            <div className="z-[1] bg-bg-sf4 p-4">
                <div className="mb-4 flex flex-row items-center justify-between">
                    <h4 className="text-sm font-semibold text-typo-primary">
                        Entity information
                    </h4>
                    <Button
                        variant="link"
                        className="h-auto p-0 font-medium text-typo-primary"
                        onClick={onEdit}
                    >
                        Update
                    </Button>
                </div>
                <div className="flex flex-row gap-4 tb:gap-4 mb:flex-col mb:gap-4">
                    <InfoRow
                        label="Name"
                        orientation="vertical"
                        className="flex-1"
                        value={mappedProfile.businessProfile?.name || "N/A"}
                    />
                    {mappedProfile.businessProfile?.url && (
                        <InfoRow
                            label="Website"
                            orientation="vertical"
                            className="flex-1"
                            value={
                                <a
                                    href={mappedProfile.businessProfile.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover-line-active"
                                >
                                    {mappedProfile.businessProfile.url}
                                </a>
                            }
                        />
                    )}
                </div>
                {mappedProfile.rawStripeData?.business_profile?.mcc && (
                    <div className="mt-4">
                        <InfoRow
                            label="MCC Code"
                            orientation="vertical"
                            value={
                                mappedProfile.rawStripeData.business_profile.mcc
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
