import { env } from "@/config/env";
import {
    EBadgeVariant,
    ETransactionHistoryStatus,
    ETransactionOnGoingStatus,
} from "@/enum/transaction";

import { ETransactionStatus } from "@/enum/transaction";

// App configuration constants
export const APP_NAME = env.appName;

export const APP_DESCRIPTION = env.appDescription;

export const SERVER_URL = env.serviceUrl;

export const IS_DEVELOPMENT = env.isDevelopment;

export const LATEST_PRODUCTS_LIMIT = env.latestProductsLimit;

export const DEFAULT_PAGE_SIZE = env.defaultPageSize;
export const MAPPING_COLOR_STATUS = {
    [ETransactionStatus.ACTIVE]: EBadgeVariant.SUCCESS,
    [ETransactionStatus.COMPLETED]: EBadgeVariant.COMPLETE,
    [ETransactionStatus.EXPIRED]: EBadgeVariant.STATIC,
    [ETransactionStatus.PENDING]: EBadgeVariant.PENDING,
    [ETransactionStatus.CANCELLED]: EBadgeVariant.WARNING,
    [ETransactionStatus.TRANSACTION]: EBadgeVariant.TRANSACTION,
    [ETransactionOnGoingStatus.DEPOSIT]: EBadgeVariant.SUCCESS,
    [ETransactionOnGoingStatus.AGREEMENT]: EBadgeVariant.COMPLETE,
    [ETransactionOnGoingStatus.AGREEMENT_SIGNED]: EBadgeVariant.COMPLETE,
    [ETransactionOnGoingStatus.PAYMENT]: EBadgeVariant.WARNING,
    [ETransactionOnGoingStatus.OWNERSHIP_TRANSFER]: EBadgeVariant.PENDING,
    [ETransactionHistoryStatus.COMPLETED]: EBadgeVariant.COMPLETE,
    [ETransactionHistoryStatus.CANCELLED]: EBadgeVariant.WARNING,
    [ETransactionHistoryStatus.FAILED]: EBadgeVariant.DESTRUCTIVE,
    [ETransactionOnGoingStatus.PAYMENT_PAID]: EBadgeVariant.COMPLETE,
    [ETransactionStatus.HOLDING]: EBadgeVariant.SUCCESS,
    [ETransactionStatus.FOR_SALE]: EBadgeVariant.COMPLETE,
    [ETransactionStatus.INVOICE_SUBMITTED]: EBadgeVariant.COMPLETE,
};
// Timer constants
export const TIMER_RESEND_SECONDS = 60;
export const TIMER_REDIRECT = 5;

// Offer constants
export const EXPIRATION_OPTIONS = [
    {
        label: "3 days",
        value: "3",
    },
    {
        label: "7 days",
        value: "7",
    },
    {
        label: "10 days",
        value: "10",
    },
    {
        label: "30 days",
        value: "30",
    },
] as const;
