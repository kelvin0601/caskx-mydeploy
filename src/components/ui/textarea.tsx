import * as React from "react";

import { cn } from "@/lib/utils";
import { useFormField } from "./form";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, required, ...props }, ref) => {
        const { error } = useFormField();
        return (
            <textarea
                className={cn(
                    "flex min-h-[5rem] w-full border border-transparent bg-bg-sf4 px-3 py-2 text-base text-typo-primary outline-none transition-all placeholder:text-typo-soft hover:border-bd-main focus-visible:border-bd-brown-lighter disabled:cursor-not-allowed disabled:bg-bg-disable dark:bg-bg-dark-sf4 dark:text-typo-dark-primary dark:placeholder:text-typo-dark-soft dark:hover:border-bd-dark-main dark:focus-visible:border-bd-dark-inverse dark:disabled:bg-bg-dark-disable",
                    required && "required",
                    error &&
                        "border-error hover:border-error focus-visible:border-error",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";
const TextareaWOutForm = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, required, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[5rem] w-full border border-transparent bg-bg-sf4 px-3 py-2 text-base text-typo-primary outline-none transition-all placeholder:text-typo-soft hover:border-bd-main focus-visible:border-bd-brown-lighter disabled:cursor-not-allowed disabled:bg-bg-disable dark:bg-bg-dark-sf4 dark:text-typo-dark-primary dark:placeholder:text-typo-dark-soft dark:hover:border-bd-dark-main dark:focus-visible:border-bd-dark-inverse dark:disabled:bg-bg-dark-disable",
                    required && "required",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
TextareaWOutForm.displayName = "TextareaWOutForm";

export { Textarea, TextareaWOutForm };
