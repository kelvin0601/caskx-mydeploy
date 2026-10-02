const ROUTE_AUTH = {
    LOGIN: "/log-in",
    SIGNUP: "/sign-up",
    VERIFY: "/verify-user",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    LOGOUT: "/log-out",
};
const ROUTE_AUTH_EXCLUDE = [
    ROUTE_AUTH.VERIFY,
    // ROUTE_AUTH.FORGOT_PASSWORD
];
const ROUTE_PUBLIC = {
    HOME: "/",
    NOT_FOUND: "/404",
    MOBILE_NOT_SUPPORT: "/mobile-not-supported",
    CASK: "/cask",
    CASK_DETAILS: "/marketplace",
    CASK_CREATE: "/cask/create",
    CASK_EDIT: "/cask/edit/:id",
    DISTILLERY: "/distillery",
    STRIPE_ONBOARDING: "/settings/onboarding",
    SETTINGS: "/settings",
    SETTINGS_PROFILE: "/settings/personal-details",
    SETTINGS_NOTIFICATION: "/settings/notifications",
    SETTINGS_SECURITY: "/settings/security",
    SETTINGS_ACCOUNT: "/settings/account",
    SETTINGS_WALLET: "/settings/wallet",
    NOTIFICATIONS: "/notifications",
    PROFILE: "/profile",
    PROFILE_OFFER: "/profile/offer",
    PROFILE_LISTINGS: "/profile/listings",
    LISTING_DETAIL: "/profile/listings",
    SEARCH: "/search",
    RESOURCES: "/resources",
    RESOURCE_TOPIC: "/resources/:topic",
    RESOURCE_GUIDE: "/resources/:topic/:guide",
    RESOURCE_FAQS: "/resources/faqs",
    RESOURCE_PREVIEW: "/resources/preview",
    CHECKOUT: "/checkout",
    PAYOUT: "/payout",
    CHECKOUT_SELLER_CONFIRM: "/seller-confirm",
    CHECKOUT_PAY_DEPOSIT: "/deposit-payment",
    CHECKOUT_PAY_INVOICE: "/invoice-payment",
    CHECKOUT_SIGN_AGREEMENT: "/sign-agreement",
    CHECKOUT_OWNERSHIP_TRANSFER: "/ownership-transfer",
    MANAGE_BIDS: "/buying/bids",
    OFFER_DETAIL: "/profile/offer",
    MANAGE_PAYMENTS: "/buying/payments",
    MANAGE_ASKS: "/selling/asks",
    PAYOUT_SIGN_RELEASE_FORM: "/payout/sign-release-form",
    PAYOUT_LISTED_FOR_SALE: "/payout/listed-for-sale",
    PAYOUT_TRANSACTION_PROCESSING: "/payout/transaction-processing",
    PAYOUT_TRANSACTION_COMPLETED: "/payout/transaction-completed",
    TERMS_OF_USE_BUYER: "/terms-of-use/buyer",
    TERMS_OF_USE_SUPPLIER: "/terms-of-use/supplier",
};

const getResourceTopicRoute = (topicSlug: string) =>
    `${ROUTE_PUBLIC.RESOURCES}/${encodeURIComponent(topicSlug)}`;

const getResourceGuideRoute = (topicSlug: string, guideSlug: string) =>
    `${getResourceTopicRoute(topicSlug)}/${encodeURIComponent(guideSlug)}`;

const ROUTE_ADMIN = {
    DASHBOARD: "/admin",
};
const ROUTE_CMS = {
    ADMIN: "/cms-admin",
    BLOG: "/cms-admin/collections/resource-guides",
    API: "/api-cms",
    GRAPHQL: "/graphql-cms",
    GRAPHQL_PLAYGROUND: "/graphql-cms-playground",
} as const;
const ROUTE_DASHBOARD = {
    ROOT: ROUTE_ADMIN.DASHBOARD,
    CASK: `${ROUTE_ADMIN.DASHBOARD}/listing/cask`,
    CASK_ADD: `${ROUTE_ADMIN.DASHBOARD}/listing/cask/add`,
    DISTILLERY: `${ROUTE_ADMIN.DASHBOARD}/listing/distillery`,
    CLASSIFICATION: `${ROUTE_ADMIN.DASHBOARD}/listing/classification`,
    CASK_TYPE: `${ROUTE_ADMIN.DASHBOARD}/listing/cask-type`,
    METADATA: `${ROUTE_ADMIN.DASHBOARD}/listing/metadata`,
    PAYOUT: `${ROUTE_ADMIN.DASHBOARD}/orders/payouts`,
    PAYMENTS: `${ROUTE_ADMIN.DASHBOARD}/orders/payments`,
    DOCUMENTS: `${ROUTE_ADMIN.DASHBOARD}/orders/documents`,
    DISTILLERY_ADD: `${ROUTE_ADMIN.DASHBOARD}/listing/distillery/add`,
};
const PARAMS = {
    sortOrder: "sortOrder",
    sortBy: "sortBy",
    size: "size",
    page: "page",
    status: "status",
    filter: "filter?",
    search: "search",
    category: "category",
    isRead: "isRead",
    unread: "unread",
};

export {
    ROUTE_AUTH,
    ROUTE_PUBLIC,
    getResourceTopicRoute,
    getResourceGuideRoute,
    PARAMS,
    ROUTE_AUTH_EXCLUDE,
    ROUTE_DASHBOARD,
    ROUTE_ADMIN,
    ROUTE_CMS,
};
