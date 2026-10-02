import { cn, pluralize } from "@/lib/utils";
import React from "react";
import {
    UPDATE_OFFER_MATCH_SCENARIO,
    UpdateOfferMatchScenario,
} from "../update-offer-confirmation/scenario";

export type FulfillmentBehaviorProps = {
    isPartialAllowed: boolean;
    fulfilledQuantity: number;
    remainingOpenQuantity: number;
    matchScenario: UpdateOfferMatchScenario;
    feeNote?: string;
    className?: string;
};

export default function FulfillmentBehavior({
    isPartialAllowed,
    fulfilledQuantity,
    remainingOpenQuantity,
    matchScenario,
    feeNote = "A 5% processing fee is included upon match.",
    className,
}: FulfillmentBehaviorProps) {
    const isPartial = matchScenario === UPDATE_OFFER_MATCH_SCENARIO.PARTIAL;
    const isNone = matchScenario === UPDATE_OFFER_MATCH_SCENARIO.NONE;

    const policyIntro = isPartialAllowed
        ? "Your listing was set to automatically match available quantities."
        : "Your listing was set to wait for the full quantity before matching.";

    return (
        <section className={cn("flex flex-col gap-2", className)}>
            <h3 className="text-sm font-semibold text-typo-primary">
                Fulfillment behavior
            </h3>
            <div className="flex flex-col gap-1 text-sm text-typo-soft">
                <p>{policyIntro}</p>

                {isPartial && isPartialAllowed && (
                    <>
                        <p>If confirmed:</p>
                        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-typo-soft">
                            <li>
                                <span className="font-semibold text-typo-primary">
                                    {fulfilledQuantity}
                                </span>{" "}
                                additional{" "}
                                {pluralize(fulfilledQuantity, "cask")} will be
                                matched immediately
                            </li>
                            <li>
                                <span className="font-semibold text-typo-primary">
                                    {remainingOpenQuantity}
                                </span>{" "}
                                {pluralize(remainingOpenQuantity, "cask")} will
                                remain open until expiration
                            </li>
                        </ul>
                    </>
                )}

                {isPartial && !isPartialAllowed && (
                    <>
                        <p>
                            Because only {fulfilledQuantity} of the remaining{" "}
                            {remainingOpenQuantity} casks are currently
                            available:
                        </p>
                        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm text-typo-soft">
                            <li>No additional casks will be matched now</li>
                            <li>
                                The remaining {remainingOpenQuantity}{" "}
                                {pluralize(remainingOpenQuantity, "cask")} will
                                stay active until expiration
                            </li>
                        </ul>
                    </>
                )}

                {isNone && (
                    <p>
                        The remaining {remainingOpenQuantity}{" "}
                        {pluralize(remainingOpenQuantity, "cask")} will stay
                        active until expiration.
                    </p>
                )}

                {feeNote ? <p>{feeNote}</p> : null}
            </div>
        </section>
    );
}
