import { useEffect } from "react";
import { useSocketQuery } from "./useSocketQuery";
import { UseQueryResult } from "@tanstack/react-query";

export const useConnectSocket = <T>({
    onConnect,
    onDisconnect,
    onUpdate,
    key,
}: {
    key: string;
    onConnect: () => void;
    onUpdate: () => void;
    onDisconnect: () => void;
}): UseQueryResult<T, Error> => {
    const query = useSocketQuery({
        queryKey: ["socket", key],
        queryFn: onUpdate,
    });
    useEffect(() => {
        onConnect?.();

        return () => {
            onDisconnect?.();
        };
    }, []);

    return query as UseQueryResult<T, Error>;
};
