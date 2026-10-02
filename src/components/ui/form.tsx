"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import {
    Controller,
    ControllerProps,
    FieldError,
    FieldPath,
    FieldValues,
    FormProvider,
    useFormContext,
    useFormState,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
    name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
    {} as FormFieldContextValue
);

const FormField = <
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
    ...props
}: ControllerProps<TFieldValues, TName>) => {
    return (
        <FormFieldContext.Provider value={{ name: props.name }}>
            <Controller {...props} />
        </FormFieldContext.Provider>
    );
};

const useFormField = () => {
    const fieldContext = React.useContext(FormFieldContext);
    const itemContext = React.useContext(FormItemContext);
    const formContext = useFormContext();

    if (!fieldContext || !formContext) {
        return {
            id: itemContext?.id,
            name: fieldContext?.name,
            formItemId: itemContext?.id
                ? `${itemContext.id}-form-item`
                : undefined,
            formDescriptionId: itemContext?.id
                ? `${itemContext.id}-form-item-description`
                : undefined,
            formMessageId: itemContext?.id
                ? `${itemContext.id}-form-item-message`
                : undefined,
            error: undefined,
            isDirty: false,
            isTouched: false,
            invalid: false,
        };
    }

    const { getFieldState, formState } = formContext;

    const fieldState = getFieldState(fieldContext.name, formState);

    const { id } = itemContext;

    return {
        id,
        name: fieldContext.name,
        formItemId: `${id}-form-item`,
        formDescriptionId: `${id}-form-item-description`,
        formMessageId: `${id}-form-item-message`,
        ...fieldState,
    };
};

type FormItemContextValue = {
    id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue
);

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    const id = React.useId();

    return (
        <FormItemContext.Provider value={{ id }}>
            <div
                ref={ref}
                className={cn("space-y-2 mb:space-y-[0.375rem]", className)}
                {...props}
            />
        </FormItemContext.Provider>
    );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
    React.ElementRef<typeof Label>,
    React.ComponentPropsWithoutRef<typeof Label>
>(({ className, ...props }, ref) => {
    const { error, formItemId } = useFormField();

    return (
        <Label
            ref={ref}
            className={cn(error && "text-destructive", className)}
            htmlFor={formItemId}
            {...props}
        />
    );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
    React.ElementRef<typeof Slot>,
    React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
    const { error, formItemId, formDescriptionId, formMessageId } =
        useFormField();

    return (
        <Slot
            ref={ref}
            id={formItemId}
            aria-describedby={
                !error
                    ? `${formDescriptionId}`
                    : `${formDescriptionId} ${formMessageId}`
            }
            aria-invalid={!!error}
            {...props}
        />
    );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    const { formDescriptionId } = useFormField();

    return (
        <p
            ref={ref}
            id={formDescriptionId}
            className={cn("text-sm text-muted-foreground", className)}
            {...props}
        />
    );
});
FormDescription.displayName = "FormDescription";

const FormRootError = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    const { errors } = useFormState();

    const rootError = errors.root;
    if (!rootError) {
        return null;
    }
    return (
        rootError.message && (
            <p
                ref={ref}
                className={cn(
                    "text-sm font-medium text-destructive first-letter:capitalize",
                    className
                )}
                {...props}
            >
                {rootError.message}
            </p>
        )
    );
});
FormRootError.displayName = "FormRootError";
const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & {
        field?: string;
    }
>(({ className, field, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body =
        typeof error === "object"
            ? (error?.[field as keyof FieldError] as FieldError)?.message ||
              error?.message
            : error;
    if (!body) {
        return null;
    }
    return (
        <p
            ref={ref}
            id={formMessageId}
            className={cn("text-sm font-normal text-destructive", className)}
            {...props}
        >
            {body}
        </p>
    );
});

FormMessage.displayName = "FormMessage";

const MessageError = ({
    message,
    className,
}: {
    message: string;
    className?: string;
}) => {
    return (
        <p className={cn("text-sm font-medium text-destructive", className)}>
            {message}
        </p>
    );
};

export {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormRootError,
    useFormField,
    MessageError,
};
