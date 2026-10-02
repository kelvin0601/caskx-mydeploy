export enum ETransactionType {
    FULL = "Full",
    PARTIAL = "Partial",
}

export enum ETransactionStatus {
    ACTIVE = "active",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired",
    PENDING = "pending",
    TRANSACTION = "in_transaction",
    HOLDING = "holding",
    FOR_SALE = "for_sale",
    INVOICE_SUBMITTED = "invoice_submitted",
}
export enum ETransactionOnGoingStatus {
    DEPOSIT = "deposit_payment",
    AGREEMENT = "agreement_signing",
    AGREEMENT_SIGNED = "agreement_signed",
    PAYMENT = "invoice_payment",
    PAYMENT_PAID = "invoice_paid",
    OWNERSHIP_TRANSFER = "ownership_transfer",
}
export enum ETransactionHistoryStatus {
    COMPLETED = "Completed",
    CANCELLED = "Cancelled",
    FAILED = "Failed",
}
export enum EBadgeVariant {
    SUCCESS = "success",
    COMPLETE = "complete",
    STATIC = "static",
    WARNING = "warning",
    TRANSACTION = "progressing",
    PENDING = "pending",
    DESTRUCTIVE = "destructive",
}
