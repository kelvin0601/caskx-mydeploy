import { cn } from "@/lib/utils";
import { EyeIcon, EyeOff } from "lucide-react";
import * as React from "react";
import { useFormField } from "./form";
import { Button } from "./button";
import { cva, type VariantProps } from "class-variance-authority";

export const INPUT_BASE_CLASSES =
    "peer col-span-2 flex w-full rounded-none border border-transparent bg-bg-sf4 text-base text-typo-primary    outline-none transition-all placeholder:text-typo-soft disabled:cursor-not-allowed disabled:bg-bg-disable dark:bg-bg-dark-sf4 dark:text-typo-dark-primary dark:placeholder:text-typo-dark-soft dark:disabled:bg-bg-dark-disable";

export const INPUT_BORDER_CLASSES =
    "hover:border-bd-main focus-visible:border-bd-brown-lighter dark:hover:border-bd-dark-main dark:focus-visible:border-bd-dark-inverse";

export const inputVariants = cva(cn(INPUT_BASE_CLASSES, INPUT_BORDER_CLASSES), {
    variants: {
        inputSize: {
            lg: "h-12 pl-4 pr-3 tb:h-11 mb:h-10 mb:pl-3 mb:pr-2",
            md: "h-10 pl-3 pr-2",
        },
        status: {
            default: "",
            success:
                "border-success hover:border-success focus-visible:border-success",
            error: "border-error hover:border-error focus-visible:border-error",
        },
        isPassword: {
            true: "",
        },
        hasPrefix: {
            true: "",
        },
    },
    compoundVariants: [
        {
            isPassword: true,
            inputSize: "lg",
            className: "pr-10",
        },
        {
            isPassword: true,
            inputSize: "md",
            className: "pr-8",
        },
        {
            hasPrefix: true,
            inputSize: "lg",
            className: "pl-8 mb:pl-7",
        },
        {
            hasPrefix: true,
            inputSize: "md",
            className: "pl-6",
        },
    ],
    defaultVariants: {
        inputSize: "lg",
        status: "default",
    },
});

type InputProps = React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants> & {
        variant?: "password" | "default";
        isHideError?: boolean;
        isChangeColorError?: boolean;
        isSuccess?: boolean;
        isError?: boolean;
    };

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            prefix,
            type,
            variant,
            isHideError,
            required,
            isChangeColorError,
            inputSize = "lg",
            isSuccess,
            isError,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const { error } = useFormField();

        const togglePasswordVisibility = () => {
            setShowPassword((prev) => !prev);
        };

        const hasError = !!((error || isError) && !isHideError);
        const status = isSuccess ? "success" : hasError ? "error" : "default";

        return (
            <div className="flex-start relative w-full">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-typo-note">
                        {prefix}
                    </span>
                )}
                <input
                    type={
                        variant === "password" && showPassword ? "text" : type
                    }
                    className={cn(
                        inputVariants({
                            inputSize,
                            status,
                            isPassword: variant === "password",
                            hasPrefix: !!prefix,
                        }),
                        required && "required",
                        error && isChangeColorError && "text-error",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {variant === "password" && (
                    <Button
                        variant={"empty"}
                        className="absolute right-2 top-1/2 min-w-0 -translate-y-1/2 p-2 text-typo-note transition-colors focus-within:rounded-none hover:text-typo-primary focus:border-none"
                        onClick={togglePasswordVisibility}
                    >
                        {showPassword ? (
                            <EyeIcon
                                className={cn(
                                    "h-4 w-4",
                                    error && !isHideError && "text-error"
                                )}
                            />
                        ) : (
                            <EyeOff
                                className={cn(
                                    "h-4 w-4",
                                    error && !isHideError && "text-error"
                                )}
                            />
                        )}
                    </Button>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

const InputWithoutForm = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            prefix,
            type,
            variant,
            inputSize = "lg",
            isSuccess,
            isError,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] = React.useState(false);

        const togglePasswordVisibility = () => {
            setShowPassword((prev) => !prev);
        };

        const status = isSuccess ? "success" : isError ? "error" : "default";

        return (
            <div className="flex-start relative w-full">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-typo-note">
                        {prefix}
                    </span>
                )}
                <input
                    type={
                        variant === "password" && showPassword ? "text" : type
                    }
                    className={cn(
                        inputVariants({
                            inputSize,
                            status,
                            isPassword: variant === "password",
                            hasPrefix: !!prefix,
                        }),
                        className
                    )}
                    ref={ref}
                    {...props}
                />

                {variant === "password" && (
                    <Button
                        variant={"empty"}
                        className="absolute right-2 top-1/2 min-w-0 -translate-y-1/2 p-2 text-typo-note transition-colors focus-within:rounded-none hover:text-typo-primary focus:border-none"
                        onClick={togglePasswordVisibility}
                        type="button"
                    >
                        {showPassword ? (
                            <EyeIcon
                                className={cn(
                                    "h-4 w-4",
                                    isError && "text-error"
                                )}
                            />
                        ) : (
                            <EyeOff
                                className={cn(
                                    "h-4 w-4",
                                    isError && "text-error"
                                )}
                            />
                        )}
                    </Button>
                )}
            </div>
        );
    }
);
InputWithoutForm.displayName = "InputWithoutForm";

export { Input, InputWithoutForm };
