export const UPDATE_OFFER_MATCH_SCENARIO = {
    PARTIAL: "partial",
    NONE: "none",
    FULL: "full",
} as const;

export type UpdateOfferMatchScenario =
    (typeof UPDATE_OFFER_MATCH_SCENARIO)[keyof typeof UPDATE_OFFER_MATCH_SCENARIO];

export function getUpdateOfferMatchScenario(
    canFullyFulfill: boolean,
    fulfilledQuantity: number
): UpdateOfferMatchScenario {
    if (canFullyFulfill) return UPDATE_OFFER_MATCH_SCENARIO.FULL;
    if (fulfilledQuantity > 0) return UPDATE_OFFER_MATCH_SCENARIO.PARTIAL;
    return UPDATE_OFFER_MATCH_SCENARIO.NONE;
}
