import { UseFormSetError, FieldValues, Path } from "react-hook-form";

/**
 * Sets form errors from API error response
 * @param error - The error object from API (expected to have message: string[])
 * @param form - The react-hook-form setError function
 * @param options - Optional configuration
 * @param options.capitalizeFirstLetter - Whether to capitalize the first letter of error message (default: true)
 */
export function setFormErrors<T extends FieldValues>(
    error: unknown,
    form: {
        setError: UseFormSetError<T>;
    },
    options?: {
        capitalizeFirstLetter?: boolean;
    }
): {
    haveError: boolean;
} {
    const capitalizeFirstLetter = options?.capitalizeFirstLetter ?? true;

    const errorSplit = (error as { message: string[] })?.message;

    if (!Array.isArray(errorSplit)) {
        return { haveError: false };
    }

    errorSplit.forEach((errorString: string) => {
        if (!errorString || typeof errorString !== "string") {
            return;
        }
        const fieldForm = errorString.split(" ")[0] as Path<T>;
        const errorStringFormatted = capitalizeFirstLetter
            ? errorString.charAt(0).toUpperCase() + errorString.slice(1)
            : errorString;

        form.setError(fieldForm, {
            message: errorStringFormatted,
        });
    });
    return { haveError: true };
}
