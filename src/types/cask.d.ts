import { TUserSchema } from "./auth";
import { caskMaster } from "./cask-master";
import { TDistillery } from "./distillery";
import { global } from "./global/global";
import { region } from "./region";

declare namespace cask {
    export type TCask = {
        masterId: string;
        caskReference: string;
        name: string;
        distillery: TDistillery;
        distilleryId: string;
        distillationDate: string;
        status?: "inactive" | "active";
        master?: caskMaster.TCaskMaster;
        priceReference: string;
        vintageYear?: number | string | null;
        age?: number;
        expectedMaturityDate: string | null;
        highestBid?: number | null;
        lowestAsk?: number | null;
        totalActiveBids?: number;
        ola?: string | null;
        rla?: string | null;
        abv?: string | null;
        estimatedBottleCount?: number | string | null;
        initialValuation?: number | string;
        currency?: string;
        isVerified: boolean;
        verificationDate: string | null;
        isListed: boolean;
        listingDate: string | null;
        caskStatus: CaskStatus;
        description: string;
        tastingNotes: string | null;
        storageLocation: string | null;
        imageUrl: string;
        caskTypeId: string;
        caskType: TCaskType;
        classificationId?: string;
        classification: string;
        classificationLabel?: string;
        spiritType?: TSpiritType;
        region: region.TRegion;
        regionId: string;
        spiritTypeId?: string;
        verifications?: TCaskVerification[];
        readyToSell: boolean;
        priceHistory?: TCaskPriceHistory[];
        owner?: TUserSchema;
        referencePriceMin: number;
        referencePriceMax: number;
        viewCount: number;
        ownerId: string | null;
        bottleVolume?: number | string | null;
    } & global.TDataWithFields;

    export type TClassification = {
        name: string;
        description: string | null;
    } & global.TDataWithFields;
    export type TSpiritType = {
        name: string;
        description: string | null;
    } & global.TDataWithFields;
    export type TCaskType = {
        name: string;
        id: string;
        typicalCapacityLiters: null | string;
        description: string | null;
    } & global.TDataWithFields;
    export type TCaskRangeType = {
        abv: { min: string; max: string };
        estimatedBottleCount: { min: string; max: string };
        ola: { min: string; max: string };
        price: { min: string; max: string };
        rla: { min: string; max: string };
        vintageYear: { min: string; max: string };
    };
    export type TCaskSort = {
        name: string;
        value: string;
        defaultOrder: string;
        description: string;
    };
    export type CaskCreateInput = Omit<
        TCask,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "verifications"
        | "priceHistory"
        | "distillery"
        | "caskType"
        | "classification"
        | "region"
        | "spiritType"
        | "owner"
    > & {
        distilleryId: string;
        caskTypeId: string;
        classificationId: string;
        regionId: string;
        spiritTypeId: string;
        ownerId?: string | null;
    };
    export type TCaskPriceHistory = TCask & {
        price: number;
        currency: string;
        volumeLiters: number;
    };

    export type TCaskVerification = TCask & {
        verificationDate: Date | null;
        verifiedBy: string;
        verificationReport: string;
        nextVerificationDate: Date;
        isVerified: boolean;
    };

    export enum CaskStatus {
        ACTIVE = "active",
        SOLD = "sold",
        RESERVED = "reserved",
        WITHDRAWN = "withdrawn",
        BOTTLED = "bottled",
    }
    export type TCaskFilterCask = {
        label?: string;
        value?: string;
        id?: string;
        type: TCaskFilter;
    };

    export type TCaskFilter = string;
    export type TCaskPermitter = {
        Definitions: string[];
        "Permit Data": [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            string,
            number,
        ][];
    };
    export type TMarket = {
        caskId: string;
        cask: TCask;
        price: number;
        currency: string;
        volumeLiters: number;
    };
}
