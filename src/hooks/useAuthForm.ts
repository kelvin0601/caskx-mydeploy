import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useDisableButtonForm } from "./useDisableButtonForm";

type UseAuthFormOptions<T extends FieldValues, R> = {
    form: UseFormReturn<T>;
    mutationFn: (data: T) => Promise<R>;
    mutationKey?: string[];
    onSuccess?: (d: R) => void;
    onError?: (error: unknown) => void;
    invalidateQueries?: string[][];
    optionalFields?: string[];
};

export function useAuthForm<T extends FieldValues, R = unknown>({
    form,
    mutationFn,
    mutationKey,
    onSuccess,
    onError,
    invalidateQueries,
    optionalFields,
}: UseAuthFormOptions<T, R>) {
    const queryClient = useQueryClient();
    const isDisabled = useDisableButtonForm(form, optionalFields);

    const mutation = useMutation({
        mutationKey,
        mutationFn,
        onSuccess: async (data) => {
            if (invalidateQueries) {
                await Promise.all(
                    invalidateQueries.map((key) =>
                        queryClient.invalidateQueries({ queryKey: key })
                    )
                );
            }
            onSuccess?.(data);
        },
        onError: (error) => {
            onError?.(error);
        },
    });

    const handleSubmit = form.handleSubmit((data) => {
        mutation.mutate(data);
    });

    return {
        form,
        isDisabled,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        mutate: mutation.mutate,
        reset: mutation.reset,
        handleSubmit,
    };
}
