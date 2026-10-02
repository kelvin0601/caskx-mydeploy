export { default as QuantityControls } from "./QuantityControl";
export { default as CaskHeader } from "./ControlHeader";
export {
    default as SuggestionCards,
    CardSuggestion,
    CardSuggestionSkeleton,
} from "./SuggestionCards";
export { default as BidControls } from "./BidControl";
export { default as AskControls } from "./AskControl";
// Export types
export type { TQuantityControlsProps } from "./QuantityControl";
export type { TCaskHeaderProps } from "./ControlHeader";
export type { TSuggestionCardsProps, TSuggestionItem } from "./SuggestionCards";
export type { TBidControlsProps } from "./BidControl";
export type { TAskControlsProps } from "./AskControl";

// Shared validate types
export type TWarningType = "warning" | "error" | "none";
export type TErrorMessage = {
    message: string;
    warningType?: TWarningType;
};
export type TValidatePrice = (
    price: number,
    cb?: (message: string, warningType?: TWarningType) => void
) => void;
