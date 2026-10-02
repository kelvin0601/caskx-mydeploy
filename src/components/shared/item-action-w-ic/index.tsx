import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const ActionOptionItem = ({
    icon,
    title,
    description,
    onClick,
    children,
    className,
    isHighLight,
}: {
    icon?: React.ReactNode;
    title?: string;
    description?: string;
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
    isHighLight?: boolean;
}) => {
    return (
        <div
            className={cn(
                "bg-gray-50 border-gray-200 hover:bg-gray-100 flex cursor-pointer items-center justify-between rounded-lg border p-4 transition-colors",
                isHighLight && "bg-bg-sf1",
                className
            )}
            onClick={onClick}
        >
            <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                    className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border border-bd-brown bg-bg-sf1",
                        isHighLight && "bg-bg-main"
                    )}
                >
                    <div className="relative">
                        <div className="h-5 w-5 text-typo-note">{icon}</div>
                    </div>
                </div>

                {/* Text content */}
                {(title || description) && (
                    <div className="flex flex-col">
                        {title && (
                            <h4 className="text-base font-medium text-typo-primary">
                                {title}
                            </h4>
                        )}
                        {description && (
                            <span className="text-sm text-typo-soft">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Arrow indicator */}
            {children || <ChevronRight className="h-5 w-5 text-typo-note" />}
        </div>
    );
};

export default ActionOptionItem;
