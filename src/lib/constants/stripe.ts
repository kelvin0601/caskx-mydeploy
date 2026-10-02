import { AppearanceOptions } from "@stripe/connect-js";
import { convertRemToPx } from "../utils";

export const STRIPE_APPEARANCE: AppearanceOptions = {
    variables: {
        actionPrimaryTextDecorationStyle: "solid",
        overlayBackdropColor: "rgba(0,0,0,0.5)",
        colorPrimary: "#22262A",
        colorText: "#22262A",
        colorBackground: "transparent",
        buttonPrimaryColorBackground: "#090909",
        buttonPrimaryColorBorder: "#CBD2D6",
        buttonPrimaryColorText: "#FFFFFF",
        buttonSecondaryColorBackground: "#FFFFFF",
        buttonSecondaryColorBorder: "#CBD2D6",
        buttonSecondaryColorText: "#22262A",
        colorSecondaryText: "#3F444B",
        actionPrimaryColorText: "#22262A",
        actionPrimaryTextDecorationLine: "underline",
        actionPrimaryTextDecorationColor: "#22262A",
        colorDanger: "#CF3716",
        badgeSuccessColorBorder: "#ABEFC6",
        badgeSuccessColorText: "#17B26A",
        offsetBackgroundColor: "#F4F6F7",
        badgeNeutralColorBackground: "#F4F6F7",
        badgeNeutralColorBorder: "#CBD2D6",
        badgeNeutralColorText: "#3F444B",
        colorBorder: "#CF3716",
        // @ts-expect-error - inputColorBorder is not defined in standard Stripe Theme variables but accepted at runtime
        inputColorBorder: "transparent",
        inputBoxShadow: "transparent !important",
        labelSpacing: `${convertRemToPx(0.375)}px`,
        inputFocusColorBorder: "#918573",
        inputFocusBoxShadow: "none",
        badgeSuccessColorBackground: "#ECFDF3",
        fontFamily: "Inter, sans-serif",
        borderRadius: `0px`,
        buttonBorderRadius: `0px`,
        fontSizeBase: `${convertRemToPx(1)}px`,
        headingXlFontSize: "1.5rem",
        headingXlFontWeight: "600",
        headingXlTextTransform: "none",
        headingLgFontSize: "1.5rem",
        headingLgFontWeight: "500",
        headingMdFontSize: "1.25rem",
        headingMdFontWeight: "500",
        headingSmFontSize: "0.875rem",
        headingSmFontWeight: "500",
        headingXsFontSize: "0.875rem",
        headingXsFontWeight: "500",
        bodyMdFontSize: "0.875rem",
        bodyMdFontWeight: "400",
        bodySmFontSize: "0.875rem",
        bodySmFontWeight: "400",
        labelMdFontSize: "0.75rem",
        labelMdFontWeight: "300",
        labelSmFontSize: "0.75rem",
        labelSmFontWeight: "400",
        labelMdTextTransform: "none",
        labelSmTextTransform: "none",
    },
    rules: {
        ".Input": {
            backgroundColor: "#0e07020a",
        },
        ".Block": {
            border: "none",
            boxShadow: "none",
        },
        ".Input--invalid": {
            boxShadow: "none",
        },
        ".AccordionItem": {
            border: "none",
            boxShadow: "none",
        },
        ".AccordionItem--selected": {
            background: "transparent",
        },
        ".p-AccordionPanelContents": {
            padding: `${convertRemToPx(1)}px`,
        },
    },
    overlays: "dialog",
};

export const DATA_BUSINESS_TYPE = [
    {
        value: "individual",
        label: "Individual",
    },
    {
        value: "company",
        label: "Company",
    },
    {
        value: "nonprofit",
        label: "Non profit",
    },
];

export const DATA_BUSINESS_STRUCTURE_COMPANY = [
    {
        value: "government_instrumentality",
        label: "Government Instrumentality",
    },
    {
        value: "governmental_unit",
        label: "Governmental Unit",
    },

    {
        value: "incorporated_non_profit",
        label: "Incorporated Non-profit",
    },
    {
        value: "registered_charity",
        label: "Registered Charity",
    },
    {
        value: "incorporated_partnership",
        label: "Incorporated Partnership",
    },
    {
        value: "limited_liability_partnership",
        label: "Limited Liability Partnership",
    },
    {
        value: "multi_member_llc",
        label: "Multi-member LLC",
    },
    {
        value: "private_company",
        label: "Private Company",
    },
    {
        value: "private_corporation",
        label: "Private Corporation",
    },
    {
        value: "private_partnership",
        label: "Private Partnership",
    },
    {
        value: "public_company",
        label: "Public Company",
    },
    {
        value: "public_corporation",
        label: "Public Corporation",
    },
    {
        value: "public_partnership",
        label: "Public Partnership",
    },
    {
        value: "single_member_llc",
        label: "Single-member LLC",
    },
    {
        value: "sole_proprietorship",
        label: "Sole Proprietorship",
    },
    {
        value: "tax_exempt_government_instrumentality",
        label: "Tax Exempt Government Instrumentality",
    },
    {
        value: "unincorporated_association",
        label: "Unincorporated Association",
    },
    {
        value: "unincorporated_non_profit",
        label: "Unincorporated Non-profit",
    },
    {
        value: "unincorporated_partnership",
        label: "Unincorporated Partnership",
    },
    {
        value: "free_zone_llc",
        label: "Free Zone LLC",
    },
    {
        value: "sole_establishment",
        label: "Sole Establishment",
    },
    {
        value: "free_zone_establishment",
        label: "Free Zone Establishment",
    },
    {
        value: "llc",
        label: "LLC",
    },
];

// Sample data structure to map business types to compatible countries
const BUSINESS_STRUCTURE_COUNTRY_MAPPING = {
    // governmental_unit: ["UK"],
    // government_instrumentality: ["CA"],
    // incorporated_non_profit: ["CA", "UK", "AU"],
    // registered_charity: ["UK", "CA", "AU"],
    // incorporated_partnership: ["CA"],
    // limited_liability_partnership: ["UK", "IN"],
    // private_company: ["UK", "DE", "NL", "AR"],

    multi_member_llc: ["US", "UAE"],
    private_corporation: ["US", "CA", "AU"],
    private_partnership: ["US", "UK", "DE"],
    single_member_llc: ["US", "UAE"],
    sole_proprietorship: ["US", "UK", "CA", "AU", "DE", "NL"],

    // public_company: ["UK", "CA", "AU"],
    // public_corporation: ["CA", "UK"],
    // public_partnership: ["UK"],
    // tax_exempt_government_instrumentality: ["CA"],
    // unincorporated_association: ["UK", "AU"],
    // unincorporated_non_profit: ["UK", "CA"],
    // unincorporated_partnership: ["UK", "DE"],
    // free_zone_llc: ["UAE", "MU"],
    // sole_establishment: ["UAE"],
    // free_zone_establishment: ["UAE"],
    // llc: ["UAE", "MX"],
};

export const handleGetDataWithCountry = (country: string) => {
    return DATA_BUSINESS_STRUCTURE_COMPANY.filter((item) => {
        const data =
            BUSINESS_STRUCTURE_COUNTRY_MAPPING[
                item.value as keyof typeof BUSINESS_STRUCTURE_COUNTRY_MAPPING
            ];
        return data?.includes(country.toUpperCase());
    });
};

export const STRIPE_REQUIREMENT_LABELS: Record<string, string> = {
    "individual.verification.document": "Identity Document",
    "individual.verification.additional_document": "Additional Document",
    "company.verification.document": "Company Verification Document",
    "tos_acceptance.date": "Terms of Service Acceptance",
    "tos_acceptance.ip": "Terms of Service IP",
    "business_profile.mcc": "MCC Code",
    "business_profile.url": "Business Website",
    "business_profile.support_email": "Support Email",
    "business_profile.support_phone": "Support Phone",
    external_account: "Bank Account/Payout Method",
    "individual.dob.day": "Date of Birth (Day)",
    "individual.dob.month": "Date of Birth (Month)",
    "individual.dob.year": "Date of Birth (Year)",
    "individual.address.city": "Home Address (City)",
    "individual.address.line1": "Home Address (Line 1)",
    "individual.address.postal_code": "Home Address (Postal Code)",
    "individual.address.state": "Home Address (State)",
    "company.address.city": "Company Address (City)",
    "company.address.line1": "Company Address (Line 1)",
    "company.address.postal_code": "Company Address (Postal Code)",
    "company.address.state": "Company Address (State)",
    "company.name": "Company Name",
    "company.tax_id": "Company Tax ID",
    "company.phone": "Company Phone",
    "individual.email": "Email Address",
    "individual.first_name": "First Name",
    "individual.last_name": "Last Name",
    "individual.phone": "Phone Number",
    "individual.id_number": "ID Number / SSN",
    "relationship.title": "Job Title",
    "relationship.executive": "Executive Role",
    "relationship.director": "Director Role",
    "relationship.owner": "Owner Role",
    "relationship.representative": "Account Representative",
};
