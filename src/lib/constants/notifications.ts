// Notification types and configurations
export type TNotificationSetting = {
    inapp: boolean;
    email: boolean;
    percent?: number;
};

export type TNotificationItem = {
    key: string;
    label: string;
    decs?: string;
    actions?: TNotificationSetting;
    hasPercent?: boolean;
};

export type TNotificationSection = {
    title: string;
    description?: string;
    items: TNotificationItem[];
};

// Map legacy frontend keys to backend eventTypes
export const EVENT_TYPE_MAP: Record<string, string> = {
    asknearbidbuying: "ASK_NEAR_BID_BUYING",
    bidnearaskselling: "BID_NEAR_ASK_SELLING",
    floorpriceupdatedbuyer: "FLOOR_PRICE_UPDATED_BUYER",
    newhighestbidseller: "NEW_HIGHEST_BID_SELLER",
    askexpiredseller: "ASK_EXPIRED_SELLER",
    bidexpiredbuyer: "BID_EXPIRED_BUYER",
    scheduledmaintenance: "SCHEDULED_MAINTENANCE",
    maintenancecompleted: "MAINTENANCE_COMPLETED",
    termspoliciesupdated: "TERMS_POLICIES_UPDATED",
    // Backwards compatibility aliases
    newlowestlisting: "FLOOR_PRICE_UPDATED_BUYER",
    newhighestoffer: "NEW_HIGHEST_BID_SELLER",
    listingmatchesexpiredoffer: "BID_EXPIRED_BUYER",
    sellingnewhighestoffer: "BID_NEAR_ASK_SELLING",
    sellingnewlowestlisting: "ASK_EXPIRED_SELLER",
    productupdates: "SCHEDULED_MAINTENANCE",
    marketplaceannouncements: "MAINTENANCE_COMPLETED",
    promotionsoffers: "TERMS_POLICIES_UPDATED",
};

// Map backend eventTypes to legacy keys for reverse lookups
export const REVERSE_EVENT_TYPE_MAP: Record<string, string> = Object.entries(
    EVENT_TYPE_MAP
).reduce(
    (acc, [legacyKey, eventType]) => {
        acc[eventType] = legacyKey;
        return acc;
    },
    {} as Record<string, string>
);

// Notification sections configuration based on canonical backend eventTypes
export const NOTIFICATION_SECTIONS: TNotificationSection[] = [
    {
        title: "Buying",
        description:
            "Alerts related to your active Bids and available listings.",
        items: [
            {
                key: "ASK_NEAR_BID_BUYING",
                label: "Listing near your offer",
                decs: "Get notified when a listing is priced close to your offer.",
                actions: { inapp: true, email: true, percent: 20 },
                hasPercent: true,
            },
            {
                key: "FLOOR_PRICE_UPDATED_BUYER",
                label: "Floor price updated",
                decs: "Get notified when the floor price changes for an item you have an active Offer on.",
                actions: { inapp: true, email: false },
                hasPercent: false,
            },
            // {
            //     key: "BID_EXPIRED_BUYER",
            //     label: "Bid expired",
            //     decs: "Notified when one of your active Bids expires.",
            //     actions: { inapp: true, email: true },
            //     hasPercent: false,
            // },
        ],
    },
    {
        title: "Selling",
        description:
            "Alerts related to your active Listings and incoming Offers.",
        items: [
            {
                key: "BID_NEAR_ASK_SELLING",
                label: "Offer near your listing",
                decs: "Get notified when an offer is close to your listing price.",
                actions: { inapp: true, email: true, percent: 80 },
                hasPercent: true,
            },
            {
                key: "NEW_HIGHEST_BID_SELLER",
                label: "Top offer updated",
                decs: "Get notified when the top offer changes for an item you currently listed for sale.",
                actions: { inapp: true, email: true },
                hasPercent: false,
            },
            // {
            //     key: "ASK_EXPIRED_SELLER",
            //     label: "Listing expired",
            //     decs: "Notified when one of your active Listings expires.",
            //     actions: { inapp: true, email: true },
            //     hasPercent: false,
            // },
        ],
    },
    {
        title: "Cask Exchange System & Policy",
        description:
            "Platform maintenance alerts and important policy updates.",
        items: [
            {
                key: "SCHEDULED_MAINTENANCE",
                label: "Scheduled maintenance",
                decs: "Notified about upcoming platform maintenance windows.",
                actions: { inapp: true, email: true },
            },
            {
                key: "MAINTENANCE_COMPLETED",
                label: "Maintenance completed",
                decs: "Notified when maintenance is finished and services are back online.",
                actions: { inapp: true, email: true },
            },
            {
                key: "TERMS_POLICIES_UPDATED",
                label: "Terms & policies updated",
                decs: "Notified when Cask Exchange terms or trading policies are updated.",
                actions: { inapp: true, email: true },
            },
        ],
    },
];

// Default notification settings
export const DEFAULT_NOTIFICATIONS: Record<string, TNotificationSetting> = {
    ASK_NEAR_BID_BUYING: { inapp: true, email: true, percent: 20 },
    BID_NEAR_ASK_SELLING: { inapp: true, email: true, percent: 80 },
    FLOOR_PRICE_UPDATED_BUYER: { inapp: true, email: false },
    NEW_HIGHEST_BID_SELLER: { inapp: true, email: true },
    ASK_EXPIRED_SELLER: { inapp: true, email: true },
    BID_EXPIRED_BUYER: { inapp: true, email: true },
    SCHEDULED_MAINTENANCE: { inapp: true, email: true },
    MAINTENANCE_COMPLETED: { inapp: true, email: true },
    TERMS_POLICIES_UPDATED: { inapp: true, email: true },
};
