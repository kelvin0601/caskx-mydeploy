import { cn } from "@/lib/utils";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

type TCustomTooltip = {
    children: React.ReactNode;
    content: string | React.ReactNode | React.ReactElement;
    className?: string;
    childClass?: string;
    isHide?: boolean;
    isTrigger?: boolean;
    offset?: {
        x?: number;
        y?: number;
    };
    isDisabled?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export type TCustomTooltipRef = {
    setIsShow: (isShow: boolean) => void;
};

const isTouchDevice = () =>
    typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;

const CustomTooltip = forwardRef(function CustomTooltip(
    props: TCustomTooltip,
    ref: React.Ref<TCustomTooltipRef>
) {
    const {
        children,
        className,
        content,
        isHide,
        childClass,
        isTrigger,
        isDisabled,
        ...rest
    } = props;

    const [isShow, setIsShow] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        setIsShow,
    }));

    const handleTap = useCallback(() => {
        if (isDisabled || isTrigger) return;
        if (isTouchDevice()) {
            setIsShow((prev) => !prev);
        }
    }, [isDisabled, isTrigger]);

    useEffect(() => {
        if (!isShow) return;

        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target as Node)
            ) {
                setIsShow(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isShow]);

    return (
        <div
            ref={wrapperRef}
            className={cn("group relative inline-block", className)}
            {...rest}
        >
            <div
                className={cn(
                    "relative cursor-pointer",
                    isDisabled && "cursor-not-allowed opacity-60"
                )}
                onClick={handleTap}
            >
                {children}
            </div>
            {!isHide && (
                <div
                    className={cn(
                        "pointer-events-none absolute bottom-full left-1/2 z-50 w-max origin-[--radix-tooltip-content-transform-origin] -translate-x-1/2 translate-y-1 rounded-md bg-bg-dark-main px-3 py-2 text-xs text-typo-dark-primary opacity-0 shadow-md transition-all",
                        isShow &&
                            "pointer-events-auto translate-y-0 opacity-100",
                        !isTrigger &&
                            "group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100",
                        childClass
                    )}
                >
                    <div className="absolute left-1/2 top-full w-4 -translate-x-1/2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="100%"
                            viewBox="0 0 16 10"
                            fill="none"
                        >
                            <path
                                d="M14.0711 -2.232C14.962 -2.232 15.4081 -1.15485 14.7782 -0.524888L8.70711 5.54619C8.31658 5.93671 7.68342 5.93671 7.29289 5.54619L1.22183 -0.524888C0.591867 -1.15485 1.03803 -2.232 1.92894 -2.232L14.0711 -2.232Z"
                                className="fill-bg-dark-main"
                            />
                        </svg>
                    </div>
                    <p className="text-xs normal-case text-typo-dark-primary">
                        {content}
                    </p>
                </div>
            )}
        </div>
    );
});

export default CustomTooltip;
