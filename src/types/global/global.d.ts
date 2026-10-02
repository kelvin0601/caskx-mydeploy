export declare namespace global {
    type TDataWithPagination<T> = {
        data: T;
        totalRecords: number;
        page: number;
        totalPages: number;
        size: number;
    };
    type TDataRecentlyViewed<T> = {
        [key: string]: T;
    };

    type TDataWithFields = {
        id: string;
        createdAt: string;
        updatedAt: string;
    };
    type TPlaceholderType =
        | "image"
        | "cask"
        | "user"
        | "distillery"
        | "classification";
    type TParticipantStatus = "completed" | "pending" | "expired";
}
