import { STRIPE_KEYS } from "@/lib/constants/key";
import stripeService from "@/services/stripe";
import { stripe } from "@/types/stripe";
import {
    useQuery,
    type UseQueryOptions,
    type UseQueryResult,
} from "@tanstack/react-query";

type PayoutResponse = {
    success: boolean;
    payouts: stripe.TPayout;
};

type UseStripePayoutsOptions = Omit<
    UseQueryOptions<PayoutResponse, unknown, PayoutResponse, [string, string]>,
    "queryKey" | "queryFn"
>;

type UseStripePayoutsResult = UseQueryResult<PayoutResponse, unknown> & {
    accountId: string;
    accountError: unknown | null;
    isResolvingAccount: boolean;
    externalAccounts: stripe.TPayoutExternalAccount[];
    hasBankAccounts: boolean;
    isPayoutEnabled: boolean;
};

const getErrorStatus = (error: unknown) => {
    if (!error) return undefined;

    if (typeof error === "string") {
        return /\b404\b/.test(error) ? 404 : undefined;
    }

    if (typeof error !== "object") return undefined;

    const errorData = error as {
        message?: unknown;
        status?: unknown;
        statusCode?: unknown;
        response?: { status?: unknown };
    };
    const status =
        errorData.status ?? errorData.statusCode ?? errorData.response?.status;

    if (typeof status === "number") return status;
    if (typeof status === "string" && status.trim()) {
        const parsedStatus = Number(status);
        if (Number.isFinite(parsedStatus)) return parsedStatus;
    }

    return typeof errorData.message === "string" &&
        /\b404\b/.test(errorData.message)
        ? 404
        : undefined;
};

export function useStripePayouts(
    accountId?: string,
    options?: UseStripePayoutsOptions
): UseStripePayoutsResult {
    const requestedEnabled = options?.enabled ?? true;
    const providedAccountId =
        accountId && accountId !== "undefined" && accountId !== "null"
            ? accountId
            : "";
    const profileQuery = useQuery({
        queryKey: [STRIPE_KEYS.PROFILE],
        queryFn: stripeService.getAccountStripe,
        enabled: requestedEnabled && !providedAccountId,
        staleTime: 5 * 60 * 1000,
        gcTime: Infinity,
        retry: false,
    });
    const profileAccountId = profileQuery.data?.profile?.id;
    const normalizedAccountId =
        providedAccountId ||
        (profileAccountId &&
        profileAccountId !== "undefined" &&
        profileAccountId !== "null"
            ? profileAccountId
            : "");
    const enabled = !!normalizedAccountId && requestedEnabled;
    const isAccountNotFound =
        profileQuery.isError && getErrorStatus(profileQuery.error) === 404;

    const payoutQuery = useQuery({
        staleTime: 5 * 60 * 1000,
        gcTime: Infinity,
        ...options,
        queryKey: [STRIPE_KEYS.PAYOUTS, normalizedAccountId],
        enabled,
        queryFn: () => {
            if (!normalizedAccountId) {
                throw new Error("Stripe account ID is unavailable");
            }
            return stripeService.getPayouts(normalizedAccountId);
        },
    });

    const rawData = payoutQuery.data;
    const payoutsInfo: stripe.TPayout | undefined =
        rawData?.payouts ?? (rawData as unknown as stripe.TPayout | undefined);
    const externalAccounts: stripe.TPayoutExternalAccount[] =
        payoutsInfo?.externalAccounts ??
        payoutsInfo?.external_accounts ??
        payoutsInfo?.bankAccounts ??
        [];
    const hasBankAccounts = externalAccounts.length > 0;
    const isPayoutEnabled =
        payoutsInfo?.enabled ?? payoutsInfo?.payoutsEnabled ?? false;

    return {
        ...payoutQuery,
        accountId: normalizedAccountId,
        accountError:
            profileQuery.isError && !isAccountNotFound
                ? profileQuery.error
                : null,
        isResolvingAccount:
            requestedEnabled && !normalizedAccountId && profileQuery.isPending,
        externalAccounts,
        hasBankAccounts,
        isPayoutEnabled,
    };
}
