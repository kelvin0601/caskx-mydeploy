import { useMutationState } from "@tanstack/react-query";

export default function useGetMutationState<T, E = Error>({
    key,
}: {
    key: unknown[];
}) {
    const data = useMutationState({
        filters: { mutationKey: key },
        select: (mutation) => ({
            status: mutation.state.status,
            data: mutation.state.data as T,
            error: mutation.state.error as E | null,
        }),
    });
    return data[data.length - 1];
}
