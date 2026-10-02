import { global } from "./global/global";

declare namespace caskType {
    export type TCaskType = {
        name: string;
        typicalCapacityLiters?: string | null;
        description?: string;
        count?: number;
        status?: "active" | "inactive";
    } & global.TDataWithFields;

    export type TCaskTypeCreateInput = {
        name: string;
        typicalCapacityLiters?: string;
        description?: string;
        status?: "active" | "inactive";
    };

    export type TCaskTypeUpdateInput = Partial<TCaskTypeCreateInput>;
}
