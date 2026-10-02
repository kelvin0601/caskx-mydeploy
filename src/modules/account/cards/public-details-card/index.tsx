import { Button } from "@/components/ui/button";
import { InfoRow } from "@/components/shared/info-row";
import { stripe } from "@/types/stripe";

type TPublicDetailsCardProps = {
    mappedProfile: Partial<stripe.TAccountProfile>;
    onEdit: () => void;
    status: string;
};

export function PublicDetailsCard({
    mappedProfile,
    onEdit,
}: TPublicDetailsCardProps) {
    const company = mappedProfile.company;
    const addressObj = company?.address;
    const address = addressObj
        ? [
              addressObj.line1,
              addressObj.line2,
              addressObj.city,
              addressObj.state,
              addressObj.postalCode,
              addressObj.country,
          ]
              .filter(Boolean)
              .join(", ")
        : "";

    return (
        <div className="isolate flex flex-col gap-4 border-t border-bd-main pt-6 tb:pt-6">
            <div className="z-[2] flex flex-col gap-2">
                <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                    Public details
                </h3>
                <p className="text-sm font-normal text-typo-soft">
                    Information used for customer support and compliance
                </p>
            </div>
            <div className="z-[1] bg-bg-sf4 p-4">
                <div className="mb-4 flex flex-row items-center justify-between">
                    <h4 className="text-sm font-semibold text-typo-primary">
                        Customer support information
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
                    {address && (
                        <InfoRow
                            label="Support address"
                            value={address}
                            orientation="vertical"
                            className="flex-1"
                        />
                    )}
                    {(mappedProfile.businessProfile?.supportPhone ||
                        company?.phone) && (
                        <InfoRow
                            label="Support phone"
                            orientation="vertical"
                            className="flex-1"
                            value={
                                mappedProfile.businessProfile?.supportPhone ||
                                company?.phone ||
                                ""
                            }
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
