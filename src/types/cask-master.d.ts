import { region } from "@/types";
import { cask } from "./cask";
import { distillery } from "./distillery";
import { global } from "./global/global";

declare namespace caskMaster {
    type TCaskMasterBase = {
        id: string;
        name: string;
        imageUrl: string | null;
        distilleryId: string;
        caskTypeId: string;
        regionId: string;
        classification: string;
        classificationLabel: string;
        status: string;
        childCount: number;
        lowestAsk: number | null;
        highestBid: number | null;
        askCount: number;
        bidCount: number;
        marketInterest: number;
        maxAbv: number | null;
        maxRla: number | null;
        minReferencePrice: number;
        maxReferencePrice: number;
        viewCount: number;
        createdAt: string;
        updatedAt: string;
        price?: number;
        distilleryName?: string;
        categoryLabel?: string;
        latestListingDate?: string;
        lowestAskPrev30D?: number | null;
        lowestAskDelta30D?: number | null;
        lifetimeVolume?: number;
        volumeDelta30D?: number;
        medianPrice?: number;
        medianPriceDelta30D?: number;
        latestActiveAt?: string;
        purchaseAvailability?: number;
        minVintageYear?: number;
        maxVintageYear?: number;
        isTrending?: boolean;
        peatLevels?: string | null;
        activeBidsCount?: number | null;
        salesCount30D?: number | null;
        demandScore?: number | null;
    } & global.TDataWithFields;

    export type TCaskMaster = TCaskMasterBase & {
        distillery: distillery.TDistillery;
        caskType: cask.TCaskType;
        region: region.TRegion;
        establishedYear?: number;
        children?: cask.TCask[];
    };

    export type TSimilarCaskMaster = {
        id: string;
        name: string;
        imageUrl: string | null;
        caskTypeName: string;
        classificationLabel: string;
        distilleryName: string;
        floorPrice: number | null;
        lowestAsk: number | null;
        maxVintageYear: number | null;
        minReferencePrice: number;
        minVintageYear: number | null;
        purchaseAvailability: number;
        regionName: string;
        similarityScore: number;
    };

    export type TCaskMasterCreateInput = {
        name: string;
        distilleryId: string;
        caskTypeId: string;
        classification: string;
        regionId: string;
        imageUrl: string;
        status?: string;
        image?: File;
    };

    export type TCaskMasterUpdateInput = TCaskMasterCreateInput;

    // Master data embedded in a `children` cask object
    type TCaskChildMaster = {
        id: string;
        name: string;
        distilleryId: string;
        distillery: distillery.TDistillery;
        caskTypeId: string;
        caskType: cask.TCaskType;
        regionId: string;
        region: region.TRegion;
        classification: string;
        classificationLabel: string;
    };

    export type TCaskChild = cask.TCask & {
        masterId: string;
        lowestAsk: number;
        highestBid: number;
        master: TCaskChildMaster;
    };

    export type TCaskMasterWithChildren = TCaskMasterBase & {
        distillery: distillery.TDistillery;
        caskType: cask.TCaskType;
        region: region.TRegion;
        children: TCaskChild[];
    };

    export type TReorderCasksInput = {
        caskIds: string[];
    };

    export type TReorderCasksResponse = {
        caskMaster: TCaskMasterWithChildren;
    };
}
