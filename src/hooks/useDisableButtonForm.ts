import { FieldValues, UseFormReturn } from "react-hook-form";

export const useDisableButtonForm = <T extends FieldValues>(
    form: UseFormReturn<T>,
    optionalFields?: string[]
) => {
    const values = form.getValues();

    return !Object.entries(values).every(([key, value]) => {
        const isOptionalField = optionalFields?.includes(key);
        if (isOptionalField) {
            return true;
        }

        return value !== undefined && value !== "" && value !== null;
    });
};
