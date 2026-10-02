import { CHECKOUT_STATUS, CHECKOUT_STEP } from "@/enum/checkout";
import { EDocuSignStatus } from "@/enum/docusign";
import { CHECKOUT_KEYS } from "@/lib/constants/key";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { getCurrentUser } from "@/lib/server/get-current-user";
import { getCheckoutStatus } from "@/lib/server/get-checkout-status";
import { getQueryClient } from "@/lib/get-query-client";
import {
    handleCamelCaseToSnakeCase,
    isCheckoutStatusExpired,
} from "@/lib/utils";
import OrderCancelled from "@/modules/checkoutv2/pages/OrderCancelled";
import OrderExpired from "@/modules/checkoutv2/pages/OrderExpired";
import OwnershipTransfer from "@/modules/checkoutv2/pages/OwnershipTransfer";
import PayDeposit from "@/modules/checkoutv2/pages/PayDeposit";
import PayInvoice from "@/modules/checkoutv2/pages/PayInvoice";
import SellerConfirmation from "@/modules/checkoutv2/pages/SellerConfirmation";
import SignAgreement from "@/modules/checkoutv2/pages/SignAgreement";
import { checkoutServerAction } from "@/services/server-action/checkout";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { redirect } from "next/navigation";

function prefetchCheckoutDocuments(
    queryClient: QueryClient,
    sessionId: string
) {
    return queryClient.prefetchQuery({
        queryKey: [CHECKOUT_KEYS.GET_SESSION_DOCUMENTS, sessionId],
        queryFn: () =>
            checkoutServerAction.getCheckoutSessionDocumentsServer(sessionId),
    });
}

export default async function CheckoutV2CatchAllPage({
    params,
}: {
    params: Promise<{ sessionId: string; slug: string }>;
}) {
    const { sessionId, slug } = (await params) || {};

    let status = null;
    try {
        status = await getCheckoutStatus(sessionId);
    } catch (e) {
        console.error("Error fetching checkout status:", e);
    }
    if (!status) {
        redirect(ROUTE_PUBLIC.HOME);
    }

    if ((status as unknown as { statusCode: number })?.statusCode === 403) {
        redirect(ROUTE_PUBLIC.HOME);
    }

    console.log("status", JSON.stringify(status));

    const isSellerAgreementSigned = status.transactions?.every(
        (transaction) => {
            return (
                (transaction.sellerAgreementStatus ===
                    EDocuSignStatus.ALL_SIGNED &&
                    transaction?.sellerAgreementAdminSignedAt !== null) ||
                transaction?.buyerAgreementStatus ===
                    EDocuSignStatus.BUYER_UPDATE_REQUESTED
            );
        }
    );

    // Enforce matching step routing rules
    if (!isSellerAgreementSigned) {
        if (slug !== CHECKOUT_STEP.SELLER_CONFIRMATION) {
            redirect(
                `${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${CHECKOUT_STEP.SELLER_CONFIRMATION}`
            );
        }
    } else {
        if (slug === CHECKOUT_STEP.SELLER_CONFIRMATION) {
            const currentStep = handleCamelCaseToSnakeCase(
                status.currentStep || ""
            );
            redirect(`${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${currentStep}`);
        }
    }

    const convertStep = handleCamelCaseToSnakeCase(status.currentStep || "");
    if (isSellerAgreementSigned && convertStep && convertStep !== slug) {
        redirect(`${ROUTE_PUBLIC.CHECKOUT}/${sessionId}/${convertStep}`);
    }

    // Terminal checkout statuses
    if (status?.status === CHECKOUT_STATUS.CANCELLED) {
        return <OrderCancelled />;
    }

    if (isCheckoutStatusExpired(status?.status)) {
        return <OrderExpired status={status} />;
    }

    switch (slug) {
        case CHECKOUT_STEP.SELLER_CONFIRMATION:
            return <SellerConfirmation statusCheckout={status} />;
        case CHECKOUT_STEP.DEPOSIT_PAYMENT: {
            const queryClient = getQueryClient();
            try {
                await Promise.all([
                    prefetchCheckoutDocuments(queryClient, sessionId),
                    queryClient.prefetchQuery({
                        queryKey: [
                            CHECKOUT_KEYS.CREATE_DEPOSIT_SECRET,
                            sessionId,
                        ],
                        queryFn: () =>
                            checkoutServerAction.createDepositSecretServer(
                                sessionId
                            ),
                    }),
                ]);
            } catch (error) {
                console.error("Error prefetching deposit payment data:", error);
            }

            return (
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <PayDeposit />
                </HydrationBoundary>
            );
        }
        case CHECKOUT_STEP.AGREEMENT_SIGNING: {
            const queryClient = getQueryClient();
            const documentsPrefetch = prefetchCheckoutDocuments(
                queryClient,
                sessionId
            );
            let userProfile = null;
            try {
                [userProfile] = await Promise.all([
                    getCurrentUser(),
                    documentsPrefetch,
                ]);
            } catch (error) {
                console.error(
                    "Error prefetching agreement signing data:",
                    error
                );
            }

            const isSignAgreementEnabled =
                !!sessionId &&
                !!userProfile &&
                status?.buyerDocuSignStatus !== EDocuSignStatus.BUYER_SIGNED;

            if (isSignAgreementEnabled && userProfile) {
                try {
                    const signature =
                        `${userProfile.firstName || ""} ${userProfile.lastName || ""}`.trim();
                    await queryClient.prefetchQuery({
                        queryKey: [CHECKOUT_KEYS.SIGN_AGREEMENT, sessionId],
                        queryFn: () =>
                            checkoutServerAction.signAgreementServer({
                                checkoutSessionId: sessionId,
                                signature,
                                agreementAccepted: true,
                            }),
                    });
                } catch (error) {
                    console.error("Error prefetching sign agreement:", error);
                }
            }

            return (
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <SignAgreement />
                </HydrationBoundary>
            );
        }
        case CHECKOUT_STEP.INVOICE_PAYMENT: {
            const queryClient = getQueryClient();
            const isInvoiceSecretEnabled =
                status.status === CHECKOUT_STATUS.AGREEMENT_SIGNED;

            try {
                await Promise.all([
                    prefetchCheckoutDocuments(queryClient, sessionId),
                    ...(isInvoiceSecretEnabled
                        ? [
                              queryClient.prefetchQuery({
                                  queryKey: [
                                      CHECKOUT_KEYS.CREATE_INVOICE_SECRET,
                                      sessionId,
                                  ],
                                  queryFn: () =>
                                      checkoutServerAction.createInvoiceSecretServer(
                                          sessionId
                                      ),
                              }),
                          ]
                        : []),
                ]);
            } catch (error) {
                console.error("Error prefetching invoice payment data:", error);
            }

            return (
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <PayInvoice />
                </HydrationBoundary>
            );
        }
        case CHECKOUT_STEP.OWNERSHIP_TRANSFER: {
            const queryClient = getQueryClient();
            try {
                await prefetchCheckoutDocuments(queryClient, sessionId);
            } catch (error) {
                console.error(
                    "Error prefetching documents in checkoutv2 layout:",
                    error
                );
            }

            return (
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <OwnershipTransfer />
                </HydrationBoundary>
            );
        }
        default:
            redirect(`/${ROUTE_PUBLIC.CHECKOUT}/${sessionId}`);
    }
}
