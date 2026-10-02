import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
    "inline-flex items-center tb:min-w-0 justify-center gap-x-1  !leading-[1] [&_*]:!leading-[1] whitespace-nowrap px-3 text-sm font-medium transition outline-solid disabled:pointer-events-none disabled:bg-bg-sf3 disabled:text-typo-primary/[0.15] [&_svg]:pointer-events-none [&_svg]:shrink-0 cursor-pointer capitalize  disabled:cursor-not-allowed disabled-pointer-events-none outline-style:solid outline:border outline-[1px]",
    {
        variants: {
            variant: {
                action: "text-typo-dark-primary hover:text-typo-primary bg-bg-dark-main hover:text-typo-primary hover:bg-brand min-w-0 w-max",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                outline:
                    "outline -outline-offset-1 transition-all text-typo-primary outline-bd-main disabled:outline-bd-surface disabled:bg-bg-transparent disabled:text-typo-disable min-w-0 hover:text-typo-primary hover:outline-bd-inverse",
                "outline-text":
                    "outline -outline-offset-1 transition-all  outline-bd-main text-typo-primary disabled:outline-bd-surface disabled:bg-bg-transparent disabled:text-typo-disable !min-w-0 hover:text-typo-dark-primary hover:bg-bg-dark-main hover:outline-bg-dark-main",
                default:
                    "hover:bg-bg-dark-main hover:text-typo-dark-primary focus-visible:bg-bg-dark-main focus-visible:text-typo-dark-primary",
                secondary:
                    "bg-bg-sf2 text-typo-primary hover:bg-brand hover:text-typo-primary focus-visible:bg-brand focus-visible:text-typo-primary",
                tab: "bg-bg-sf3 text-typo-soft transition-all hover:text-typo-dark-primary hover:bg-black focus-visible:text-typo-dark-primary focus-visible:bg-black active:bg-bg-dark-main active:text-typo-dark-primary ",
                ghost: "disabled:bg-bg-disable disabled:text-typo-disable  disabled:cursor-not-allowed bg-bg-sf4 text-typo-primary hover:bg-bg-dark-main hover:text-typo-dark-primary focus-visible:bg-bg-dark-main focus-visible:text-typo-dark-primary",
                link: "text-typo-primary !leading-[1.2] [--text-color:hsl(var(--text-strong))] disabled:[--text-color:hsl(var(--disable))] min-w-unset  flex flex-row gap-1 !p-0 flex-start disabled:pointer-events-none disabled:bg-transparent   rounded-none   hover-line-active  !min-w-fit [&_path]:text-current [&_path]:stroke-current",
                input: "border border-transparent bg-bg-sf4 outline-none transition-all hover:border-bd-main focus-visible:border-bd-brown",
                icon: "rounded-full bg-bg-dark-sf1 text-typo-dark-primary bg-bg-dark-sf1 p-0 focus-visible:opacity-80",
                primary:
                    "bg-brand text-typo-primary hover:bg-brand-darker focus-visible:bg-brand-darker",
                empty: "disabled:text-typo-disable min-w-auto disabled:cursor-not-allowed disabled:bg-bg-sf4 focus-visible:bg-black/5",
                invisible:
                    "text-typo-primary hover:text-typo-primary focus-visible:bg-bg-sf1",
                "link-df":
                    "text-typo-primary !leading-[1.2] disabled:[--text-color:hsl(var(--disable))] [--text-color:hsl(var(--text-strong))]  min-w-unset flex flex-row gap-1 !p-0 flex-start rounded-none   hover-line !min-w-fit [&_path]:text-current [&_path]:stroke-current",
            },
            size: {
                default: "py-[0.8125rem] min-w-32 px-5",
                sm: "py-2 min-w-0 px-4",
                lg: "py-3.5 min-w-40 px-8 mb:py-2.5 mb:min-w-fit ",
                xl: "py-4 px-8 h-12 mb:h-10 mb:py-2",
                icon: "h-10 w-10",
                tab: "py-1.5 px-3",
            },
            mode: {
                dark: "",
                light: "",
            },
            groupHover: {
                true: "",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
        compoundVariants: [
            {
                variant: "tab",
                mode: "dark",
                className:
                    "bg-transparent text-typo-dark-primary/50 hover:bg-white/10 hover:text-typo-dark-primary focus-visible:bg-white/10 focus-visible:text-typo-dark-primary active:bg-white/15 active:text-typo-dark-primary [&.active]:bg-white/15 [&.active]:text-typo-dark-primary [&.active]:font-semibold ",
            },
            {
                variant: "ghost",
                mode: "dark",
                className:
                    "text-typo-dark-primary hover:bg-bg-dark-sf1 disabled:bg-bg-dark-sf3 bg-bg-main/30 disable:text-bg-main/50 disabled:bg-bg-main/10 disabled:hover:bg-bg-main/10",
            },
            {
                variant: "outline",
                mode: "dark",
                className:
                    "outline-bd-dark-main text-icon-dark-main hover:bg-bg-primary disabled:text-typo-dark-disable disabled:outline-bd-dark-main  hover:bd-bd-dark-main hover:text-typo-dark-primary hover:outline-typo-dark-primary ",
            },
            {
                variant: "secondary",
                mode: "dark",
                className:
                    "bg-bg-dark-main text-typo-dark-primary disabled:bg-bg-dark-sf3 hover:bg-bg-main hover:text-typo-primary focus-visible:bg-bg-main focus-visible:text-typo-primary disabled:bg-white/15 disabled:text-white/30",
            },

            {
                variant: "secondary",
                groupHover: true,
                className: "group-hover:bg-brand group-hover:text-typo-primary",
            },
            {
                variant: "action",
                groupHover: true,
                className:
                    "group-hover:text-typo-primary group-hover:bg-brand  tb:text-typo-primary",
            },
            {
                variant: "outline",
                groupHover: true,
                className:
                    "group-hover:text-bd-inverse group-hover:outline-bd-inverse",
            },
            {
                variant: "outline-text",
                mode: "dark",
                className:
                    "outline-bd-dark-main text-typo-dark-primary disabled:text-typo-dark-disable disabled:outline-bd-dark-main",
            },
            {
                variant: "tab",
                groupHover: true,
                className:
                    "group-hover:text-typo-dark-primary group-hover:bg-black",
            },
            {
                variant: "primary",
                groupHover: true,
                className: "group-hover:bg-brand-darker",
            },
            {
                variant: "primary",
                mode: "dark",
                className:
                    "disabled:bg-bg-dark-sf3 disabled:text-typo-dark-disable",
            },
            {
                variant: "outline-text",
                groupHover: true,
                className:
                    "group-hover:bg-bg-dark-main group-hover:outline-bg-dark-main group-hover:text-typo-dark-primary",
            },
        ],
    }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        mode?: "dark" | "light";
    };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            variant,
            size,
            asChild = false,
            mode = "light",
            groupHover,
            type = "button",
            ...props
        },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";

        return (
            <Comp
                className={cn(
                    buttonVariants({
                        variant,
                        size,
                        groupHover,
                        className,
                        mode,
                    }),
                    variant !== "outline" &&
                        variant !== "outline-text" &&
                        "focus:outline-bd-brown"
                )}
                ref={ref}
                type={type}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
