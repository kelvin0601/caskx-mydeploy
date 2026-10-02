/**
 * Transaction status options with labels
 * Used for dropdowns, filters, and display purposes
 */
export const TRANSACTION_STATUS_OPTIONS = [
    { value: "pending", label: "Pending" },
    { value: "deposit_paid", label: "Deposit Paid" },
    { value: "agreement_signed", label: "Agreement Signed" },
    { value: "invoice_submitted", label: "Invoice Submitted" },
    { value: "invoice_paid", label: "Invoice Paid" },
    { value: "completed", label: "Completed" },
    { value: "expired", label: "Expired" },
    { value: "cancelled", label: "Cancelled" },
] as const;

/**
 * Helper function to get status label by value
 */
export function getTransactionStatusLabel(status: string): string | undefined {
    return TRANSACTION_STATUS_OPTIONS.find((option) => option.value === status)
        ?.label;
}

/**
 * Helper function to get status label with fallback
 * Falls back to formatted status string if not found
 */
export function getTransactionStatusLabelWithFallback(status: string): string {
    return (
        getTransactionStatusLabel(status) ||
        status
            ?.split("_")
            ?.join(" ")
            ?.replace(/\b\w/g, (l) => l.toUpperCase())
    );
}
