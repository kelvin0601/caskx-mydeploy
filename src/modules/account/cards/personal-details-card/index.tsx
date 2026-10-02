import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { InfoRow } from "@/components/shared/info-row";
import { stripe } from "@/types/stripe";

type TPersonalDetailsCardProps = {
    mappedProfile: stripe.TAccountProfile;
    onEdit: () => void;
    status: string;
    type: "company" | "individual";
};

export function PersonalDetailsCard({
    mappedProfile,
    onEdit,
    type,
}: TPersonalDetailsCardProps) {
    const data =
        type === "company" ? mappedProfile.company : mappedProfile.individual;
    const addressObj = data?.address || {};

    const address = [
        addressObj.line1,
        addressObj.line2,
        addressObj.city,
        addressObj.state,
        addressObj.postalCode || addressObj.postal_code,
        addressObj.country,
    ]
        .filter(Boolean)
        .join(", ");

    let dobString = "";
    if (type === "individual") {
        const rawIndividual = mappedProfile?.rawStripeData?.individual;
        if (
            rawIndividual &&
            typeof rawIndividual.dob === "object" &&
            typeof rawIndividual.dob.day === "number" &&
            typeof rawIndividual.dob.month === "number" &&
            typeof rawIndividual.dob.year === "number"
        ) {
            dobString = `${rawIndividual.dob.month}/${rawIndividual.dob.day}/${rawIndividual.dob.year}`;
        }
    }

    const title = type === "company" ? "Company details" : "Personal details";
    const description =
        type === "company"
            ? "Company information synced securely from Stripe"
            : "Personal information synced securely from Stripe";

    const name =
        type === "company"
            ? (data as stripe.TCompany)?.name || ""
            : ((data as stripe.TIndividual)?.firstName || "") +
              " " +
              ((data as stripe.TIndividual)?.lastName || "");

    return (
        <div className="isolate flex flex-col gap-4 border-t border-bd-main pt-8 tb:pt-6">
            <div className="z-[2] flex flex-col gap-2">
                <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                    {title}
                </h3>
                <p className="text-sm font-normal text-typo-soft">
                    {description}
                </p>
            </div>
            <div className="z-[1] bg-bg-sf4 p-4">
                <div className="mb-4 flex flex-row items-center justify-between">
                    <h4 className="text-sm font-semibold text-typo-primary">
                        {name}
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
                    {(type === "individual" || dobString) && (
                        <div className="flex flex-row gap-4 tb:gap-4 mb:flex-col mb:gap-4">
                            {type === "individual" &&
                                (data as stripe.TIndividual)?.email && (
                                    <InfoRow
                                        label="Email"
                                        orientation="vertical"
                                        className="flex-1"
                                        value={
                                            (data as stripe.TIndividual).email
                                        }
                                    />
                                )}
                            {dobString && (
                                <InfoRow
                                    label="Date of birth"
                                    orientation="vertical"
                                    className="flex-1"
                                    value={`${formatDateTime(dobString).dateOnly}`}
                                />
                            )}
                        </div>
                    )}
                    <div className="flex flex-row gap-4 tb:gap-4 mb:flex-col mb:gap-4">
                        {data?.phone && (
                            <InfoRow
                                label="Phone"
                                orientation="vertical"
                                className="flex-1"
                                value={data.phone}
                            />
                        )}
                        {address && (
                            <InfoRow
                                label="Address"
                                orientation="vertical"
                                className="flex-1"
                                value={address}
                            />
                        )}
                    </div>
                    {/* Structure row for company */}
                    {type === "company" &&
                        mappedProfile.rawStripeData?.company?.structure && (
                            <InfoRow
                                label="Structure"
                                orientation="vertical"
                                value={mappedProfile.rawStripeData.company.structure
                                    .split("_")
                                    .map(
                                        (s) =>
                                            s.charAt(0).toUpperCase() +
                                            s.slice(1)
                                    )
                                    .join(" ")}
                            />
                        )}
                </div>
            </div>
        </div>
    );
}
