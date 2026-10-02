// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

import axiosInstance from "@/config/axios";
import { caskAskService } from "@/services/cask-ask";
import { caskBidService } from "@/services/cask-bid";
import { marketOrderService } from "@/services/market-order";
import { EBidExecutionPolicy } from "@/enum/cask-bid";
import {
    KEY_ASK,
    KEY_BID,
    KEY_TRADING,
    PATH_ASK,
    PATH_BID,
    PATH_MARKET_ORDER,
} from "@/lib/constants";
import { marketOrder } from "@/types/market-order";
import { caskBid } from "@/types/cask-bid";
import { caskAsk } from "@/types/cask-ask";

// Mock axiosInstance
jest.mock("@/config/axios", () => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
}));

const mockAxios = axiosInstance as jest.Mocked<typeof axiosInstance>;

describe("Trading & Order Cases (Buy, Place Bid, Sell, Place Ask)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
    });

    // =========================================================================
    // 1. BUY / BUY NOW CASES
    // =========================================================================
    describe("BUY / Buy Now Cases", () => {
        it("should successfully execute a Buy Now market order", async () => {
            const buyNowData: marketOrder.TBuyNowRequest = {
                caskId: "cask-123",
                displayedPrice: 1500,
                quantity: 2,
                executionPolicy: EBidExecutionPolicy.FULL_AT_ONCE,
                expirationDays: 30,
            };

            const mockResponse: marketOrder.TMarketOrderResult = {
                id: "order-buy-001",
                bidId: "bid-001",
                bidPrice: 1500,
                quantity: 2,
                cask: { id: "cask-123", title: "Macallan 18" } as any,
                status: "COMPLETED",
                expirationDate: "2026-08-22T10:00:00Z",
                immediateMatches: [],
                matchSummary: {} as any,
                matchingSummary: {} as any,
            };

            mockAxios.post.mockResolvedValueOnce({ data: mockResponse });

            const result = await marketOrderService.buyNow(buyNowData);

            expect(mockAxios.post).toHaveBeenCalledTimes(1);
            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.BUY_NOW}`,
                buyNowData
            );
            expect(result).toEqual(mockResponse);
            expect(result.id).toBe("order-buy-001");
            expect(result.bidPrice).toBe(1500);
        });

        it("should handle error when Buy Now fails (e.g. price mismatch or out of stock)", async () => {
            const buyNowData: marketOrder.TBuyNowRequest = {
                caskId: "cask-out-of-stock",
                displayedPrice: 2000,
                quantity: 5,
            };

            const mockError = {
                response: {
                    status: 400,
                    data: {
                        message:
                            "Requested quantity not available at this price",
                    },
                },
                isAxiosError: true,
            };

            mockAxios.post.mockRejectedValueOnce(mockError);

            await expect(marketOrderService.buyNow(buyNowData)).rejects.toEqual(
                {
                    message: "Requested quantity not available at this price",
                }
            );
            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.BUY_NOW}`,
                buyNowData
            );
        });

        it("should fetch current price prior to executing Buy Now", async () => {
            const caskId = "cask-123";
            const mockPriceData: marketOrder.TGetCurrentPriceResponse = {
                lowestAsk: 1450,
                highestBid: 1400,
                spread: 50,
                lastUpdated: "2026-07-22T10:00:00Z",
            };

            mockAxios.get.mockResolvedValueOnce({ data: mockPriceData });

            const priceRes = await marketOrderService.getCurrentPrice({
                caskId,
            });

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.CURRENT_PRICE}/${caskId}`
            );
            expect(priceRes.lowestAsk).toBe(1450);
            expect(priceRes.highestBid).toBe(1400);
        });

        it("should confirm price change before executing buy", async () => {
            const confirmData: marketOrder.TConfirmPriceRequest = {
                confirmationId: "conf-123",
                accept: true,
            };

            const mockConfirmResult: marketOrder.TMarketOrderResult = {
                id: "order-buy-002",
                bidId: "bid-002",
                bidPrice: 1480,
                quantity: 1,
                cask: { id: "cask-123" } as any,
                status: "CONFIRMED",
                expirationDate: "2026-08-22T10:00:00Z",
                immediateMatches: [],
                matchSummary: {} as any,
                matchingSummary: {} as any,
            };

            mockAxios.post.mockResolvedValueOnce({ data: mockConfirmResult });

            const result = await marketOrderService.confirmPrice(confirmData);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.CONFIRM_PRICE}`,
                confirmData
            );
            expect(result.bidPrice).toBe(1480);
        });
    });

    // =========================================================================
    // 2. PLACE BID (OFFER) CASES
    // =========================================================================
    describe("PLACE BID (Offer) Cases", () => {
        it("should successfully place a new bid (offer)", async () => {
            const bidData: caskBid.TCaskBidCreateReq = {
                caskId: "cask-456",
                bidPrice: 1200,
                quantity: 3,
                executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
                expirationDays: 14,
            };

            const mockBidResult: caskBid.TCaskBidCreateRes = {
                id: "bid-999",
                bidPrice: 1200,
                quantity: 3,
                caskId: "cask-456",
                status: "ACTIVE",
                createdAt: "2026-07-22T10:00:00Z",
                expiresAt: "2026-08-05T10:00:00Z",
            } as any;

            mockAxios.post.mockResolvedValueOnce({ data: mockBidResult });

            const result = await caskBidService.createCaskBids(bidData);

            expect(mockAxios.post).toHaveBeenCalledTimes(1);
            expect(mockAxios.post).toHaveBeenCalledWith(PATH_BID, bidData);
            expect(result.id).toBe("bid-999");
            expect(result.bidPrice).toBe(1200);
            expect(result.quantity).toBe(3);
        });

        it("should validate bid price before submitting a bid", async () => {
            const validateData = { caskId: "cask-456", bidAmount: 1100 };
            const mockValidationRes: caskBid.TCaskBidValidate = {
                isValid: true,
                suggestedRange: { min: 1000, max: 1500 },
                message: "Bid price is within acceptable range",
            } as any;

            mockAxios.post.mockResolvedValueOnce({ data: mockValidationRes });

            const validation =
                await caskBidService.validatePriceBid(validateData);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_BID}/${KEY_BID.BID_VALIDATE}`,
                validateData
            );
            expect(validation.isValid).toBe(true);
        });

        it("should update an existing active bid", async () => {
            const bidId = "bid-999";
            const updatePayload = {
                bidPrice: 1250,
                remainingQuantity: 4,
                expirationDays: 30,
            };

            const mockUpdateRes: caskBid.TCaskBidCreateRes = {
                id: bidId,
                bidPrice: 1250,
                quantity: 4,
                status: "ACTIVE",
            } as any;

            mockAxios.put.mockResolvedValueOnce({ data: mockUpdateRes });

            const result = await caskBidService.updateBid(bidId, updatePayload);

            expect(mockAxios.put).toHaveBeenCalledWith(
                `${PATH_BID}/${bidId}`,
                updatePayload
            );
            expect(result.bidPrice).toBe(1250);
            expect(result.quantity).toBe(4);
        });

        it("should cancel an active bid", async () => {
            const bidId = "bid-999";
            const mockCancelRes = {
                message: "Bid cancelled successfully",
                bidId: "bid-999",
            };

            mockAxios.delete.mockResolvedValueOnce({ data: mockCancelRes });

            const res = await caskBidService.cancelBid(bidId);

            expect(mockAxios.delete).toHaveBeenCalledWith(
                `${PATH_BID}/${bidId}/${KEY_BID.BID_CANCEL}`
            );
            expect(res.bidId).toBe("bid-999");
            expect(res.message).toContain("cancelled");
        });

        it("should calculate bid price breakdown including processing fees", async () => {
            const calcReq: caskBid.TCalculateBidPriceRequest = {
                caskId: "cask-456",
                price: 1200,
                quantity: 2,
                orderType: "BID",
            } as any;

            const mockCalcRes: caskBid.TCalculateBidPriceResponse = {
                subtotal: 2400,
                processingFeeAmount: 120,
                processingFeePercent: 5,
                totalAmount: 2520,
            } as any;

            mockAxios.post.mockResolvedValueOnce({ data: mockCalcRes });

            const res = await caskBidService.calculateBidPrice(calcReq);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_BID}/${KEY_BID.BID_CALCULATE_PRICE}`,
                {
                    ...calcReq,
                    price: 1200,
                    orderType: "BID",
                }
            );
            expect(res.totalAmount).toBe(2520);
        });

        it("should fetch user's active bids with filters", async () => {
            const filters = { status: "ACTIVE", page: 1, limit: 10 };
            const mockBidsRes = {
                data: [{ id: "b1", bidPrice: 1000 }],
                total: 1,
            };

            mockAxios.get.mockResolvedValueOnce({ data: mockBidsRes });

            const res = await caskBidService.getMyBids(filters as any);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_BID}/${KEY_BID.BID_MY_BIDS}/filtered`,
                { params: filters }
            );
            expect(res).toEqual(mockBidsRes);
        });

        it("should fetch bid market data for a cask", async () => {
            const caskId = "cask-456";
            const mockMarketData: caskBid.TCaskBidMarketData = {
                caskId,
                highestBid: 1200,
                lowestAsk: 1350,
                lowestBid: 900,
                totalActiveAsks: 5,
                totalActiveBids: 8,
                totalTransactions: 12,
            };

            mockAxios.get.mockResolvedValueOnce({ data: mockMarketData });

            const data = await caskBidService.getCaskBidMarketData(caskId);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_BID}/${KEY_BID.BID_MARKET_DATA}/${caskId}`
            );
            expect(data.highestBid).toBe(1200);
            expect(data.lowestAsk).toBe(1350);
        });

        it("should generate or retrieve checkout session ID for bid creation", () => {
            const sessionId = caskBidService.getOrCreateSessionId();

            expect(sessionId).toBeDefined();
            expect(sessionId).toContain("checkout_");
            expect(sessionStorage.getItem("checkoutSessionId")).toBe(sessionId);

            // Subsequent call should return the exact same session ID
            const secondSessionId = caskBidService.getOrCreateSessionId();
            expect(secondSessionId).toBe(sessionId);
        });
    });

    // =========================================================================
    // 3. SELL / SELL NOW CASES
    // =========================================================================
    describe("SELL / Sell Now Cases", () => {
        it("should successfully execute a Sell Now market order", async () => {
            const sellNowData: marketOrder.TSellNowRequest = {
                caskId: "cask-789",
                displayedPrice: 1800,
                quantity: 1,
            };

            const mockSellResult: marketOrder.TMarketOrderResult = {
                id: "order-sell-001",
                bidId: "ask-001",
                bidPrice: 1800,
                quantity: 1,
                cask: { id: "cask-789", title: "Laphroaig 25" } as any,
                status: "COMPLETED",
                expirationDate: "2026-08-22T10:00:00Z",
                immediateMatches: [],
                matchSummary: {} as any,
                matchingSummary: {} as any,
            };

            mockAxios.post.mockResolvedValueOnce({ data: mockSellResult });

            const result = await marketOrderService.sellNow(sellNowData);

            expect(mockAxios.post).toHaveBeenCalledTimes(1);
            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.SELL_NOW}`,
                sellNowData
            );
            expect(result.id).toBe("order-sell-001");
            expect(result.bidPrice).toBe(1800);
        });

        it("should handle error when Sell Now fails (e.g. unverified seller account)", async () => {
            const sellNowData: marketOrder.TSellNowRequest = {
                caskId: "cask-789",
                displayedPrice: 1800,
                quantity: 1,
            };

            const mockError = {
                response: {
                    status: 403,
                    data: { message: "Seller KYC verification incomplete" },
                },
                isAxiosError: true,
            };

            mockAxios.post.mockRejectedValueOnce(mockError);

            await expect(
                marketOrderService.sellNow(sellNowData)
            ).rejects.toEqual({
                message: "Seller KYC verification incomplete",
            });
            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_MARKET_ORDER}/${KEY_TRADING.SELL_NOW}`,
                sellNowData
            );
        });
    });

    // =========================================================================
    // 4. PLACE ASK (LISTING) CASES
    // =========================================================================
    describe("PLACE ASK (Listing) Cases", () => {
        it("should successfully place a new ask listing", async () => {
            const askData: caskAsk.TPlaceAskRequest = {
                caskId: "cask-101",
                askPrice: 2100,
                quantity: 2,
                executionPolicy: EBidExecutionPolicy.FULL_AT_ONCE,
                expirationDays: 30,
            };

            const mockAskResult: marketOrder.TMarketOrderResult = {
                id: "ask-200",
                bidId: "ask-200",
                bidPrice: 2100,
                quantity: 2,
                cask: { id: "cask-101", title: "Bowmore 18" } as any,
                status: "ACTIVE",
                expirationDate: "2026-08-22T10:00:00Z",
                immediateMatches: [],
                matchSummary: {} as any,
                matchingSummary: {} as any,
            };

            mockAxios.post.mockResolvedValueOnce({ data: mockAskResult });

            const result = await caskAskService.createAsk(askData);

            expect(mockAxios.post).toHaveBeenCalledTimes(1);
            expect(mockAxios.post).toHaveBeenCalledWith(PATH_ASK, askData);
            expect(result.id).toBe("ask-200");
            expect(result.bidPrice).toBe(2100);
            expect(result.quantity).toBe(2);
        });

        it("should validate ask price before listing", async () => {
            const caskId = "cask-101";
            const askPrice = 2100;
            const mockValidationRes: caskAsk.TAskValidatePriceResponse = {
                isValid: true,
                minRecommendedPrice: 1900,
                maxRecommendedPrice: 2500,
                message: "Ask price is valid",
            } as any;

            mockAxios.get.mockResolvedValueOnce({ data: mockValidationRes });

            const validation = await caskAskService.validateAskPrice(
                caskId,
                askPrice
            );

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_ASK}/${KEY_ASK.ASK_VALIDATE_PRICE}/${caskId}?askPrice=${askPrice}`
            );
            expect(validation.isValid).toBe(true);
        });

        it("should update an existing ask listing", async () => {
            const askId = "ask-200";
            const updatePayload: caskAsk.TUpdateAskRequest = {
                askPrice: 2050,
                quantity: 2,
                expirationDays: 30,
            };

            const mockUpdateResult: marketOrder.TMarketOrderResult = {
                id: askId,
                bidId: askId,
                bidPrice: 2050,
                quantity: 2,
                cask: { id: "cask-101" } as any,
                status: "ACTIVE",
                expirationDate: "2026-08-22T10:00:00Z",
                immediateMatches: [],
                matchSummary: {} as any,
                matchingSummary: {} as any,
            };

            mockAxios.put.mockResolvedValueOnce({ data: mockUpdateResult });

            const result = await caskAskService.updateAsk(askId, updatePayload);

            expect(mockAxios.put).toHaveBeenCalledWith(
                `${PATH_ASK}/${askId}`,
                updatePayload
            );
            expect(result.bidPrice).toBe(2050);
        });

        it("should cancel an active ask listing", async () => {
            const askId = "ask-200";
            const mockCancelRes = {
                message: "Ask listing cancelled",
                askId: "ask-200",
            };

            mockAxios.delete.mockResolvedValueOnce({ data: mockCancelRes });

            const res = await caskAskService.cancelAsk(askId);

            expect(mockAxios.delete).toHaveBeenCalledWith(
                `${PATH_ASK}/${askId}/${KEY_ASK.ASK_CANCEL}`
            );
            expect(res.askId).toBe("ask-200");
            expect(res.message).toContain("cancelled");
        });

        it("should calculate ask price breakdown including seller payouts", async () => {
            const calcReq: caskAsk.TCalculateAskPriceRequest = {
                caskId: "cask-101",
                price: 2100,
                quantity: 2,
            } as any;

            const mockCalcRes: caskAsk.TCalculateAskPriceResponse = {
                subtotal: 4200,
                processingFeeAmount: 210,
                processingFeePercent: 5,
                totalAmount: 3990,
            } as any;

            mockAxios.post.mockResolvedValueOnce({ data: mockCalcRes });

            const res = await caskAskService.calculateAskPrice(calcReq);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_ASK}/${KEY_ASK.ASK_CALCULATE_PRICE}`,
                calcReq
            );
            expect(res.totalAmount).toBe(3990);
        });

        it("should fetch lowest ask for a given cask", async () => {
            const caskId = "cask-101";
            const mockAskOrder: caskAsk.TCaskOrder = {
                id: "ask-min",
                askPrice: 1950,
                quantity: 1,
                caskId,
            } as any;

            mockAxios.get.mockResolvedValueOnce({ data: mockAskOrder });

            const lowest = await caskAskService.getLowestAsk(caskId);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_ASK}/${KEY_ASK.ASK_LOWEST}/${caskId}`
            );
            expect(lowest?.askPrice).toBe(1950);
        });

        it("should fetch matching bids for ask fulfillment", async () => {
            const queryParams = {
                caskId: "cask-101",
                maxBidAmount: 2200,
                desiredQuantity: 2,
            };

            const mockMatchingRes: caskAsk.TMatchingBidsResponse = {
                matchingAsks: [
                    {
                        id: "b-1",
                        caskId: "cask-101",
                        sellerId: "s-1",
                        askPrice: 2150,
                        currency: "USD",
                        quantity: 2,
                        remainingQuantity: 2,
                        executionPolicy:
                            EBidExecutionPolicy.FULL_AT_ONCE as any,
                        status: "ACTIVE",
                        expirationDate: "2026-08-22T10:00:00Z",
                        createdAt: "2026-07-22T10:00:00Z",
                        updatedAt: "2026-07-22T10:00:00Z",
                    },
                ],
                fulfillmentSummary: {
                    canFullyFulfill: true,
                    desiredQuantity: 2,
                    fulfilledQuantity: 2,
                },
            } as any;

            mockAxios.get.mockResolvedValueOnce({ data: mockMatchingRes });

            const res = await caskAskService.getMatchingBids(queryParams);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_ASK}/${KEY_ASK.ASK_MATCHING_BIDS}?maxBidAmount=${queryParams.maxBidAmount}&caskId=${queryParams.caskId}&desiredQuantity=${queryParams.desiredQuantity}`
            );
            expect(res.fulfillmentSummary.canFullyFulfill).toBe(true);
        });

        it("should handle error when placing ask with invalid price", async () => {
            const askData: caskAsk.TPlaceAskRequest = {
                caskId: "cask-101",
                askPrice: -500, // Invalid price
                quantity: 1,
            };

            const mockError = {
                response: {
                    status: 400,
                    data: { message: "Ask price must be greater than zero" },
                },
                isAxiosError: true,
            };

            mockAxios.post.mockRejectedValueOnce(mockError);

            await expect(caskAskService.createAsk(askData)).rejects.toEqual({
                message: "Ask price must be greater than zero",
            });
            expect(mockAxios.post).toHaveBeenCalledWith(PATH_ASK, askData);
        });
    });

    // =========================================================================
    // 5. ADVANCED & EDGE CASES (Partial Matches, Price Slippage, Bulk Actions)
    // =========================================================================
    describe("ADVANCED & EDGE CASES (Partial Matches, Price Slippage, Bulk Actions)", () => {
        it("should handle partial sell order execution with remainder listing created", async () => {
            const sellNowData: marketOrder.TSellNowRequest = {
                caskId: "cask-partial-1",
                displayedPrice: 1500,
                quantity: 5,
            };

            const mockPartialSellRes: marketOrder.TMarketOrderResult = {
                id: "sell-order-partial-1",
                bidId: "bid-part-1",
                bidPrice: 1500,
                quantity: 5,
                cask: { id: "cask-partial-1" } as any,
                status: "PARTIALLY_FILLED",
                expirationDate: "2026-08-22T10:00:00Z",
                immediateMatches: [],
                matchSummary: {
                    totalMatchedQuantity: 3,
                    remainingQuantity: 2,
                    totalMatchableCost: 4500,
                    averageMatchPrice: 1500,
                },
                matchingSummary: {
                    totalMatchedQuantity: 3,
                    remainingQuantity: 2,
                    totalMatchableCost: 4500,
                    averageMatchPrice: 1500,
                },
                remainderOrder: {
                    orderId: "ask-remainder-999",
                    quantity: 2,
                    price: 1500,
                    expiryDays: 30,
                },
            };

            mockAxios.post.mockResolvedValueOnce({ data: mockPartialSellRes });

            const result = await marketOrderService.sellNow(sellNowData);

            expect(result.matchSummary.totalMatchedQuantity).toBe(3);
            expect(result.matchSummary.remainingQuantity).toBe(2);
            expect(result.remainderOrder?.orderId).toBe("ask-remainder-999");
        });

        it("should detect market price slippage on current price check", async () => {
            const caskId = "cask-slippage";
            const initialPrice = 1000;

            const mockCurrentPriceRes: marketOrder.TGetCurrentPriceResponse = {
                lowestAsk: 1050, // Price moved up by 50
                highestBid: 980,
                spread: 70,
                lastUpdated: "2026-07-22T10:05:00Z",
            };

            mockAxios.get.mockResolvedValueOnce({ data: mockCurrentPriceRes });

            const priceCheck = await marketOrderService.getCurrentPrice({
                caskId,
            });

            expect(priceCheck.lowestAsk).not.toEqual(initialPrice);
            expect(priceCheck.lowestAsk).toBe(1050);
        });

        it("should bulk cancel multiple active bids", async () => {
            const bidIds = ["bid-1", "bid-2", "bid-3"];
            const mockBulkRes = {
                cancelled: ["bid-1", "bid-2"],
                failed: [{ bidId: "bid-3", reason: "Already filled" }],
                summary: {
                    totalRequested: 3,
                    successfullyCancelled: 2,
                    failed: 1,
                },
            };

            mockAxios.post.mockResolvedValueOnce({ data: mockBulkRes });

            const res = await caskBidService.bulkCancelBids(bidIds);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_BID}/bulk-cancel`,
                { bidIds }
            );
            expect(res.summary.successfullyCancelled).toBe(2);
            expect(res.cancelled).toEqual(["bid-1", "bid-2"]);
        });

        it("should bulk cancel multiple active ask listings", async () => {
            const askIds = ["ask-1", "ask-2"];
            const mockBulkRes: caskAsk.TBulkCancelAsksResponse = {
                cancelled: ["ask-1", "ask-2"],
                failed: [],
                summary: {
                    totalRequested: 2,
                    successfullyCancelled: 2,
                    failed: 0,
                },
            } as any;

            mockAxios.post.mockResolvedValueOnce({ data: mockBulkRes });

            const res = await caskAskService.bulkCancelAsks(askIds);

            expect(mockAxios.post).toHaveBeenCalledWith(
                `${PATH_ASK}/bulk-cancel`,
                { askIds }
            );
            expect(res.cancelled).toEqual(["ask-1", "ask-2"]);
        });

        it("should fetch competitive bidding analysis for a cask", async () => {
            const caskId = "cask-comp-1";
            const mockAnalysis = {
                currentBids: [{ price: 1200, quantity: 2, daysActive: 3 }],
                biddingStats: {
                    totalBidders: 5,
                    averageBid: 1150,
                    highestBid: 1250,
                    medianBid: 1180,
                },
                recommendations: {
                    competitive: 1220,
                    aggressive: 1260,
                    conservative: 1100,
                },
                winningChances: {
                    competitive: 75,
                    aggressive: 95,
                    conservative: 30,
                },
            };

            mockAxios.get.mockResolvedValueOnce({ data: mockAnalysis });

            const res = await caskBidService.getCompetitiveBidding(caskId);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_BID}/competitive-analysis/${caskId}`
            );
            expect(res.biddingStats.highestBid).toBe(1250);
            expect(res.winningChances.aggressive).toBe(95);
        });

        it("should fetch competitive ask analysis for seller pricing decisions", async () => {
            const caskId = "cask-comp-ask";
            const mockAskAnalysis: caskAsk.TCompetitiveAnalysisResponse = {
                currentAsks: [],
                priceDistribution: {} as any,
                recommendations: {
                    competitive: 1800,
                    aggressive: 1850,
                    conservative: 1750,
                } as any,
                marketInsights: {} as any,
            };

            mockAxios.get.mockResolvedValueOnce({ data: mockAskAnalysis });

            const res = await caskAskService.getCompetitiveAnalysis(caskId);

            expect(mockAxios.get).toHaveBeenCalledWith(
                `${PATH_ASK}/${KEY_ASK.ASK_ANALYST}/${caskId}`
            );
            expect(res.recommendations.competitive).toBe(1800);
        });
    });
});
