import { useCallback, useMemo, useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

type NormalizeValueResult = string | number | boolean;

type UseFormChangeDetectorOptions<
    TFieldValues extends FieldValues,
    TKeys extends keyof TFieldValues = keyof TFieldValues,
> = {
    form: UseFormReturn<TFieldValues>;
    compareFields: TKeys[];
    fileFields?: TKeys[];
};

type UseFormChangeDetectorReturn<TFieldValues extends FieldValues> = {
    hasFormChanged: boolean;
    setInitialSnapshot: (values: TFieldValues) => void;
    computeHasChanges: (values: Partial<TFieldValues>) => boolean;
    getChangedValues: (values: Partial<TFieldValues>) => Partial<TFieldValues>;
};

const normalizeValue = (value: unknown): NormalizeValueResult => {
    if (value instanceof File) {
        return value.name;
    }

    if (value === undefined || value === null || value === "") {
        return "";
    }

    if (typeof value === "number" || typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        return value.trim();
    }

    return JSON.stringify(value) || "";
};

export function useFormChangeDetector<TFieldValues extends FieldValues>({
    form,
    compareFields,
    fileFields = [],
}: UseFormChangeDetectorOptions<TFieldValues>): UseFormChangeDetectorReturn<TFieldValues> {
    const [initialSnapshot, setInitialSnapshot] = useState<TFieldValues | null>(
        null
    );
    const watchedValues = form?.watch();

    const computeHasChanges = useCallback(
        (currentValues: Partial<TFieldValues>) => {
            if (!initialSnapshot) return false;

            const fieldChanged = compareFields.some((field) => {
                return (
                    normalizeValue(currentValues[field]) !==
                    normalizeValue(initialSnapshot[field])
                );
            });

            const fileChanged = fileFields.some((field) => {
                const currentValue = currentValues[field] as unknown;
                const initialValue = initialSnapshot[field] as unknown;

                if (currentValue instanceof File) {
                    return true;
                }

                return (
                    normalizeValue(currentValue) !==
                    normalizeValue(initialValue)
                );
            });
            return fieldChanged || fileChanged;
        },
        [compareFields, fileFields, initialSnapshot]
    );

    const getChangedValues = useCallback(
        (currentValues: Partial<TFieldValues>) => {
            if (!initialSnapshot) return {};

            const changed: Partial<TFieldValues> = {};

            compareFields.forEach((field) => {
                if (
                    normalizeValue(currentValues[field]) !==
                    normalizeValue(initialSnapshot[field])
                ) {
                    changed[field] = currentValues[field];
                }
            });

            fileFields.forEach((field) => {
                const currentValue = currentValues[field] as unknown;
                const initialValue = initialSnapshot[field] as unknown;

                if (
                    currentValue instanceof File ||
                    normalizeValue(currentValue) !==
                        normalizeValue(initialValue)
                ) {
                    changed[field] = currentValues[field];
                }
            });

            return changed;
        },
        [compareFields, fileFields, initialSnapshot]
    );

    const hasFormChanged = useMemo(
        () => computeHasChanges(watchedValues),
        [computeHasChanges, watchedValues]
    );

    return {
        hasFormChanged,
        setInitialSnapshot: setInitialSnapshot,
        computeHasChanges,
        getChangedValues,
    };
}
