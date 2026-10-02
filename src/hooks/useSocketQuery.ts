import { webSocketClient } from "@/config/tanstack";

import { UseQueryOptions, useQuery } from "@tanstack/react-query";

export const useSocketQuery = <
    TData = unknown,
    TError = {
        status: number;
        statusCode: number;
        message: string;
    },
    TQueryKey extends readonly unknown[] = readonly unknown[],
>(
    options: UseQueryOptions<TData, TError, TData, TQueryKey>
) => {
    return useQuery(options, webSocketClient);
};
