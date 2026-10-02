export enum EBidExecutionPolicy {
    PARTIAL_ALLOWED = "partial_allowed", // Take partial, wait for rest
    FULL_AT_ONCE = "full_at_once", // Wait for full quantity
}
