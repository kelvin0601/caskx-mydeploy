import { cask } from "@/types";
import IconClose from "../icons/icon-close";
import { cn } from "@/lib/utils";

type TLabel = {
    label?: string | number;
    value?: string | number;
    id?: string;
    className?: string;
    type?: cask.TCaskFilter;
    onClick?: () => void;
};

export default function LabelFilter(props: TLabel) {
    const { label, value, onClick, className } = props;

    return (
        <div
            className={cn(
                "flex max-w-full cursor-pointer items-center gap-2 !rounded-full bg-bg-sf4 py-1 pl-3 pr-2 capitalize transition-all hover:bg-bg-sf3",
                className
            )}
        >
            <span className="truncate whitespace-nowrap font-inter text-sm font-medium leading-normal text-typo-primary">
                {label && <span className="text-typo-sub">{label}: </span>}
                {value}
            </span>
            <button
                type="button"
                onClick={onClick}
                aria-label={`Remove filter ${label ? label + " " : ""}${value}`}
                className="flex h-4 w-4 items-center justify-center text-icon-main"
            >
                <IconClose />
            </button>
        </div>
    );
}
