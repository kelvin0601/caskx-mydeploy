export enum CHECKOUT_STEP {
    DEPOSIT_PAYMENT = "deposit-payment",
    AGREEMENT_SIGNING = "agreement-signing",
    INVOICE_PAYMENT = "invoice-payment",
    OWNERSHIP_TRANSFER = "ownership-transfer",
    SELLER_CONFIRMATION = "seller-confirmation",
}

export enum PAYOUT_STEP {
    SIGN_RELEASE_FORM = "sign-release-form",
    LISTED_FOR_SALE = "listed-for-sale",
    TRANSACTION_COMPLETED = "transaction-completed",
}

export enum CHECKOUT_STATUS {
    PENDING = "pending",
    DEPOSIT_PAID = "deposit_paid",
    AGREEMENT_SIGNED = "agreement_signed",
    AGREEMENT_BUYER_SIGNED = "agreement_buyer_signed",
    INVOICE_PAID = "invoice_paid",
    INVOICE_SUBMITTED = "invoice_submitted",
    COMPLETED = "completed",
    DEPOSIT_EXPIRED = "deposit_expired",
    AGREEMENT_EXPIRED = "agreement_expired",
    INVOICE_EXPIRED = "invoice_expired",
    EXPIRED = "expired",
    CANCELLED = "cancelled",
}

export enum CHECKOUT_PAYMENT_METHOD {
    STRIPE = "stripe",
    MANUAL_TRANSFER = "manual_transfer",
    PAY_LATER = "pay_later",
}

export enum CHECKOUT_TYPE {
    ASK = "ASK",
    BID = "BID",
}

export enum CHECKOUT_DOCUMENT_TYPE {
    DEPOSIT_INVOICE = "deposit_invoice",
    DEPOSIT_RECEIPT = "deposit_receipt",
    BUYER_AGREEMENT = "buyer_agreement",
    SELLER_AGREEMENT = "seller_agreement",
    FINAL_INVOICE = "final_invoice",
    FINAL_RECEIPT = "final_receipt",
    OWNERSHIP_TRANSFER = "ownership_transfer",
    AGREEMENT = "agreement",
}
