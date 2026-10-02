"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { NOTIFICATION_PREFERENCE_KEYS } from "@/lib/constants/key";
import {
    DEFAULT_NOTIFICATIONS,
    EVENT_TYPE_MAP,
    NOTIFICATION_SECTIONS,
    REVERSE_EVENT_TYPE_MAP,
    TNotificationItem,
    TNotificationSection,
    TNotificationSetting,
} from "@/lib/constants/notifications";
import { cn, getErrorMessage } from "@/lib/utils";
import { notificationSchema } from "@/lib/validators";
import notificationPreferenceService from "@/services/notification-preference";
import { notificationPreference } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { useForm, useFormContext } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { BellRing } from "lucide-react";
import { useBrowserNotification } from "@/hooks/useBrowserNotification";

export default function NotificationModule() {
    const queryClient = useQueryClient();

    const form = useForm({
        resolver: zodResolver(notificationSchema),
        defaultValues: DEFAULT_NOTIFICATIONS,
    });

    const { data: preferencesData } = useQuery({
        queryKey: [NOTIFICATION_PREFERENCE_KEYS.GET_PREFERENCES],
        queryFn: () =>
            notificationPreferenceService.getNotificationPreferences(),
    });

    const updateChannelMutation = useMutation({
        mutationFn: ({
            eventType,
            inAppEnabled,
            emailEnabled,
        }: {
            eventType: string;
            inAppEnabled: boolean;
            emailEnabled: boolean;
        }) =>
            notificationPreferenceService.updateChannelPreference(eventType, {
                inAppEnabled,
                emailEnabled,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [NOTIFICATION_PREFERENCE_KEYS.GET_PREFERENCES],
            });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(
                    error,
                    "Failed to update notification channel preference"
                )
            );
        },
    });

    const updateThresholdMutation = useMutation({
        mutationFn: ({
            eventType,
            thresholdPercent,
        }: {
            eventType: string;
            thresholdPercent: number;
        }) =>
            notificationPreferenceService.updateThresholdPreference(eventType, {
                thresholdPercent,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [NOTIFICATION_PREFERENCE_KEYS.GET_PREFERENCES],
            });
        },
        onError: (error) => {
            toast.error(
                getErrorMessage(error, "Failed to update threshold preference")
            );
        },
    });

    const parsedPreferences = useMemo(() => {
        if (!preferencesData) return null;

        let items: notificationPreference.TNotificationPreferenceItem[] = [];

        if (Array.isArray(preferencesData)) {
            items = preferencesData;
        } else if (
            typeof preferencesData === "object" &&
            preferencesData !== null &&
            "data" in preferencesData &&
            Array.isArray(
                (
                    preferencesData as {
                        data: notificationPreference.TNotificationPreferenceItem[];
                    }
                ).data
            )
        ) {
            items = (
                preferencesData as {
                    data: notificationPreference.TNotificationPreferenceItem[];
                }
            ).data;
        } else if (
            typeof preferencesData === "object" &&
            preferencesData !== null
        ) {
            items = Object.values(
                preferencesData as Record<
                    string,
                    notificationPreference.TNotificationPreferenceItem
                >
            );
        }

        if (!items || items.length === 0) return null;

        const result: Record<string, TNotificationSetting> = {
            ...DEFAULT_NOTIFICATIONS,
        };

        items.forEach((item) => {
            if (!item || !item.eventType) return;
            const setting: TNotificationSetting = {
                inapp: item.inAppEnabled ?? false,
                email: item.emailEnabled ?? false,
                percent: item.thresholdPercent ?? item.defaultThreshold ?? 0,
            };

            result[item.eventType] = setting;

            const legacyKey = REVERSE_EVENT_TYPE_MAP[item.eventType];
            if (legacyKey) {
                result[legacyKey] = setting;
            }
        });

        return result;
    }, [preferencesData]);

    useEffect(() => {
        if (parsedPreferences) {
            form.reset(parsedPreferences);
        }
    }, [parsedPreferences, form]);

    const handleToggleChange = (
        itemKey: string,
        channel: "inapp" | "email",
        checked: boolean
    ) => {
        const currentValues = form.getValues(itemKey) || {};
        const inAppEnabled =
            channel === "inapp" ? checked : !!currentValues.inapp;
        const emailEnabled =
            channel === "email" ? checked : !!currentValues.email;

        form.setValue(`${itemKey}.${channel}`, checked, {
            shouldDirty: true,
            shouldValidate: true,
        });

        const eventType = EVENT_TYPE_MAP[itemKey] || itemKey;
        updateChannelMutation.mutate({
            eventType,
            inAppEnabled,
            emailEnabled,
        });
    };

    const handleThresholdBlur = (itemKey: string, thresholdPercent: number) => {
        const eventType = EVENT_TYPE_MAP[itemKey] || itemKey;
        updateThresholdMutation.mutate({
            eventType,
            thresholdPercent,
        });
    };

    const onSubmit = (_data: z.infer<typeof notificationSchema>) => {
        // Form submit handler
    };

    return (
        <div className="flex w-full flex-col">
            <HeadingSettings
                title="Notifications"
                description="Manage how you receive marketplace updates, offers, and trading activity."
                className="mb-8 tb:mb-6 mb:mb-4"
                size="3xl"
                fontFamily="reckless"
                titleClassName="tb:text-2xl mb:text-xl"
            />
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col gap-10 tb:gap-8 mb:gap-6"
                >
                    <BrowserNotificationCard />
                    {NOTIFICATION_SECTIONS.map((section, index) => (
                        <NotificationSection
                            key={index}
                            {...section}
                            onToggleChange={handleToggleChange}
                            onThresholdBlur={handleThresholdBlur}
                        />
                    ))}
                </form>
            </Form>
        </div>
    );
}

const BrowserNotificationCard = () => {
    const {
        isSupported,
        permission,
        isEnabled,
        requestPermission,
        toggleEnabled,
        sendNotification,
    } = useBrowserNotification();

    const [isTesting, setIsTesting] = useState(false);

    const handleTestNotification = async () => {
        setIsTesting(true);
        try {
            const success = await sendNotification(
                "Cask Exchange Notification",
                {
                    body: "Browser push notifications are active and working properly!",
                    url: "/settings/notifications",
                }
            );
            if (success) {
                toast.success("Test notification sent to your browser!");
            } else {
                toast.error(
                    "Could not send browser notification. Please check permissions."
                );
            }
        } finally {
            setIsTesting(false);
        }
    };

    if (!isSupported) {
        return null;
    }

    return (
        <div className="mb-2 flex flex-col gap-4 border-b border-bd-main pb-8">
            <div className="flex items-start justify-between gap-4 mb:flex-col mb:items-stretch">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <BellRing className="h-5 w-5 text-typo-primary" />
                        <h4 className="font-inter text-base font-semibold text-typo-primary">
                            Browser Push Notifications
                        </h4>
                        {permission === "granted" && isEnabled && (
                            <span className="rounded bg-success/15 px-2 py-0.5 text-xs font-medium text-success">
                                Active
                            </span>
                        )}
                        {permission === "granted" && !isEnabled && (
                            <span className="rounded bg-bg-sf2 px-2 py-0.5 text-xs font-medium text-typo-soft">
                                Muted
                            </span>
                        )}
                        {permission === "denied" && (
                            <span className="rounded bg-error/15 px-2 py-0.5 text-xs font-medium text-error">
                                Blocked in Browser
                            </span>
                        )}
                    </div>
                    <p className="font-inter text-sm font-normal text-typo-soft">
                        Receive real-time desktop alerts for orders, payments,
                        bids, and listings even when Cask Exchange is in the
                        background.
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 mb:self-end">
                    {permission === "default" ? (
                        <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            className="rounded-none border-none outline-none focus-visible:outline-none"
                            onClick={requestPermission}
                        >
                            Enable in Browser
                        </Button>
                    ) : permission === "granted" ? (
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-none outline-none"
                                disabled={!isEnabled || isTesting}
                                onClick={handleTestNotification}
                            >
                                Test
                            </Button>
                            <Switch
                                checked={isEnabled}
                                onCheckedChange={(val) => toggleEnabled(val)}
                                aria-label="Toggle browser push notifications"
                            />
                        </div>
                    ) : (
                        <p className="text-xs text-error">
                            Blocked in browser settings
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const NotificationSection = ({
    title,
    description,
    items,
    onToggleChange,
    onThresholdBlur,
}: TNotificationSection & {
    onToggleChange: (
        itemKey: string,
        channel: "inapp" | "email",
        checked: boolean
    ) => void;
    onThresholdBlur: (itemKey: string, thresholdPercent: number) => void;
}) => (
    <div className="isolate flex flex-col gap-4">
        <div className="z-[2] flex flex-col gap-2 mb:gap-1">
            <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                {title}
            </h3>
            {description && (
                <p className="text-sm font-normal text-typo-soft mb:text-xs mb:leading-[1.2]">
                    {description}
                </p>
            )}
        </div>
        <div className="z-[1] bg-bg-sf4 px-6 pb-6 pt-3 tb:px-5 tb:pb-5 mb:px-4 mb:py-0 mb:pb-1">
            {/* Header Row: Hidden on Mobile */}
            <div className="mb-6 flex flex-row items-center gap-4 border-b border-bd-main py-3 tb:py-[0.75rem] mb:hidden">
                <div className="flex-1 text-xs font-normal text-typo-note">
                    Category
                </div>
                <div className="flex flex-row items-center gap-4">
                    <div className="w-[12.25rem] text-right text-xs font-normal text-typo-note tb:w-[6.25rem]">
                        In-app
                    </div>
                    <div className="w-[11.25rem] text-right text-xs font-normal text-typo-note tb:w-[6.25rem]">
                        Email
                    </div>
                </div>
            </div>

            {/* Notification Items List */}
            <div className="flex flex-col gap-6 mb:gap-0">
                {items.map((item, index) => (
                    <NotificationItem
                        key={index}
                        item={item}
                        onToggleChange={onToggleChange}
                        onThresholdBlur={onThresholdBlur}
                    />
                ))}
            </div>
        </div>
    </div>
);

const NotificationItem = ({
    item,
    onToggleChange,
    onThresholdBlur,
}: {
    item: TNotificationItem;
    onToggleChange: (
        itemKey: string,
        channel: "inapp" | "email",
        checked: boolean
    ) => void;
    onThresholdBlur: (itemKey: string, thresholdPercent: number) => void;
}) => {
    const { watch } = useFormContext();
    const isEnabled = watch(`${item.key}.inapp`) || watch(`${item.key}.email`);

    return (
        <div className="flex flex-row items-center gap-4 mb:flex-col mb:items-start mb:gap-3 mb:border-b mb:border-bd-main mb:py-4 mb:last:border-b-0">
            <div className="flex flex-1 flex-col space-y-1 mb:w-full">
                <h4 className="text-base font-semibold text-typo-primary mb:text-sm">
                    {item.label}
                </h4>
                <p className="text-sm font-normal text-typo-soft mb:text-xs mb:leading-[1.2]">
                    {item.decs}
                </p>
                <AnimatePresence initial={false}>
                    {item.hasPercent && isEnabled && (
                        <PercentSetting
                            itemKey={item.key}
                            onThresholdBlur={onThresholdBlur}
                        />
                    )}
                </AnimatePresence>
            </div>
            <NotificationToggle
                itemKey={item.key}
                onToggleChange={onToggleChange}
            />
        </div>
    );
};

const PercentSetting = ({
    itemKey,
    onThresholdBlur,
}: {
    itemKey: string;
    onThresholdBlur: (itemKey: string, thresholdPercent: number) => void;
}) => {
    const { control, setValue, watch } = useFormContext();
    const value = watch(`${itemKey}.percent`);

    return (
        <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="!mt-0.5 overflow-hidden"
        >
            <div className="flex items-center gap-1 text-sm mb:flex-wrap mb:text-xs">
                <span className="text-typo-primary">
                    Notify me when the Offer reaches at least
                </span>
                <FormField
                    control={control}
                    name={`${itemKey}.percent`}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="text"
                            className="max-w-9 rounded bg-brand px-2 py-0.5 text-center font-medium text-typo-primary outline-none mb:scale-90"
                            onChange={(e) => {
                                const val = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                );
                                if (val === "") {
                                    field.onChange("");
                                    return;
                                }
                                const num = parseInt(val);
                                if (num >= 0 && num <= 100) {
                                    field.onChange(num);
                                }
                            }}
                            onBlur={() => {
                                let numVal = 0;
                                if (
                                    field.value === "" ||
                                    field.value === undefined
                                ) {
                                    setValue(`${itemKey}.percent`, 0);
                                    numVal = 0;
                                } else {
                                    numVal = Number(field.value) || 0;
                                }
                                onThresholdBlur(itemKey, numVal);
                            }}
                            value={value ?? ""}
                        />
                    )}
                />
                <span className="text-typo-primary">
                    % of my Listing price.
                </span>
            </div>
        </m.div>
    );
};

const NotificationToggle = ({
    itemKey,
    onToggleChange,
}: {
    itemKey: string;
    onToggleChange: (
        itemKey: string,
        channel: "inapp" | "email",
        checked: boolean
    ) => void;
}) => {
    const { control } = useFormContext();

    return (
        <div className="flex flex-row items-center gap-4 mb:w-full mb:flex-col mb:items-stretch mb:gap-3">
            {[
                {
                    name: "inapp" as const,
                    label: "In-app",
                    width: "w-[12.25rem] tb:w-[6.25rem]",
                },
                {
                    name: "email" as const,
                    label: "Email",
                    width: "w-[11.25rem] tb:w-[6.25rem]",
                },
            ].map((toggle) => (
                <div
                    key={toggle.name}
                    className="flex flex-row items-center justify-between mb:w-full"
                >
                    <p className="hidden text-xs font-normal text-typo-note mb:block">
                        {toggle.label}
                    </p>
                    <FormField
                        control={control}
                        name={`${itemKey}.${toggle.name}`}
                        render={({ field }) => (
                            <div
                                className={cn(
                                    "flex justify-end mb:w-auto",
                                    toggle.width
                                )}
                            >
                                <Switch
                                    checked={!!field.value}
                                    onCheckedChange={(checked) => {
                                        field.onChange(checked);
                                        onToggleChange(
                                            itemKey,
                                            toggle.name,
                                            checked
                                        );
                                    }}
                                    className="mb:scale-90"
                                />
                            </div>
                        )}
                    />
                </div>
            ))}
        </div>
    );
};
