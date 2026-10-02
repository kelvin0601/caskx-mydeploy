import { QueryCache, QueryClient } from "@tanstack/react-query";

const queryClientConfig = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30000,
            refetchOnWindowFocus: true,
            retry: 3,
            refetchOnReconnect: true,
        },
    },
});

const webSocketClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity,
        },
    },
});

const queryCache = new QueryCache({
    onError: (error) => {
        console.log(error);
    },
    onSuccess: (data) => {
        console.log(data);
    },
    onSettled: (data, error) => {
        console.log(data, error);
    },
});

export { queryCache, queryClientConfig, webSocketClient };
