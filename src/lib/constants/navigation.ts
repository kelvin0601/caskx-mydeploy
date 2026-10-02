import { IconBell } from "@/components/shared/icons/icon-bell";
import IconBuilding from "@/components/shared/icons/icon-building";
import IconCube from "@/components/shared/icons/icon-cube";
import IconInfo from "@/components/shared/icons/icon-info";
import IconLogoutLight from "@/components/shared/icons/icon-logout-light";
import IconPayment from "@/components/shared/icons/icon-payment";
import IconPayout from "@/components/shared/icons/icon-payout";
import IconShield from "@/components/shared/icons/icon-sheild";
import { CHECKOUT_STEP, PAYOUT_STEP } from "@/enum/checkout";
import { JSX } from "react";
import IconWallet from "@/components/shared/icons/icon-wallet";
import IconSetting from "@/components/shared/icons/icon-settings";
import {
    getResourceTopicRoute,
    ROUTE_CMS,
    ROUTE_DASHBOARD,
    ROUTE_PUBLIC,
} from "./route";

export type TMenuNavigation = {
    title?: string;
    href?: string;
    isOpenWindow?: boolean;
    subItems?: {
        title: string;
        href?: string;
        isOpenWindow?: boolean;
        icon?: () => JSX.Element;
        onClick?: () => void;
    }[];
};

export const MENU_NAVIGATION: TMenuNavigation[] = [
    {
        title: "Marketplace",
        href: `${ROUTE_PUBLIC.CASK_DETAILS}?sortBy=popularity%26sortOrder%3DDESC`,
        isOpenWindow: false,
    },
    {
        title: "Distilleries",
        href: `${ROUTE_PUBLIC.DISTILLERY}`,
        isOpenWindow: false,
    },
    {
        title: "Portfolio",
        href: "/portfolio",
        isOpenWindow: false,
    },
    {
        title: "Resources",
        href: ROUTE_PUBLIC.RESOURCES,
        isOpenWindow: false,
        subItems: [
            {
                title: "How It Works",
                href: ROUTE_PUBLIC.RESOURCES,
                isOpenWindow: false,
            },
            {
                title: "Buying Guide",
                href: getResourceTopicRoute("buying"),
                isOpenWindow: false,
            },
            {
                title: "Selling Guide",
                href: getResourceTopicRoute("selling"),
                isOpenWindow: false,
            },
            {
                title: "Marketplace",
                href: getResourceTopicRoute("marketplace"),
                isOpenWindow: false,
            },
            {
                title: "Whisky Casks",
                href: getResourceTopicRoute("whisky-casks"),
                isOpenWindow: false,
            },
            {
                title: "FAQs",
                href: ROUTE_PUBLIC.RESOURCE_FAQS,
                isOpenWindow: false,
            },
        ],
    },
    {
        title: "Admin",
        href: `${ROUTE_DASHBOARD.ROOT}`,
        isOpenWindow: false,
    },
];
export const MENU_DASHBOARD = [
    {
        title: "Marketplace",
        isOpenWindow: false,
        Icon: IconCube,
        subItems: [
            {
                title: "Casks",
                href: ROUTE_DASHBOARD.CASK,
                isOpenWindow: false,
            },
            {
                title: "Listing",
                href: "#listing",
                isOpenWindow: false,
            },
            {
                title: "Offer",
                href: "#offer",
                isOpenWindow: false,
            },
        ],
    },
    {
        title: "Finance",
        isOpenWindow: false,
        Icon: IconWallet,
        subItems: [
            {
                title: "Payment",
                href: ROUTE_DASHBOARD.PAYMENTS,
                isOpenWindow: false,
            },
            {
                title: "Payout",
                href: ROUTE_DASHBOARD.PAYOUT,
                isOpenWindow: false,
            },
        ],
    },
    {
        title: "Settings",
        isOpenWindow: false,
        Icon: IconSetting,
        subItems: [
            {
                title: "Distilleries",
                href: ROUTE_DASHBOARD.DISTILLERY,
                isOpenWindow: false,
            },
            {
                title: "Metadata",
                href: ROUTE_DASHBOARD.METADATA,
                isOpenWindow: false,
            },
            {
                title: "Blog",
                href: ROUTE_CMS.BLOG,
                isOpenWindow: false,
            },
        ],
    },
];
// Settings menu
export const MENU_SETTINGS = [
    {
        title: "Personal Information",
        href: ROUTE_PUBLIC.SETTINGS_ACCOUNT,
        isOpenWindow: false,
        Icon: IconInfo,
    },
    // {
    //     title: "Wallet",
    //     href: ROUTE_PUBLIC.SETTINGS_WALLET,
    //     isOpenWindow: false,
    //     Icon: IconWallet,
    // },
    {
        title: "Security and Privacy",
        href: ROUTE_PUBLIC.SETTINGS_SECURITY,
        isOpenWindow: false,
        Icon: IconShield,
    },
    {
        title: "Notifications",
        href: ROUTE_PUBLIC.SETTINGS_NOTIFICATION,
        isOpenWindow: false,
        Icon: IconBell,
    },
];

// Checkout menu
export const MENU_CHECKOUT = [
    {
        title: "Pay Deposit",
        href: ROUTE_PUBLIC.CHECKOUT_PAY_DEPOSIT,
        isOpenWindow: false,
        step: CHECKOUT_STEP.DEPOSIT_PAYMENT,
    },
    {
        title: "Sign Agreement",
        href: ROUTE_PUBLIC.CHECKOUT_SIGN_AGREEMENT,
        isOpenWindow: false,
        step: CHECKOUT_STEP.AGREEMENT_SIGNING,
    },
    {
        title: "Pay Invoice",
        href: ROUTE_PUBLIC.CHECKOUT_PAY_INVOICE,
        isOpenWindow: false,
        step: CHECKOUT_STEP.INVOICE_PAYMENT,
    },
    {
        title: "Ownership Transfer",
        href: ROUTE_PUBLIC.CHECKOUT_OWNERSHIP_TRANSFER,
        isOpenWindow: false,
        step: CHECKOUT_STEP.OWNERSHIP_TRANSFER,
    },
];

// Payout menu
export const MENU_PAYOUT = [
    {
        title: "Sign Release Form",
        href: ROUTE_PUBLIC.PAYOUT_SIGN_RELEASE_FORM,
        isOpenWindow: false,
        step: PAYOUT_STEP.SIGN_RELEASE_FORM,
    },
    {
        title: "Listed for Sale",
        href: ROUTE_PUBLIC.PAYOUT_LISTED_FOR_SALE,
        isOpenWindow: false,
        step: PAYOUT_STEP.LISTED_FOR_SALE,
    },
    {
        title: "Transaction Completed",
        href: ROUTE_PUBLIC.PAYOUT_TRANSACTION_COMPLETED,
        isOpenWindow: false,
        step: PAYOUT_STEP.TRANSACTION_COMPLETED,
    },
];
// Sidebar tabs for cask detail
export const SIDEBAR_TABS = {
    MARKET: "market",
    BUY_NOW: "buy-now",
    PLACE_BID: "place-bid",
    CONFIRM_BID: "confirm-bid",
    CONFIRM_ASK: "confirm-ask",
    PLACE_ASK: "place-ask",
    SELL_NOW: "sell-now",
    CONFIRM_BUY_NOW: "confirm-buy-now",
    CONFIRM_SELL_NOW: "confirm-sell-now",
    UPDATE_BID: "update-bid",
    UPDATE_ASK: "update-ask",
};

export type TSidebarTabs = (typeof SIDEBAR_TABS)[keyof typeof SIDEBAR_TABS];
