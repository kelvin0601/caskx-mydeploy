import { cask } from "./cask";
import { global } from "./global/global";
declare namespace distillery {
    export type TDistillery = {
        description: string;
        name: string;
        region: string;
        status: string;
        website: string | null;
        imageUrl: string | null;
        caskCount: number;
        summary: string;
        casks?: Array<cask.TCask>;
        caskMasters?: Array<caskMaster.TCaskMaster>;
        company: string | null;
        country: string;
        establishedYear: number | null;
        id: string;
        isVerified: boolean;
        rank: number;
    } & global.TDataWithFields;

    export type TTopDistillery = {
        distilleryId: string;
        distilleryName: string;
        distilleryImageUrl: string;
        masterCaskCount: number;
        rank: number;
        lifetimeVolume: number;
        medianPrice: number | null;
        estMarketValue: number | null;
        estMedianPrice: number | null;
        volumeDelta30D: number | null;
        medianPriceDelta30D: number | null;
        isTrending?: boolean;
    };

    export type TDistilleryFilter = {
        label?: string;
        value?: string;
        id?: string;
        type: string;
    };
}
