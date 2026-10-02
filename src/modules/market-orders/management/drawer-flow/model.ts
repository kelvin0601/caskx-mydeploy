import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { getExpirationDays } from "@/lib/utils";
import type { TTableRow } from "@/types";
import {
    MARKET_ORDER_DRAWER,
    MARKET_ORDER_OVERLAY,
    MARKET_ORDER_STEP,
} from "../../constants";
import type { MarketOrderStep } from "../../flow/types";
import type { MarketOrderOverlay, OrderDraft } from "../../types";
import { getClosestExpirationDays } from "../../utils";

export type PreviousOffer = {
    price: number;
    totalQuantity: number;
    remainingQuantity: number;
    expirationDays: number;
    filledQuantity?: number;
};

type DrawerOverlay = Exclude<
    MarketOrderOverlay,
    typeof MARKET_ORDER_OVERLAY.CANCEL
>;

export function getDrawerState(overlay: DrawerOverlay, step: MarketOrderStep) {
    if (overlay === MARKET_ORDER_OVERLAY.UPDATE) {
        return step === MARKET_ORDER_STEP.CONFIRM
            ? MARKET_ORDER_DRAWER.CONFIRM_UPDATE
            : MARKET_ORDER_DRAWER.UPDATE;
    }
    return step === MARKET_ORDER_STEP.CONFIRM
        ? MARKET_ORDER_DRAWER.CONFIRM_DUPLICATE
        : MARKET_ORDER_DRAWER.DUPLICATE;
}

export function createManagementDraft(
    order: TTableRow,
    overlay: DrawerOverlay,
    getInitialPrice: (order: TTableRow) => number
): { draft: OrderDraft; previousOffer: PreviousOffer } {
    const rawFilledQuantity =
        "filledQuantity" in order && order.filledQuantity !== undefined
            ? Number(order.filledQuantity)
            : undefined;
    const remainingQuantity = Math.max(1, Number(order.remainingQuantity ?? 1));
    const totalQuantity = Math.max(
        remainingQuantity + (rawFilledQuantity ?? 0),
        Number(order.quantity ?? remainingQuantity)
    );
    const filledQuantity =
        rawFilledQuantity ?? Math.max(0, totalQuantity - remainingQuantity);
    const expirationDays = getClosestExpirationDays(
        getExpirationDays(
            order.updatedAt || order.createdAt,
            order.expirationDate ?? order.expiredAt
        )
    );
    const price = getInitialPrice(order);

    return {
        draft: {
            price,
            quantity:
                overlay === MARKET_ORDER_OVERLAY.UPDATE
                    ? remainingQuantity
                    : totalQuantity,
            expirationDays: expirationDays?.toString() ?? "",
            executionPolicy:
                order.executionPolicy ?? EBidExecutionPolicy.PARTIAL_ALLOWED,
        },
        previousOffer: {
            price,
            totalQuantity,
            remainingQuantity,
            expirationDays: expirationDays ?? 0,
            filledQuantity,
        },
    };
}

export function hasUpdateDraftChanges(
    draft: OrderDraft,
    initialDraft: OrderDraft
) {
    return (
        draft.price !== initialDraft.price ||
        draft.quantity !== initialDraft.quantity ||
        draft.expirationDays !== initialDraft.expirationDays
    );
}
