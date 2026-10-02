import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { useSubmitAccountForm } from "@/hooks/useAccountMutations";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { convertDateFormat } from "@/lib/utils";
import stripeService from "@/services/stripe";
import { useBoundStore } from "@/store";
import { KEY_FORM_MAP, useAccount } from "@/store/account";
import { stripe } from "@/types/stripe";
import useResponsive from "@/hooks/useResponsive";
import BusinessInfoForm from "./BusinessInfoForm";
import CompanyDetailsForm from "./CompanyDetailsForm";
import PersonForm from "./PersonForm";
import PersonalDetailsForm from "./PersonalDetailsForm";
import ProfessionalDetailsForm from "./ProfessionalDetailsForm";
import PublicDetailsForm from "./PublicDetailsForm";
import {
    BusinessInfoFormValues,
    CompanyDetailsFormValues,
    CreatePersonFormValues,
    PersonalDetailsFormValues,
    ProfessionalDetailsFormValues,
    PublicDetailsFormValues,
} from "./schemas";
import { RepresentativeConfirm } from "./RepresentativeConfirm";

// Union type for all form values
type FormDataUnion =
    | BusinessInfoFormValues
    | ProfessionalDetailsFormValues
    | PublicDetailsFormValues
    | PersonalDetailsFormValues
    | CompanyDetailsFormValues
    | CreatePersonFormValues;

import { cn, cleanEmptyPayload } from "@/lib/utils";

export default function FormDialog() {
    const {
        isModalOpen: isOpen,
        editModal,
        isSubmitting,
        profile,
        persons,
        personCurrentId,
        closeModal,
        submitForm,
    } = useAccount();
    const { isDesktop, isTablet } = useResponsive();
    const { user } = useBoundStore();
    const personCurrent = persons.find(
        (person) => person.id === personCurrentId
    );

    const updatePersonFormMutation = useSubmitAccountForm<
        Partial<stripe.TPerson>
    >(
        (data) =>
            stripeService.updatePerson({
                accountId: (user?.stripeAccount?.id || profile?.id) as string,
                personId: personCurrent?.id as string,
                data: cleanEmptyPayload(data || {}),
            }),
        [STRIPE_KEYS.UPDATE_PERSON]
    );

    const createPersonMutation = useSubmitAccountForm<
        Partial<stripe.TCreatePerson>
    >(
        (data) => stripeService.createPerson(data || {}),
        [STRIPE_KEYS.CREATE_PERSON]
    );

    if (!profile) return null;

    // Generate form data based on modal type
    const getFormData = (): FormDataUnion => {
        switch (editModal) {
            case KEY_FORM_MAP.BUSINESS_INFO: {
                const business = profile.rawStripeData?.business_profile || {};
                return {
                    name: business.name || "",
                    email: business.support_email || "",
                    website: business.url || "",
                    mcc: business.mcc || "",
                    phone: business.support_phone || "",
                    businessType: profile.businessType || "individual",
                    country: profile.country || "",
                    businessStructure:
                        profile?.rawStripeData?.company?.structure || "",
                };
            }

            case KEY_FORM_MAP.PROFESSIONAL_DETAILS: {
                return {
                    name: profile.businessProfile?.name || "",
                    website: profile.businessProfile?.url || "",
                    mcc: profile.businessProfile?.mcc || "",
                    supportPhone: profile.businessProfile?.supportPhone || "",
                    supportEmail:
                        profile.businessProfile?.supportEmail ||
                        profile.individual?.email ||
                        "",
                };
            }

            case KEY_FORM_MAP.PUBLIC_DETAILS: {
                const address =
                    profile.company?.address ||
                    profile.individual?.address ||
                    {};
                return {
                    supportAddress1: address.line1 || "",
                    supportAddress2: address.line2 || "",
                    supportCountry: address.country || "",
                    supportPhone:
                        profile.businessProfile?.supportPhone ||
                        profile.company?.phone ||
                        profile.individual?.phone ||
                        "",
                    descriptor:
                        profile.rawStripeData?.settings?.payments
                            ?.statement_descriptor || "",
                };
            }

            case KEY_FORM_MAP.INDIVIDUAL_DETAILS: {
                const individual = profile.individual || {};
                const address = individual.address || {};
                let dob = "";
                if (profile?.rawStripeData?.individual) {
                    dob = `${profile?.rawStripeData?.individual?.dob.year}-${String(profile?.rawStripeData?.individual?.dob.month).padStart(2, "0")}-${String(profile?.rawStripeData?.individual?.dob.day).padStart(2, "0")}`;
                }
                return {
                    firstName: individual.firstName || "",
                    lastName: individual.lastName || "",
                    email: individual.email || "",
                    dob: dob,
                    ssnLast4: individual.ssnLast4 || "",
                    ssnLast4Provided:
                        !!profile.rawStripeData?.individual
                            ?.ssn_last_4_provided,
                    address1: address.line1 || "",
                    address2: address.line2 || "",
                    city: address.city || "",
                    state: address.state || "",
                    postalCode: address.postalCode || "",
                    country: address.country || "",
                    phone: individual.phone || "",
                };
            }

            case KEY_FORM_MAP.COMPANY_DETAILS: {
                const company = profile.company as stripe.TCompany;
                return {
                    name: company.name || "",
                    phone: company.phone || "",
                    taxId: company.taxId || "",
                    address1: company.address?.line1 || "",
                    address2: company.address?.line2 || "",
                    city: company.address?.city || "",
                    state: company.address?.state || "",
                    postalCode: company.address?.postalCode || "",
                    country: company.address?.country || "",
                };
            }

            case KEY_FORM_MAP.MANAGEMENT_DETAILS: {
                const individual = personCurrent as stripe.TPerson | undefined;
                const address = (individual?.address ||
                    {}) as stripe.TPerson["address"];
                let dob = "";
                if (personCurrent) {
                    if (typeof personCurrent?.dob === "string") {
                        dob = convertDateFormat(personCurrent.dob);
                    } else if (personCurrent?.dob) {
                        dob = `${personCurrent?.dob?.year}-${String(personCurrent?.dob?.month).padStart(2, "0")}-${String(personCurrent?.dob?.day).padStart(2, "0")}`;
                    }
                }
                return {
                    firstName: individual?.first_name || "",
                    lastName: individual?.last_name || "",
                    email: individual?.email || "",
                    phone: individual?.phone || "",
                    dateOfBirth: dob,
                    ssnLast4: "", // SSN not returned by Stripe for security
                    addressLine1: address?.line1 || "",
                    addressLine2: address?.line2 || "",
                    city: address?.city || "",
                    state: address?.state || "",
                    postalCode: address?.postal_code || "",
                    country: address?.country || "",
                    relationshipRepresentative:
                        individual?.relationship?.representative || false,
                    relationshipExecutive:
                        individual?.relationship?.executive || false,
                    relationshipDirector:
                        individual?.relationship?.director || false,
                    relationshipOwner: individual?.relationship?.owner || false,
                    relationshipPercentOwnership:
                        individual?.relationship?.percent_ownership ||
                        undefined,
                    relationshipTitle: individual?.relationship?.title || "",
                };
            }

            default:
                return {};
        }
    };

    const getDialogContent = () => {
        const formData = getFormData();

        switch (editModal) {
            case KEY_FORM_MAP.BUSINESS_INFO:
                return {
                    title: "Edit Account Information",
                    description:
                        "Tell us a few details about how you earn or collect money with Cask Exchange.",
                    form: (
                        <BusinessInfoForm
                            onSubmit={submitForm}
                            onClose={closeModal}
                            isSubmitting={isSubmitting}
                            data={formData as BusinessInfoFormValues}
                        />
                    ),
                };

            case KEY_FORM_MAP.PROFESSIONAL_DETAILS:
                return {
                    title: "Edit Professional Details",
                    description: "Update your professional details",
                    form: (
                        <ProfessionalDetailsForm
                            onSubmit={submitForm}
                            onClose={closeModal}
                            isSubmitting={isSubmitting}
                            data={formData as ProfessionalDetailsFormValues}
                        />
                    ),
                };

            case KEY_FORM_MAP.PUBLIC_DETAILS:
                return {
                    title: "Edit Public Details",
                    description: "Update your public details",
                    form: (
                        <PublicDetailsForm
                            onSubmit={submitForm}
                            onClose={closeModal}
                            isSubmitting={isSubmitting}
                            data={formData as PublicDetailsFormValues}
                        />
                    ),
                };

            case KEY_FORM_MAP.INDIVIDUAL_DETAILS:
                return {
                    title: "Edit Personal Details",
                    description: "Update your personal information",
                    form: (
                        <PersonalDetailsForm
                            onSubmit={submitForm}
                            onClose={closeModal}
                            isSubmitting={isSubmitting}
                            data={formData as PersonalDetailsFormValues}
                        />
                    ),
                };

            case KEY_FORM_MAP.COMPANY_DETAILS:
                return {
                    title: "Edit Company Details",
                    description: "Tell us a few details about your company.",
                    form: (
                        <CompanyDetailsForm
                            onSubmit={async (data) => {
                                const cleanedData = cleanEmptyPayload({
                                    company: {
                                        name: data.name,
                                        phone: data.phone,
                                        taxId: data.taxId,
                                        address: {
                                            line1: data.address1,
                                            line2: data.address2,
                                            city: data.city,
                                            state: data.state,
                                            postalCode: data.postalCode,
                                            country: data.country,
                                        } as stripe.TPersonAddress,
                                    } as stripe.TCompany,
                                });
                                await stripeService.updateAccountStripe(
                                    cleanedData
                                );
                                closeModal();
                            }}
                            onClose={closeModal}
                            isSubmitting={isSubmitting}
                            data={formData as CompanyDetailsFormValues}
                        />
                    ),
                };
            case KEY_FORM_MAP.MANAGEMENT_DETAILS:
                return {
                    title: "Edit Management Details",
                    description:
                        "Update the details associated with this individual",
                    form: (
                        <PersonForm
                            isEditMode
                            onSubmit={async (data) => {
                                const relationship: Partial<
                                    stripe.TCreatePerson["relationship"]
                                > = {
                                    executive: data.relationshipExecutive,
                                    representative:
                                        data.relationshipRepresentative,
                                    title: data.relationshipTitle || "",
                                };
                                if (data.relationshipOwner) {
                                    relationship.owner = true as const;
                                    relationship.percentOwnership =
                                        data.relationshipPercentOwnership ?? 0;
                                }
                                await updatePersonFormMutation.mutateAsync({
                                    formData: {
                                        first_name: data.firstName,
                                        last_name: data.lastName,
                                        email: data.email,
                                        phone: data.phone,
                                        dob: data.dateOfBirth,
                                        ssn_last_4: data.ssnLast4,
                                        address: {
                                            line1: data.addressLine1,
                                            line2: data.addressLine2,
                                            city: data.city,
                                            state: data.state,
                                            postal_code: data.postalCode,
                                            country: data.country,
                                        } as stripe.TPerson["address"],
                                        relationship:
                                            relationship as stripe.TPerson["relationship"],
                                    },
                                });
                                closeModal();
                            }}
                            onClose={closeModal}
                            isSubmitting={updatePersonFormMutation.isPending}
                            data={formData as CreatePersonFormValues}
                        />
                    ),
                };
            case KEY_FORM_MAP.REPRESENTATIVE_CONFIRM:
                return {
                    title: "Update account representative?",
                    description:
                        "Your organization will need to <b>verify the new account representative within 7 days</b>, otherwise payouts may be paused.",
                    form: <RepresentativeConfirm />,
                };
            case KEY_FORM_MAP.CREATE_PERSON:
                return {
                    title: "Add representative",
                    description:
                        "It's required to add any individual who is on the governing board, owns 25% or more of the company or otherwise has significant management control of the company. Learn more about what to do if another company has 25% or more ownership of the company.",
                    form: (
                        <PersonForm
                            isEditMode={false}
                            onSubmit={async (data) => {
                                const relationship: Partial<
                                    stripe.TCreatePerson["relationship"]
                                > = {
                                    executive: data.relationshipExecutive,
                                    representative:
                                        data.relationshipRepresentative,
                                    title: data.relationshipTitle || "",
                                };
                                if (data.relationshipOwner) {
                                    relationship.owner = true as const;
                                    relationship.percentOwnership =
                                        data.relationshipPercentOwnership ?? 0;
                                }

                                const rawPayload = {
                                    firstName: data.firstName,
                                    lastName: data.lastName,
                                    email: data.email,
                                    phone: data.phone,
                                    dateOfBirth: data.dateOfBirth,
                                    ssnLast4: data.ssnLast4,
                                    address: {
                                        line1: data.addressLine1,
                                        line2: data.addressLine2,
                                        city: data.city,
                                        state: data.state,
                                        postalCode: data.postalCode,
                                        country: data.country,
                                    },
                                    relationship,
                                };

                                const cleanedPayload =
                                    cleanEmptyPayload(rawPayload);

                                await createPersonMutation.mutateAsync({
                                    formData:
                                        cleanedPayload as Partial<stripe.TCreatePerson>,
                                });
                                closeModal();
                            }}
                            onClose={closeModal}
                            isSubmitting={createPersonMutation.isPending}
                        />
                    ),
                };
            default:
                return null;
        }
    };

    const content = getDialogContent();
    if (!content) return null;

    return isDesktop || isTablet ? (
        <Dialog
            open={isOpen}
            onOpenChange={(val) => {
                if (!val) closeModal();
            }}
        >
            <DialogContent className="max-h-[80vh] max-w-[32.5rem] mb:max-w-[calc(100%-2rem)] mb:!border-none">
                <DialogHeader className="items-center gap-2 border-none pb-8 text-center">
                    <DialogTitle className="mb-2 text-center font-reckless text-xl font-medium">
                        {content.title}
                    </DialogTitle>
                    <DialogDescription
                        className="text-center"
                        dangerouslySetInnerHTML={{
                            __html: content.description,
                        }}
                    />
                </DialogHeader>
                {content.form}
            </DialogContent>
        </Dialog>
    ) : (
        <Drawer
            key="account-form-mobile"
            direction="bottom"
            open={isOpen}
            onOpenChange={(val) => {
                if (!val) closeModal();
            }}
        >
            <DrawerContent className="max-h-[80dvh]">
                <DrawerHeader className="items-center gap-2 border-none pb-8 text-center mb:pb-6">
                    <DrawerTitle className="font-reckless text-xl font-medium mb:text-lg">
                        {content.title}
                    </DrawerTitle>
                    <DrawerDescription
                        className="text-center"
                        dangerouslySetInnerHTML={{
                            __html: content.description,
                        }}
                    />
                </DrawerHeader>
                {content.form}
            </DrawerContent>
        </Drawer>
    );
}
