import {
    ETransactionHistoryStatus,
    ETransactionOnGoingStatus,
    ETransactionStatus,
    ETransactionType,
} from "@/enum/transaction";
import React from "react";

export type TAnyTransactionStatus =
    | ETransactionStatus
    | ETransactionOnGoingStatus
    | ETransactionHistoryStatus;

export type TColumn = {
    key: string;
    label: string | (() => React.ReactNode);
};

export type TTableConfig = {
    columns: TColumn[];
    gridCols: string;
};

export type TTableRow = {
    cask?: cask.TCask;
    master?: caskMaster.TCaskMaster;
    caskName: string;
    vintageYear?: number | string | null;
    id: string;
    caskImage?: string;
    imageSrc?: string;
    isHighest: boolean;
    isLowest: boolean;
    distilleryName: string;
    bidId: string;
    caskId: string;
    feeRate: number;
    currency?: string;
    remainingQuantity: number;
    quantity: number;
    filledQuantity?: number;
    askPrice?: number;
    bidPrice?: number;
    price?: number;
    total?: number;
    totalValue?: number;
    totalPaid?: number;
    hasMatches?: boolean;
    processingFee?: number;
    createdAt?: string;
    updatedAt?: string;
    expiredAt?: string;
    subtotal?: number;
    expirationDate?: string;
    executionPolicy?: EBidExecutionPolicy;
    bidType?: ETransactionType;
    askType: ETransactionType;
    status?:
        | ETransactionStatus
        | ETransactionOnGoingStatus
        | ETransactionHistoryStatus;
    imageSrc?: string;
};
