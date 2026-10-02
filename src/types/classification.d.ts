import { global } from "./global/global";

declare namespace classification {
    export type TClassification = {
        value: string;
        label: string;
        description?: string;
        status?: "active" | "inactive";
        imageUrl?: string | null;
    } & global.TDataWithFields;

    export type TClassificationCreateInput = {
        label: string;
        description?: string;
        status?: "active" | "inactive";
        image?: File;
    };

    export type TClassificationUpdateInput =
        Partial<TClassificationCreateInput>;

    export type TClassificationBrowse = {
        classificationId: string;
        label: string;
        imageUrl: string | null;
        masterCaskCount: number;
        lifetimeVolume: number;
        medianPrice: number | null;
        estMarketValue: number | null;
        estMedianPrice: number | null;
        volumeDelta30D: number | null;
        medianPriceDelta30D: number | null;
        isTrending: boolean;
    };
}
