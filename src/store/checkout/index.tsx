"use client";

import { EBidExecutionPolicy } from "@/enum/cask-bid";
import { CHECKOUT_TYPE } from "@/enum/checkout";
import { checkout } from "@/types/checkout";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

type TContext = {
    subTotal: number;
    quantity: number;
    isValidatePrice: boolean;
    typeCheckout: "ASK" | "BID";
    priceRaw: number;
    priceCaskCurrent: number;
    discountSelected: discount.TDiscountResponse | null;
    priceSale: number;
    sessionId: string;
    isOpenPopup: boolean;
    popupCurrent: {
        title: string;
        status?: string;
        description: string;
        buttonText?: string;
    };
    discountPrice: number;
    statusTransaction: checkout.TTransactionStatus | null;
    expirationDays: number;
    executionPolicy: EBidExecutionPolicy;
    reset: () => void;
    setDiscountPrice: (discountPrice: number) => void;
    setStatusTransaction: (
        statusTransaction: checkout.TTransactionStatus
    ) => void;
    setExpirationDays: (expirationDays: number) => void;
    setExecutionPolicy: (executionPolicy: EBidExecutionPolicy) => void;
    setPriceRaw: (priceRaw: number) => void;
    setPriceCaskCurrent: (priceBid: number) => void;
    setIsOpenPopup: (isOpenPopup: boolean) => void;
    setPopupCurrent: (popupCurrent: {
        title: string;
        description: string;
        status?: string;
        buttonText?: string;
    }) => void;
    setPriceSale: (priceSale: number) => void;
    setSubTotal: (subTotal: number) => void;
    setQuantity: (quantity: number) => void;
    setDiscountSelected: (
        discountSelected: discount.TDiscountResponse | null
    ) => void;
    setSessionId: (sessionId: string) => void;
    setIsValidatePrice: (isValidatePrice: boolean) => void;
    setTypeCheckout: (typeCheckout: CHECKOUT_TYPE) => void;
};

const initialState: TContext = {
    isValidatePrice: false,
    typeCheckout: "ASK",
    quantity: 1,
    priceCaskCurrent: 0,
    subTotal: 0,
    priceRaw: 0,
    sessionId: "",
    isOpenPopup: false,
    popupCurrent: {
        title: "",
        description: "",
        status: "",
    },
    discountSelected: null,
    priceSale: 0,
    discountPrice: 0,
    statusTransaction: null,
    expirationDays: 30,
    executionPolicy: EBidExecutionPolicy.PARTIAL_ALLOWED,
    reset: () => {},
    setStatusTransaction: () => {},
    setDiscountPrice: () => {},
    setExpirationDays: () => {},
    setExecutionPolicy: () => {},
    setPriceRaw: () => {},
    setPriceCaskCurrent: () => {},
    setPriceSale: () => {},
    setQuantity: () => {},
    setDiscountSelected: () => {},
    setSubTotal: () => {},
    setIsOpenPopup: () => {},
    setPopupCurrent: () => {},
    setSessionId: () => {},
    setIsValidatePrice: () => {},
    setTypeCheckout: () => {},
};
export const CheckoutContext = createContext<TContext>(initialState);

export const useCheckout = () => {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error(
            "useCaskDetail must be used within a CaskDetailProvider"
        );
    }
    return context;
};
export const PROCESSING_FEE = 5 / 100;

export function CheckoutProvider({
    children,
    initialStatus,
    initialSessionId,
}: {
    children: React.ReactNode;
    initialStatus?: checkout.TTransactionStatus | null;
    initialSessionId?: string;
}) {
    const [subTotal, setSubTotal] = useState(0);
    const [statusTransaction, setStatusTransaction] =
        useState<checkout.TTransactionStatus | null>(initialStatus || null);
    const [quantity, setQuantity] = useState(1);
    const [priceSale, setPriceSale] = useState(0);
    const [priceRaw, setPriceRaw] = useState(0);
    const [priceCaskCurrent, setPriceCaskCurrent] = useState(0);
    const [isValidatePrice, setIsValidatePrice] = useState(false);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [sessionId, setSessionId] = useState(initialSessionId || "");
    const [isOpenPopup, setIsOpenPopup] = useState(false);
    const [typeCheckout, setTypeCheckout] = useState<CHECKOUT_TYPE>(
        CHECKOUT_TYPE.BID
    );
    const [expirationDays, setExpirationDays] = useState<number>(30);
    const [executionPolicy, setExecutionPolicy] = useState<EBidExecutionPolicy>(
        EBidExecutionPolicy.PARTIAL_ALLOWED
    );

    const [popupCurrent, setPopupCurrent] = useState<{
        title: string;
        status?: string;
        description: string;
    }>({
        title: "",
        status: "",
        description: "",
    });
    const [discountSelected, setDiscountSelected] =
        useState<discount.TDiscountResponse | null>(null);

    const reset = useCallback(() => {
        setDiscountSelected(null);
        setPriceSale(0);
        setPriceRaw(0);
        // setPriceCaskCurrent(0);
        // setSubTotal(0);
        // setQuantity(1);

        setDiscountPrice(0);
        setIsValidatePrice(false);
        setExpirationDays(30);
        setExecutionPolicy(EBidExecutionPolicy.PARTIAL_ALLOWED);
    }, []);

    useEffect(() => {
        const raw = Number(priceCaskCurrent) * quantity;
        const discount = Number(discountSelected?.discountAmount) || 0;
        const fee = raw * PROCESSING_FEE;
        setPriceRaw(raw);
        setDiscountPrice(discount);
        setPriceSale(fee);
        setSubTotal(
            typeCheckout === CHECKOUT_TYPE.ASK
                ? raw - discount - fee
                : raw - discount + fee
        );
    }, [quantity, priceCaskCurrent, discountSelected, typeCheckout]);

    return (
        <CheckoutContext.Provider
            value={{
                reset,
                subTotal,
                priceRaw,
                priceCaskCurrent,
                setPriceCaskCurrent,
                discountPrice,
                setDiscountPrice,
                expirationDays,
                setExpirationDays,
                typeCheckout,
                setTypeCheckout,
                executionPolicy,
                setExecutionPolicy,
                setIsOpenPopup,
                setPopupCurrent,
                priceSale,
                isValidatePrice,
                setIsValidatePrice,
                setPriceRaw,
                sessionId,
                statusTransaction,
                setStatusTransaction,
                setSessionId,
                isOpenPopup,
                popupCurrent,
                setSubTotal: setSubTotal,
                discountSelected,
                setDiscountSelected,
                quantity,
                setQuantity,
                setPriceSale,
            }}
        >
            {children}
        </CheckoutContext.Provider>
    );
}
