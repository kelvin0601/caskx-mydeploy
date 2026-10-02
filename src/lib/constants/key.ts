// Authentication & Security Keys
export const AUTH_KEYS = {
    SIGNIN: "signin",
    SIGNUP: "signup",
    REFRESH_TOKEN: "refresh-token",
    UPDATE_SESSION: "update-session",
    LOGOUT: "signout",
    WHOAMI: "whoami",
    VERIFY: "verify-user",
    VERIFY_PASSWORD: "verify-password",
    FORGOT_PASSWORD: "forgot-password",
    RESET_PASSWORD: "reset-password",
    UPDATE_PASSWORD: "update-password",
    CHANGE_PASSWORD: "change-password",
    CHECK_RESET_PASSWORD: "check-reset-password",
    RESEND_EMAIL: "resend-verification",
} as const;

// Two-Factor Authentication Keys
export const TWO_FA_KEYS = {
    STATUS: "status",
    ENABLE_GOOGLE_AUTH: "enable-google-auth",
    DISABLE_GOOGLE_AUTH: "disable",
    VERIFY_GOOGLE_AUTH: "verify",
    VERIFY_2FA: "verify-2fa",
    VERIFY_ACCOUNT_WITH_2FA: "verify-2fa",
    REGENERATE_RECOVERY_CODES: "regenerate",
} as const;

// Device Management Keys
export const DEVICE_KEYS = {
    GET_DEVICES: "get-devices",
    ADD_DEVICES: "add-devices",
    UPDATE_DEVICE: "update-device",
} as const;

// SMS Authentication Keys
export const SMS_KEYS = {
    SMS: "sms",
    SMS_VERIFY: "verify",
    SMS_VERIFY_2FA: "verify-sms-2fa",
    SMS_ENABLE: "enable",
    SMS_DISABLE: "disable",
    SMS_START_INIT: "start-challenge",
    INITIATE_SMS_2FA: "initiate-2fa-method",
} as const;

// Security Session Keys
export const SECURITY_KEYS = {
    GET_SECURITY_SESSION: "sessions",
    REVOKE_SESSION: "sessions/revoke",
    REVOKE_ALL_SESSION: "sessions/revoke-all",
    LOGOUT_CURRENT_SESSION: "logout",
    EMERGENCY_LOGOUT: "emergency-logout",
} as const;

// Cask Related Keys
export const CASK_KEYS = {
    GET_CASK: "get-casks",
    LIST_CASK: "list-cask",
    SEARCH_CASK: "search",
    SIMILAR_CASKS: "similar",
    SORT_CASK: "sort",
    FEATURED_CASK: "featured",
    GROWTH_CASK: "growth",
    HIGH_VOLTAGE_CASK: "high-voltage",
    RECENTLY_VIEWED: "recently-viewed",
    LISTING: "listing",
    CASK_DETAIL: "cask-detail",
    CASK_ADMIN_DETAIL: "cask-admin-detail",
    LISTING_PAGE: "casks-listing",
    INCREASE_VIEW_COUNT: "increase-view-count",
    REORDER_CASKS: "casks/reorder",
    BID_SUGGESTION: "suggested",
    BID_MARKET_DATA: "market-data",
} as const;
export const CASK_MASTER_KEYS = {
    CASK_MASTER_DETAIL: "cask-master-detail",
    SIMILAR_CASKS: "cask-master-similar",
    RECENTLY_VIEWED: "recently-viewed",
} as const;

export const KEY_DISCOUNT = {
    APPLY_DISCOUNT: "apply",
    CONFIRM_DISCOUNT: "confirm",
    ACTIVE_DISCOUNT: "active",
    RESERVATION_DISCOUNT: "reservations",
    HEALTH_MAP_DISCOUNT: "health",
    DELETE_DISCOUNT: "remove",
} as const;
// Filter Keys
export const FILTER_KEYS = {
    CASK_RANGE: "ranges",
    CASK_TYPE: "cask-types",
    DISTILLERIES: "distilleries-list",
    DISTILLERIES_CASKS: "distilleries",
} as const;

// Distillery Keys
export const DISTILLERY_KEYS = {
    LIST: "list",
    LISTING: "listing",
    TOP_RANKED: "top-ranked",
    TOP_DISTILLERIES: "top-distilleries",
    DETAIL: "distillery-detail",
    RELATED: "related",
    COUNTRIES: "countries",
    REGIONS: "regions",
    COMPANIES: "companies",
    GET_DISTILLERIES: "get-distilleries",
    STATUSES: "statuses",
} as const;

// Cask Type Keys
export const CASK_TYPE_KEYS = {
    LIST: "list",
    LISTING: "listing",
} as const;

// Classification Keys
export const CLASSIFICATION_KEYS = {
    LIST: "list",
    LISTING: "listing",
    GET_CLASSIFICATIONS: "get-classifications",
    BROWSE: "browse",
} as const;
export const SOCKET_KEYS = {
    MARKET: "market",
} as const;

// Region Keys
export const REGION_KEYS = {
    LIST: "list",
    GET_REGIONS: "regions",
} as const;

// License Keys
export const LICENSE_KEYS = {
    TTB_LICENSE_TYPES: "ttb-license-types",
} as const;

// OCR Keys
export const OCR_KEYS = {
    ID_DOCUMENT: "id-document",
} as const;

// Stripe Keys
export const STRIPE_KEYS = {
    ACCOUNT: "accounts",
    ACCOUNT_ONBOARDING: "embedded-onboarding",
    ACCOUNT_ONBOARDING_STATUS: "status",
    ACCOUNT_REFRESH: "refresh",
    PROFILE: "profile",
    PROFILE_DETAILS: "profile-details",
    PAYOUTS: "payouts",
    CREATE_ACCOUNT: "create-account",
    GET_PERSON: "persons",
    UPDATE_PERSON: "persons",
    REMOVE_PERSON: "persons",
    CREATE_PERSON: "persons",
} as const;

// App Keys
export const APP_KEYS = {
    APP: "app",
} as const;

// Checkout Keys
export const CHECKOUT_KEYS = {
    GET_CHECKOUT: "checkout",
    CREATE_SESSION: "create-session",
    GET_STATUS_SESSION: "session",
    CREATE_DEPOSIT_SECRET: "deposit-payment",
    CONFIRM_DEPOSIT_PAYMENT: "confirm-deposit",
    SIGN_AGREEMENT: "sign-agreement",
    REGENERATE_AGREEMENT: "regenerate-agreement",
    CREATE_INVOICE_SECRET: "invoice-payment",
    CONFIRM_INVOICE_PAYMENT: "confirm-invoice",
    COMPLETE_TRANSFER: "complete-transfer",
    GET_ADMIN_SESSIONS: "checkout-sessions",
    ADMIN_MANUAL_PAYMENT: "admin/manual-payment",
    ADMIN_MANUAL_PAYMENT_APPROVE: "approve",
    ADMIN_MANUAL_PAYMENT_REJECT: "reject",
    GET_INVOICE_DOWNLOAD_URL: "invoice",
    INVOICE_RECEIPT: "invoice-receipt",
    GET_PAYMENT_PROOF_DOWNLOAD_URL: "manual-payment-evidence",
    UPLOAD_MANUAL_PAYMENT_EVIDENCE: "manual-payment-evidence",
    RESUBMIT_MANUAL_PAYMENT_EVIDENCE: "manual-payment-evidence/resubmit",
    ADMIN_TRANSFER_OWNERSHIP: "ownership-transfer",
    OWNERSHIP_TRANSFER_DOCUMENT: "ownership-transfer-document",
    SELLER_AGREEMENT_APPROVE: "seller-agreement/approve",
    SELLER_AGREEMENT_REJECT: "seller-agreement/reject",
    BUYER_AGREEMENT_APPROVE: "buyer-agreement/approve",
    BUYER_AGREEMENT_REJECT: "buyer-agreement/reject",
    BUYER_AGREEMENT_REQUEST_UPDATE: "buyer-agreement/request-update",
    SELLER_AGREEMENT_REQUEST_UPDATE: "seller-agreement/request-update",
    GET_SESSION_DOCUMENTS: "checkout-session-documents",
} as const;

export const SELLER_KEYS = {
    ACKNOWLEDGE: "acknowledge",
    SUMMARY: "summary",
    TRIGGER: "trigger-payout",
};

export const KEY_BID = {
    BID_DETAIL: "detail",
    BID_MARKET_DATA: "market-data",
    BID_SUGGESTION: "suggested",
    BID_VALIDATE: "validate",
    BID_CREATE: "create",
    BID_LIST: "list",
    BID_MY_BIDS: "my-bids",
    BID_HIGHEST: "highest",
    BID_UPDATE: "update",
    BID_CANCEL: "cancel",
    BID_CALCULATE_PRICE: "calculate-checkout",
    BID_INVENTORY: "quantity",
    BID_MATCHING_ASKS: "matching-asks",
    BID_TRANSACTIONS: "transactions",
} as const;

export const KEY_ASK = {
    ASK_LIST: "list",
    ASK_MY_ASKS: "my-asks",
    ASK_STATUS_COUNT: "status-counts",
    ASK_LOWEST: "lowest",
    ASK_HIGHEST: "highest",
    ASK_CREATE: "create",
    ASK_UPDATE: "update",
    ASK_CANCEL: "cancel",
    ASK_ANALYST: "analytics",
    ASK_CALCULATE_PRICE: "calculate-checkout",
    ASK_SUGGEST: "suggested",
    ASK_VALIDATE_PRICE: "validate",
    ASK_INVENTORY: "quantity",
    ASK_MATCHING_BIDS: "matching-bids",
} as const;

export const KEY_TRADING = {
    MARKET_ORDERS: "market-orders",
    BUY_NOW: "buy-now",
    SELL_NOW: "sell-now",
    PLACE_BID: "place-bid",
    PLACE_ASK: "place-ask",
    MARKET_DATA: "market-data",
    CANCEL_ORDERS: "cancel-orders",
    CONFIRM_PRICE: "confirm-price",
    CURRENT_PRICE: "current-prices",
} as const;

export const KEY_MARKET_DATA = {
    VIEW: "view",
    CASK: "cask",
    BEST_INVESTMENTS: "best-investments",
    ASK_HIGHEST: "ask-highest",
    BID_HIGHEST: "bid-highest",
    BIDS: "bids-view",
    ASKS: "asks-view",
    SALES: "sales",
    MARKET_DATA: "market-data-cask",
} as const;

export const KEY_OWNERSHIP = {
    USER: "user",
    USER_SUMMARY: "user/summary",
    CASK: "cask",
    CREATE: "create",
    TRANSFER: "transfer",
} as const;

export const KEY_TRANSACTIONS = {
    LIST: "list",
    MY_TRANSACTIONS: "my-transactions",
    ACCEPT_BID: "accept-bid",
    ACCEPT_ASK: "accept-ask",
    DIRECT_SALE: "direct-sale",
    HISTORY_TRANSACTIONS: "history",
    ONGOING_TRANSACTIONS: "ongoing",
    ASKS: "asks",
    CHECKOUT_SESSION: "checkout-session",
    CHECKOUT_SESSIONS: "checkout-sessions",
    DOCUMENTS: "documents",
} as const;

export const KEY_PAYOUT = {
    GET_ADMIN_SETTLEMENTS: "settlements",
};

export const KEY_DOCUSIGN = {
    GET_SELLER_AGREEMENT_LINK: "seller-agreement",
    GET_BUYER_AGREEMENT_LINK: "buyer-agreement",
    GET_DOCUMENTS: "documents",
} as const;

export const NOTIFICATION_PREFERENCE_KEYS = {
    GET_PREFERENCES: "notification-preferences",
    UPDATE_CHANNEL: "update-channel",
    UPDATE_THRESHOLD: "update-threshold",
} as const;

export const NOTIFICATION_KEYS = {
    ROOT: "notifications",
    UNREAD_COUNT: "unread-count",
    PREVIEW: "preview",
    LIST: "list",
} as const;
