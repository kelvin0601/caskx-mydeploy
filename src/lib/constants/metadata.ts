import { Metadata } from "next";

export const PAGE_METADATA = {
    BUYING_BIDS: {
        title: "Buying - Bids",
        description: "View and manage your buying bids on Cask Exchange",
    },
    OFFER_DETAIL: {
        title: "Offer Detail",
        description: "View offer matching and payment details on Cask Exchange",
    },
    LISTING_DETAIL: {
        title: "Listing Detail",
        description:
            "View listing matching and payout details on Cask Exchange",
    },
    BUYING_PAYMENTS: {
        title: "Buying - Payments",
        description: "View and manage your buying payments on Cask Exchange",
    },
    SELLING_ASKS: {
        title: "Selling - Asks",
        description: "View and manage your selling asks on Cask Exchange",
    },
    CHECKOUT: {
        title: "Checkout",
        description: "Complete your cask purchase on Cask Exchange",
    },
    DISTILLERIES: {
        title: "Distilleries",
        description: "Browse whisky distilleries on Cask Exchange",
    },
    DISTILLERY_DETAIL: {
        title: "Distillery Detail",
        description:
            "Explore distillery details and available casks on Cask Exchange",
    },
    MARKETPLACE: {
        title: "Marketplace",
        description:
            "Browse and buy whisky casks on the Cask Exchange marketplace",
    },
    CASK_DETAIL: {
        title: "Cask Detail",
        description: "View whisky cask details and pricing on Cask Exchange",
    },
    PAYOUT: {
        title: "Payout",
        description: "View and manage your cask sale payout on Cask Exchange",
    },
    ACCOUNT_SETTINGS: {
        title: "Account Settings",
        description: "Manage your Cask Exchange account settings",
    },
    ACCOUNT: {
        title: "Account",
        description: "Manage your Cask Exchange account information",
    },
    WALLET: {
        title: "Wallet",
        description: "Manage your wallet and payment methods on Cask Exchange",
    },
    NOTIFICATIONS: {
        title: "Notifications",
        description: "View and manage your notifications on Cask Exchange",
    },
    SEARCH: {
        title: "Search Results",
        description: "Search for casks and distilleries on Cask Exchange",
    },
    RESOURCES: {
        title: "Resources",
        description:
            "Learn how to buy, sell, and manage whisky casks on Cask Exchange",
    },
    SECURITY: {
        title: "Security",
        description:
            "Manage your security settings and password on Cask Exchange",
    },
    KYC: {
        title: "KYC Verification",
        description: "Complete your identity verification on Cask Exchange",
    },
    ONBOARDING: {
        title: "Onboarding",
        description: "Complete your account onboarding on Cask Exchange",
    },
    TERMS_BUYER: {
        title: "Terms of Use - Buyer",
        description: "Buyer terms and conditions for Cask Exchange",
    },
    TERMS_SUPPLIER: {
        title: "Terms of Use - Supplier",
        description: "Supplier terms and conditions for Cask Exchange",
    },
    LOG_IN: {
        title: "Log In",
        description: "Log in to your Cask Exchange account",
    },
    SIGN_UP: {
        title: "Sign Up",
        description: "Create a new Cask Exchange account",
    },
    FORGOT_PASSWORD: {
        title: "Forgot Password",
        description: "Reset your Cask Exchange account password",
    },
    RESET_PASSWORD: {
        title: "Reset Password",
        description: "Set a new password for your Cask Exchange account",
    },
    VERIFY_USER: {
        title: "Verify Account",
        description: "Verify your Cask Exchange account",
    },
    ADMIN_LISTING_CASK: {
        title: "Admin - Cask Listing",
        description: "Manage cask listings on Cask Exchange",
    },
    ADMIN_LISTING_CASK_ADD: {
        title: "Admin - Add Cask",
        description: "Add a new cask listing on Cask Exchange",
    },
    ADMIN_LISTING_CASK_EDIT: {
        title: "Admin - Edit Cask",
        description: "Edit cask listing details on Cask Exchange",
    },
    ADMIN_LISTING_DISTILLERY: {
        title: "Admin - Distillery Listing",
        description: "Manage distillery listings on Cask Exchange",
    },
    ADMIN_LISTING_DISTILLERY_ADD: {
        title: "Admin - Add Distillery",
        description: "Add a new distillery on Cask Exchange",
    },
    ADMIN_LISTING_DISTILLERY_EDIT: {
        title: "Admin - Edit Distillery",
        description: "Edit distillery details on Cask Exchange",
    },
    ADMIN_LISTING_CLASSIFICATION: {
        title: "Admin - Classification",
        description: "Manage cask classifications on Cask Exchange",
    },
    ADMIN_LISTING_CASK_TYPE: {
        title: "Admin - Cask Types",
        description: "Manage cask types metadata on Cask Exchange",
    },
    ADMIN_METADATA_MANAGEMENT: {
        title: "Admin - Metadata Management",
        description:
            "Manage metadata used to classify and organize casks across the platform",
    },
    ADMIN_ORDERS_PAYMENTS: {
        title: "Admin - Payments",
        description: "Manage order payments on Cask Exchange",
    },
    ADMIN_ORDERS_PAYMENT_DETAIL: {
        title: "Admin - Payment Detail",
        description: "View payment details on Cask Exchange",
    },
    ADMIN_ORDERS_DOCUMENTS: {
        title: "Admin - Documents",
        description: "View and manage order documents on Cask Exchange",
    },
    ADMIN_ORDERS_PAYOUTS: {
        title: "Admin - Payouts",
        description: "Manage order payouts on Cask Exchange",
    },
    ADMIN_ORDERS_PAYOUT_DETAIL: {
        title: "Admin - Payout Detail",
        description: "View payout details on Cask Exchange",
    },
    DOCUSIGN_RETURN_ASK: {
        title: "Agreement Signed",
        description:
            "Your agreement has been signed successfully on Cask Exchange",
    },
    DOCUSIGN_RETURN_BID: {
        title: "Agreement Signed",
        description:
            "Your agreement has been signed successfully on Cask Exchange",
    },
    MOBILE_NOT_SUPPORTED: {
        title: "Mobile Not Supported",
        description: "Cask Exchange is not available on mobile devices",
    },
} as const satisfies Record<string, Metadata>;
