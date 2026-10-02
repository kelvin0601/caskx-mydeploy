import { QueryStatus, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

export default function useGetStateQuery<T>({
    key,
    fetchFn,
}: {
    key: unknown[];
    fetchFn?: () => Promise<T>;
}): {
    status?: QueryStatus;
    data: T | undefined;
    refetch: () => Promise<T | undefined>;
} {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<QueryStatus>("pending");
    const [data, setData] = useState<T | undefined>(() =>
        queryClient.getQueryData<T>(key)
    );

    useEffect(() => {
        const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
            // Compare the entire key array instead of just the first element
            if (
                event?.query?.queryKey &&
                JSON.stringify(event.query.queryKey) === JSON.stringify(key)
            ) {
                const state = queryClient.getQueryState(key);
                setStatus(state?.status || "pending");
                setData(queryClient.getQueryData<T>(key));
            }
        });

        return () => {
            unsubscribe(); // Unsubscribe from the query cache when the component unmounts
        };
    }, [key, queryClient]);

    // If there is no data in the cache, optionally fetch it using provided fetchFn
    useEffect(() => {
        const cached = queryClient.getQueryData<T>(key);
        if (!cached) {
            if (fetchFn) {
                queryClient.fetchQuery({
                    queryKey: key,
                    queryFn: fetchFn,
                });
            } else {
                // Attempt to refetch any existing query with same key
                queryClient.refetchQueries({ queryKey: key });
            }
        }
        // We intentionally exclude fetchFn from deps to avoid re-fetching on fn identity changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, queryClient]);

    const refetch = useMemo(() => {
        return async () => {
            const existing = queryClient.getQueryState(key);
            if (fetchFn) {
                try {
                    const res = await queryClient.fetchQuery({
                        queryKey: key,
                        queryFn: fetchFn,
                    });
                    return res as T;
                } catch {
                    return undefined;
                }
            }
            if (existing) {
                await queryClient.refetchQueries({ queryKey: key });
                return queryClient.getQueryData<T>(key);
            }
            return undefined;
        };
    }, [key, queryClient, fetchFn]);

    return {
        status: status,
        data,
        refetch,
    };
}
