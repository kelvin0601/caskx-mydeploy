declare namespace discount {
    type TDiscountResponse = {
        isValid: boolean;
        message: string;
        discountCode: {
            id: string;
            code: string;
            discountType: string;
            discountValue: string;
            minimumOrderValue: string;
            maximumDiscountValue: string;
        };
        discountAmount: number;
        finalAmount: number;
        reservationId: string;
        expiresAt: string;
    };
}
