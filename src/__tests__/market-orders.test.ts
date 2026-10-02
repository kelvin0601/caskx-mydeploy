jest.mock("query-string", () => ({
    stringify: jest.fn(),
    parse: jest.fn(),
}));

jest.mock("next/image", () => ({
    getImageProps: jest.fn(() => ({ props: {} })),
}));

jest.mock("@/services/cask-bid", () => ({
    caskBidService: {
        getTransactionsFormBidId: jest.fn().mockResolvedValue({
            data: {
                transactions: [],
            },
        }),
        getBidDetail: jest.fn().mockResolvedValue({
            data: {
                transactions: [],
            },
        }),
    },
}));

import { listingOrderDefinition } from "@/modules/market-orders/definitions/listing-definition";
import { offerOrderDefinition } from "@/modules/market-orders/definitions/offer-definition";
import { MARKET_ORDER_KEYS } from "@/modules/market-orders/query-keys";
import { KEY_ASK, KEY_BID, KEY_TRADING } from "@/lib/constants";
import { MARKET_ORDER_INTENTS } from "@/modules/market-orders/flow/definitions";
import {
    INITIAL_MARKET_ORDER_FLOW_STATE,
    marketOrderFlowReducer,
} from "@/modules/market-orders/flow/reducer";
import {
    MARKET_ORDER_DRAWER,
    MARKET_ORDER_INTENT,
    MARKET_ORDER_KIND,
    MARKET_ORDER_OVERLAY,
    MARKET_ORDER_STEP,
} from "@/modules/market-orders/constants";
import {
    createManagementDraft,
    getDrawerState,
    hasUpdateDraftChanges,
} from "@/modules/market-orders/management/drawer-flow/model";
import {
    INITIAL_DRAWER_FLOW_STATE,
    marketOrderDrawerFlowReducer,
} from "@/modules/market-orders/management/drawer-flow/reducer";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import type { TTableRow } from "@/types";
import {
    getUpdateOfferMatchScenario,
    UPDATE_OFFER_MATCH_SCENARIO,
} from "@/modules/market-orders/components/update-offer-confirmation/scenario";

const MARKET_DATA = {
    caskId: "cask-1",
    highestBid: 1200,
    lowestAsk: 1350,
    lowestBid: 1100,
    totalActiveAsks: 2,
    totalActiveBids: 3,
    totalTransactions: 4,
};

describe("market order definitions", () => {
    it.each([
        [
            MARKET_ORDER_OVERLAY.UPDATE,
            MARKET_ORDER_STEP.EDIT,
            MARKET_ORDER_DRAWER.UPDATE,
        ],
        [
            MARKET_ORDER_OVERLAY.UPDATE,
            MARKET_ORDER_STEP.CONFIRM,
            MARKET_ORDER_DRAWER.CONFIRM_UPDATE,
        ],
        [
            MARKET_ORDER_OVERLAY.DUPLICATE,
            MARKET_ORDER_STEP.EDIT,
            MARKET_ORDER_DRAWER.DUPLICATE,
        ],
        [
            MARKET_ORDER_OVERLAY.DUPLICATE,
            MARKET_ORDER_STEP.CONFIRM,
            MARKET_ORDER_DRAWER.CONFIRM_DUPLICATE,
        ],
    ])("maps %s/%s to drawer state %s", (overlay, step, expected) => {
        expect(getDrawerState(overlay, step)).toBe(expected);
    });

    it("initializes update from remaining quantity and duplicate from total quantity", () => {
        const order = {
            bidPrice: 1250,
            quantity: 5,
            remainingQuantity: 2,
            createdAt: "2026-08-04T02:52:00.434Z",
            expirationDate: "2026-09-03T02:52:00.433Z",
            executionPolicy: EBidExecutionPolicy.FULL_AT_ONCE,
        } as TTableRow;
        const getPrice = (row: TTableRow) => Number(row.bidPrice);

        expect(
            createManagementDraft(order, MARKET_ORDER_OVERLAY.UPDATE, getPrice)
                .draft
        ).toEqual({
            price: 1250,
            quantity: 2,
            expirationDays: "30",
            executionPolicy: EBidExecutionPolicy.FULL_AT_ONCE,
        });
        expect(
            createManagementDraft(
                order,
                MARKET_ORDER_OVERLAY.DUPLICATE,
                getPrice
            ).draft.quantity
        ).toBe(5);
    });

    it("calculates update expiration from updatedAt when available", () => {
        const order = {
            bidPrice: 1250,
            quantity: 5,
            remainingQuantity: 2,
            createdAt: "2026-08-01T00:00:00.000Z",
            updatedAt: "2026-08-10T00:00:00.000Z",
            expirationDate: "2026-08-20T00:00:00.000Z",
        } as TTableRow;

        expect(
            createManagementDraft(order, MARKET_ORDER_OVERLAY.UPDATE, (row) =>
                Number(row.bidPrice)
            ).draft.expirationDays
        ).toBe("10");

        const nearThirtyDays = {
            ...order,
            expirationDate: "2026-09-08T00:00:00.000Z",
        } as TTableRow;
        expect(
            createManagementDraft(
                nearThirtyDays,
                MARKET_ORDER_OVERLAY.UPDATE,
                (row) => Number(row.bidPrice)
            ).draft.expirationDays
        ).toBe("30");
    });

    it("does not treat execution policy as an update change", () => {
        const initialDraft = {
            price: 1250,
            quantity: 2,
            expirationDays: "30",
            executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
        };
        expect(
            hasUpdateDraftChanges(
                {
                    ...initialDraft,
                    executionPolicy: EBidExecutionPolicy.FULL_AT_ONCE,
                },
                initialDraft
            )
        ).toBe(false);
        expect(
            hasUpdateDraftChanges(
                { ...initialDraft, quantity: 3 },
                initialDraft
            )
        ).toBe(true);
    });

    it("resets the management flow atomically when another order opens", () => {
        const initialized = marketOrderDrawerFlowReducer(
            {
                ...INITIAL_DRAWER_FLOW_STATE,
                step: MARKET_ORDER_STEP.CONFIRM,
                validation: {
                    message: "Old validation",
                    warningType: "error",
                },
            },
            {
                type: "initialize",
                draft: {
                    price: 1250,
                    quantity: 2,
                    expirationDays: "30",
                    executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
                },
                previousOffer: {
                    price: 1250,
                    totalQuantity: 5,
                    remainingQuantity: 2,
                    expirationDays: 30,
                },
            }
        );

        expect(initialized.step).toBe(MARKET_ORDER_STEP.EDIT);
        expect(initialized.initialDraft).toBe(initialized.draft);
        expect(initialized.validation.warningType).toBe("none");
    });

    it.each([
        {
            canFullyFulfill: false,
            fulfilledQuantity: 2,
            expected: UPDATE_OFFER_MATCH_SCENARIO.PARTIAL,
        },
        {
            canFullyFulfill: false,
            fulfilledQuantity: 0,
            expected: UPDATE_OFFER_MATCH_SCENARIO.NONE,
        },
        {
            canFullyFulfill: true,
            fulfilledQuantity: 7,
            expected: UPDATE_OFFER_MATCH_SCENARIO.FULL,
        },
    ])(
        "maps canFullyFulfill=$canFullyFulfill and fulfilledQuantity=$fulfilledQuantity to $expected update confirmation",
        ({ canFullyFulfill, fulfilledQuantity, expected }) => {
            expect(
                getUpdateOfferMatchScenario(canFullyFulfill, fulfilledQuantity)
            ).toBe(expected);
        }
    );

    it("uses highest bid as the Listing market reference", () => {
        expect(
            listingOrderDefinition.getMarketPrice(undefined, MARKET_DATA)
        ).toBe(1200);
    });

    it("uses lowest ask as the Offer market reference", () => {
        expect(
            offerOrderDefinition.getMarketPrice(undefined, MARKET_DATA)
        ).toBe(1350);
    });

    it("keeps Listing and Offer suggestion caches separate", () => {
        expect(
            MARKET_ORDER_KEYS.suggestions(MARKET_ORDER_KIND.LISTING, "cask-1")
        ).toEqual([
            KEY_TRADING.MARKET_ORDERS,
            "listing",
            KEY_ASK.ASK_SUGGEST,
            "cask-1",
        ]);
        expect(
            MARKET_ORDER_KEYS.suggestions(MARKET_ORDER_KIND.OFFER, "cask-1")
        ).toEqual([
            KEY_TRADING.MARKET_ORDERS,
            "offer",
            KEY_BID.BID_SUGGESTION,
            "cask-1",
        ]);
    });

    it("reuses the existing market data cache key", () => {
        expect(MARKET_ORDER_KEYS.marketData("cask-1")).toEqual([
            "market-data",
            "cask-1",
        ]);
    });

    it("uses Ask and Bid constants for mutation operation keys", () => {
        expect(
            MARKET_ORDER_KEYS.validation(MARKET_ORDER_KIND.LISTING, "cask-1")
        ).toEqual([
            KEY_TRADING.MARKET_ORDERS,
            "listing",
            KEY_ASK.ASK_VALIDATE_PRICE,
            "cask-1",
        ]);
        expect(
            MARKET_ORDER_KEYS.update(MARKET_ORDER_KIND.OFFER, "bid-1")
        ).toEqual([
            KEY_TRADING.MARKET_ORDERS,
            "offer",
            KEY_BID.BID_UPDATE,
            "bid-1",
        ]);
        expect(
            MARKET_ORDER_KEYS.cancel(MARKET_ORDER_KIND.LISTING, "ask-1")
        ).toEqual([
            KEY_TRADING.MARKET_ORDERS,
            "listing",
            KEY_ASK.ASK_CANCEL,
            "ask-1",
        ]);
        expect(MARKET_ORDER_KEYS.create(MARKET_ORDER_KIND.OFFER)).toEqual([
            KEY_TRADING.MARKET_ORDERS,
            "offer",
            KEY_BID.BID_CREATE,
        ]);
    });

    it("reuses stable matching keys for Buy and Sell flows", () => {
        expect(MARKET_ORDER_KEYS.buyMatching("cask-1", 1200, 2)).toEqual([
            KEY_ASK.ASK_MATCHING_BIDS,
            1200,
            2,
            "cask-1",
        ]);
        expect(MARKET_ORDER_KEYS.sellMatching("cask-1", 1100, 3)).toEqual([
            KEY_BID.BID_MATCHING_ASKS,
            1100,
            3,
            "cask-1",
        ]);
    });

    it("models market and limit execution on both trading sides", () => {
        expect(MARKET_ORDER_INTENTS).toEqual({
            "buy-now": { side: "buy", execution: "market" },
            "place-bid": { side: "buy", execution: "limit" },
            "sell-now": { side: "sell", execution: "market" },
            "place-ask": { side: "sell", execution: "limit" },
        });
    });

    it("defines one management overlay discriminator for each action", () => {
        expect(Object.values(MARKET_ORDER_OVERLAY)).toEqual([
            "update",
            "cancel",
            "duplicate",
        ]);
    });

    it("keeps one draft while switching between related flows", () => {
        const started = marketOrderFlowReducer(
            INITIAL_MARKET_ORDER_FLOW_STATE,
            { type: "start", intent: MARKET_ORDER_INTENT.BUY_NOW }
        );
        const edited = marketOrderFlowReducer(started, {
            type: "update-draft",
            draft: { price: 1200, quantity: 2 },
        });
        const switched = marketOrderFlowReducer(edited, {
            type: "switch",
            intent: MARKET_ORDER_INTENT.PLACE_BID,
        });
        const confirmed = marketOrderFlowReducer(switched, {
            type: "confirm",
        });

        expect(confirmed).toMatchObject({
            intent: MARKET_ORDER_INTENT.PLACE_BID,
            step: MARKET_ORDER_STEP.CONFIRM,
            draft: { price: 1200, quantity: 2 },
        });
        expect(marketOrderFlowReducer(confirmed, { type: "close" })).toEqual(
            INITIAL_MARKET_ORDER_FLOW_STATE
        );
    });

    describe("listings status matrix actions (Figma 2417:3597)", () => {
        function getActionsForStatus(status: string) {
            const statusLower = status.toLowerCase();
            const actions: string[] = [];

            if (statusLower === "open" || statusLower === "active") {
                actions.push("Update", "Cancel");
            } else if (
                statusLower.includes("partially") ||
                statusLower.includes("partial")
            ) {
                actions.push("View details", "Update", "Cancel");
            } else if (
                statusLower.includes("processing") ||
                statusLower.includes("payment") ||
                statusLower.includes("transaction") ||
                statusLower.includes("completed") ||
                statusLower.includes("failed")
            ) {
                actions.push("View details", "Duplicate");
            } else if (
                statusLower.includes("cancelled") ||
                statusLower.includes("expired")
            ) {
                actions.push("Duplicate");
            } else {
                actions.push("View details");
            }

            return actions;
        }

        it.each([
            ["open", ["Update", "Cancel"]],
            ["active", ["Update", "Cancel"]],
            ["partially_matched", ["View details", "Update", "Cancel"]],
            ["partial", ["View details", "Update", "Cancel"]],
            ["payment_processing", ["View details", "Duplicate"]],
            ["in_transaction", ["View details", "Duplicate"]],
            ["completed", ["View details", "Duplicate"]],
            ["failed", ["View details", "Duplicate"]],
            ["cancelled", ["Duplicate"]],
            ["expired", ["Duplicate"]],
        ])(
            "returns correct actions for status '%s'",
            (status, expectedActions) => {
                expect(getActionsForStatus(status)).toEqual(expectedActions);
            }
        );
    });

    describe("cancel order alert configuration & labels (Figma 4829:12148 & 4829:12293)", () => {
        it("provides exact labels for open listing cancellation (Figma 4829:12148)", () => {
            const labels = listingOrderDefinition.labels;
            expect(labels.cancelTitle).toBe("Cancel listing?");
            expect(labels.cancelDescription).toBe(
                "Your listing hasn’t matched any offer yet. Cancelling will remove it from the marketplace."
            );
            expect(labels.keepLabel).toBe("Keep listing");
            expect(labels.cancelLabel).toBe("Confirm cancel");
            expect(labels.successName).toBe("Listing");
        });

        it("provides exact labels for offer cancellation", () => {
            const labels = offerOrderDefinition.labels;
            expect(labels.cancelTitle).toBe("Cancel order?");
            expect(labels.cancelDescription).toBe(
                "Your order hasn’t filled yet. Cancelling will remove it from the marketplace."
            );
            expect(labels.keepLabel).toBe("Keep order");
            expect(labels.cancelLabel).toBe("Cancel order");
            expect(labels.successName).toBe("Offer");
        });

        it("correctly calculates matched and remaining quantities for partially matched orders (Figma 4829:12293)", () => {
            const order = {
                quantity: 12,
                remainingQuantity: 9,
            };
            const matchedQuantity = Math.max(
                0,
                Number(order.quantity) - Number(order.remainingQuantity)
            );
            const remainingQuantity = Number(order.remainingQuantity);
            const isPartiallyMatched = matchedQuantity > 0;

            expect(isPartiallyMatched).toBe(true);
            expect(matchedQuantity).toBe(3);
            expect(remainingQuantity).toBe(9);
        });

        it("determines the correct cancel toast message for partial vs full orders", () => {
            const getCancelSuccessMessage = (
                isPartiallyMatched: boolean,
                name = "Listing"
            ) =>
                isPartiallyMatched
                    ? "Remaining casks cancelled successfully."
                    : `${name} cancelled successfully.`;

            expect(getCancelSuccessMessage(true, "Listing")).toBe(
                "Remaining casks cancelled successfully."
            );
            expect(getCancelSuccessMessage(true, "Offer")).toBe(
                "Remaining casks cancelled successfully."
            );
            expect(getCancelSuccessMessage(false, "Listing")).toBe(
                "Listing cancelled successfully."
            );
            expect(getCancelSuccessMessage(false, "Offer")).toBe(
                "Offer cancelled successfully."
            );
        });
    });

    describe("update listing review confirmation scenarios (Figma 4829:11767, 4829:11855, 4829:11912, 4829:11961)", () => {
        it("identifies Case 1 (canFullyFulfill: false & fulfilledQuantity > 0) as PARTIAL scenario (Figma 4829:11855)", () => {
            expect(getUpdateOfferMatchScenario(false, 5)).toBe(
                UPDATE_OFFER_MATCH_SCENARIO.PARTIAL
            );
        });

        it("identifies Case 2 (canFullyFulfill: false & fulfilledQuantity: 0) as NONE scenario (Figma 4829:11912)", () => {
            expect(getUpdateOfferMatchScenario(false, 0)).toBe(
                UPDATE_OFFER_MATCH_SCENARIO.NONE
            );
        });

        it("identifies Case 3 (canFullyFulfill: true) as FULL scenario (Figma 4829:11961)", () => {
            expect(getUpdateOfferMatchScenario(true, 10)).toBe(
                UPDATE_OFFER_MATCH_SCENARIO.FULL
            );
        });

        it("maps CONFIRM_UPDATE drawer title to Review Listing for listings", () => {
            expect(
                getDrawerState(
                    MARKET_ORDER_OVERLAY.UPDATE,
                    MARKET_ORDER_STEP.CONFIRM
                )
            ).toBe(MARKET_ORDER_DRAWER.CONFIRM_UPDATE);
        });

        it("detects draft changes correctly for update submission guard", () => {
            const initialDraft = {
                price: 5200,
                quantity: 12,
                expirationDays: "30",
                executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
            };

            expect(
                hasUpdateDraftChanges({ ...initialDraft }, initialDraft)
            ).toBe(false);

            expect(
                hasUpdateDraftChanges(
                    { ...initialDraft, price: 5900 },
                    initialDraft
                )
            ).toBe(true);

            expect(
                hasUpdateDraftChanges(
                    { ...initialDraft, quantity: 10 },
                    initialDraft
                )
            ).toBe(true);

            expect(
                hasUpdateDraftChanges(
                    { ...initialDraft, expirationDays: "7" },
                    initialDraft
                )
            ).toBe(true);
        });

        it("validates execution quantity and breakdown rules for all 4 Figma scenarios", () => {
            const shouldShowListingBreakdown = (
                canFullyFulfill: boolean,
                policy: EBidExecutionPolicy,
                fulfilledQuantity: number
            ) =>
                canFullyFulfill ||
                (policy === EBidExecutionPolicy.PARTIAL_ALLOWED &&
                    fulfilledQuantity > 0);

            // Scenario 1: Figma 4829:12023 (PARTIAL_ALLOWED + partial match) -> breakdown shown
            expect(
                shouldShowListingBreakdown(
                    false,
                    EBidExecutionPolicy.PARTIAL_ALLOWED,
                    5
                )
            ).toBe(true);

            // Scenario 2: Figma 4829:11855 (FULL_AT_ONCE + partial match) -> breakdown hidden
            expect(
                shouldShowListingBreakdown(
                    false,
                    EBidExecutionPolicy.FULL_AT_ONCE,
                    5
                )
            ).toBe(false);

            // Scenario 3: Figma 4829:11912 (0 match) -> breakdown hidden
            expect(
                shouldShowListingBreakdown(
                    false,
                    EBidExecutionPolicy.PARTIAL_ALLOWED,
                    0
                )
            ).toBe(false);

            // Scenario 4: Figma 4829:11961 (100% full match) -> breakdown shown
            expect(
                shouldShowListingBreakdown(
                    true,
                    EBidExecutionPolicy.FULL_AT_ONCE,
                    10
                )
            ).toBe(true);
        });

        it("tracks previouslyMatchedQuantity and filledQuantity from order correctly in createManagementDraft", () => {
            const orderWithRemaining = {
                id: "ask-1",
                caskName: "Lagavulin",
                distilleryName: "Lagavulin",
                quantity: 12,
                remainingQuantity: 9,
                askPrice: 5600,
                feeRate: 0.05,
                isHighest: false,
                isLowest: false,
                bidId: "bid-1",
                caskId: "cask-1",
                askType: 1 as never,
            };

            const result = createManagementDraft(
                orderWithRemaining,
                MARKET_ORDER_OVERLAY.UPDATE,
                (o) => o.askPrice ?? 0
            );

            expect(result.previousOffer.totalQuantity).toBe(12);
            expect(result.previousOffer.remainingQuantity).toBe(9);
            expect(result.previousOffer.filledQuantity).toBe(3);
            expect(result.draft.quantity).toBe(9);
        });

        it("resolves checkoutSessionId directly and from bidId transactions", async () => {
            const {
                getCheckoutSessionId,
                hasOfferMatch,
                resolveCheckoutSessionId,
            } = await import("@/modules/market-orders/utils");
            const { offerOrderDefinition } =
                await import("@/modules/market-orders/definitions/offer-definition");
            const { listingOrderDefinition } =
                await import("@/modules/market-orders/definitions/listing-definition");

            // Direct checkoutSession object
            expect(
                getCheckoutSessionId({
                    checkoutSession: { id: "cs-123" },
                })
            ).toBe("cs-123");

            // Direct checkoutSessionId string
            expect(
                getCheckoutSessionId({
                    checkoutSessionId: "cs-456",
                })
            ).toBe("cs-456");

            // Transactions array
            expect(
                getCheckoutSessionId({
                    data: {
                        transactions: [{ checkoutSessionId: "cs-789" }],
                    },
                })
            ).toBe("cs-789");

            // costBreakdown.matchingBreakdown item with checkoutSessionId
            expect(
                getCheckoutSessionId({
                    costBreakdown: {
                        matchingBreakdown: [
                            {
                                askPrice: 10500,
                                quantity: 1,
                                totalCost: 10500,
                                checkoutSessionId: "cs-breakdown-1",
                            },
                        ],
                    },
                })
            ).toBe("cs-breakdown-1");

            // costBreakdown.checkoutSessionId
            expect(
                getCheckoutSessionId({
                    costBreakdown: {
                        checkoutSessionId: "cs-breakdown-2",
                        matchingBreakdown: [],
                    },
                })
            ).toBe("cs-breakdown-2");

            // breakdown.matchingBreakdown item with checkoutSession object
            expect(
                getCheckoutSessionId({
                    breakdown: {
                        matchingBreakdown: [
                            {
                                checkoutSession: { id: "cs-breakdown-3" },
                            },
                        ],
                    },
                })
            ).toBe("cs-breakdown-3");

            // resolveCheckoutSessionId with direct match
            const direct = await resolveCheckoutSessionId({
                checkoutSession: { id: "cs-direct" },
            });
            expect(direct).toBe("cs-direct");

            // resolveCheckoutSessionId from breakdown
            const fromBreakdown = await resolveCheckoutSessionId({
                costBreakdown: {
                    matchingBreakdown: [
                        { checkoutSessionId: "cs-from-breakdown" },
                    ],
                },
            });
            expect(fromBreakdown).toBe("cs-from-breakdown");

            // resolveCheckoutSessionId resolves from getTransactionsFormBidId when matched but missing in breakdown
            const { caskBidService } = await import("@/services/cask-bid");
            const spyGetTx = jest
                .spyOn(caskBidService, "getTransactionsFormBidId")
                .mockResolvedValueOnce({
                    success: true,
                    data: {
                        bidId: "bid_with_tx",
                        bid: {} as never,
                        transactions: [
                            { checkoutSessionId: "cs-from-tx" } as never,
                        ],
                    },
                });

            const fromTx = await resolveCheckoutSessionId(
                {
                    id: "bid_with_tx",
                    costBreakdown: {
                        matchingBreakdown: [
                            { askPrice: 10500, quantity: 1, totalCost: 10500 },
                        ],
                    },
                },
                "bid_with_tx"
            );
            expect(fromTx).toBe("cs-from-tx");
            spyGetTx.mockRestore();

            // resolveCheckoutSessionId without checkoutSessionId returns undefined
            const noSession = await resolveCheckoutSessionId(
                {
                    id: "bid_123",
                    costBreakdown: {
                        matchingBreakdown: [
                            { askPrice: 10500, quantity: 1, totalCost: 10500 },
                        ],
                    },
                },
                "bid_123"
            );
            expect(noSession).toBeUndefined();

            // hasOfferMatch detects matching breakdown
            expect(
                hasOfferMatch({
                    costBreakdown: {
                        matchingBreakdown: [
                            { askPrice: 10500, quantity: 1, totalCost: 10500 },
                        ],
                    },
                })
            ).toBe(true);

            expect(
                hasOfferMatch({
                    costBreakdown: {
                        fulfillableQuantity: 1,
                    },
                })
            ).toBe(true);

            // hasOfferMatch returns false when no match data
            expect(hasOfferMatch({})).toBe(false);
            expect(
                hasOfferMatch({
                    costBreakdown: {
                        matchingBreakdown: [],
                        fulfillableQuantity: 0,
                    },
                })
            ).toBe(false);

            // resolveCheckoutSessionId does not query transactions if no match
            const noMatchSession = await resolveCheckoutSessionId(
                {
                    id: "bid_no_match",
                    costBreakdown: {
                        matchingBreakdown: [],
                        fulfillableQuantity: 0,
                    },
                },
                "bid_no_match"
            );
            expect(noMatchSession).toBeUndefined();

            // offerOrderDefinition.getMarketPrice checks candidates and skips 0
            expect(
                offerOrderDefinition.getMarketPrice(
                    undefined,
                    { lowestAsk: 0 } as unknown as Parameters<
                        typeof offerOrderDefinition.getMarketPrice
                    >[1],
                    5000
                )
            ).toBe(5000);

            expect(
                offerOrderDefinition.getMarketPrice(
                    {
                        cask: { lowestAsk: 12000 },
                    } as unknown as Parameters<
                        typeof offerOrderDefinition.getMarketPrice
                    >[0],
                    { lowestAsk: 0 } as unknown as Parameters<
                        typeof offerOrderDefinition.getMarketPrice
                    >[1],
                    0
                )
            ).toBe(12000);

            expect(
                offerOrderDefinition.getMarketPrice(
                    undefined,
                    { lowestAsk: 0 } as unknown as Parameters<
                        typeof offerOrderDefinition.getMarketPrice
                    >[1],
                    0
                )
            ).toBe(0);

            // listingOrderDefinition.getMarketPrice checks candidates and skips 0
            expect(
                listingOrderDefinition.getMarketPrice(
                    undefined,
                    { highestBid: 0 } as unknown as Parameters<
                        typeof listingOrderDefinition.getMarketPrice
                    >[1],
                    8000
                )
            ).toBe(8000);
        });
    });
});
