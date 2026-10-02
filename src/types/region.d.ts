import { global } from "./global/global";

declare namespace region {
    export type TRegion = {
        country: string;
        description: string;
        name: string;
        count?: number;
    } & global.TDataWithFields;

    export type TRegionCreateInput = Omit<
        TRegion & {
            subRegion: string;
            climate: string;
            terroir: string;
        },
        "id" | "createdAt" | "updatedAt"
    >;
}
