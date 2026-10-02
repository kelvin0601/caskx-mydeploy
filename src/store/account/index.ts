// Store
export { useAccountStore } from "./accountStore";

// Context & Provider
export { AccountProvider, useAccount } from "./AccountProvider";

// Hooks
export {
    useAccountData,
    useAccountActions,
    useAccountModal,
    useAccountComputed,
} from "./hooks";

// Constants
export const KEY_FORM_MAP = {
    BUSINESS_INFO: "business-info" as const,
    PROFESSIONAL_DETAILS: "professional-details" as const,
    PUBLIC_DETAILS: "public-details" as const,
    INDIVIDUAL_DETAILS: "individual-details" as const,
    COMPANY_DETAILS: "company-details" as const,
    MANAGEMENT_DETAILS: "management-details" as const,
    REPRESENTATIVE_CONFIRM: "representative-confirm" as const,
    CREATE_PERSON: "create-person" as const,
};
export type TFormType = (typeof KEY_FORM_MAP)[keyof typeof KEY_FORM_MAP];
