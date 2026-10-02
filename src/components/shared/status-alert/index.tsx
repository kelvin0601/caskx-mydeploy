import { cn } from "@/lib/utils";
import { global } from "@/types/global/global";

export type StatusAlertVariant = global.TParticipantStatus;

type TStatusAlertProps = {
    variant: StatusAlertVariant;
    title: string;
    description?: string;
    className?: string;
    showIcon?: boolean;
};

const variantStyles = {
    completed: {
        container: "border-success/20 bg-success/5",
        title: "text-success-darker",
        description: "text-success-lighter",
        icon: "bg-success",
    },
    pending: {
        container: "border-warn-lighter bg-brand-50",
        title: "text-warn-darkest",
        description: "text-brand-lighter",
        icon: "bg-brand",
    },
    expired: {
        container: "bg-bg-sf1 border-none",
        title: "text-typo-primary",
        description: "text-typo-soft",
        icon: "bg-error",
    },
};

export default function StatusAlert({
    variant,
    title,
    description,
    className,
    showIcon,
}: TStatusAlertProps) {
    const styles = variantStyles[variant];
    // Auto-show icon for rejected variant, or use showIcon prop if provided
    const shouldShowIcon =
        showIcon !== undefined ? showIcon : variant === "expired";

    return (
        <div
            className={cn(
                "my-4 rounded-lg border p-4",
                styles.container,
                className
            )}
        >
            <div className="flex items-center gap-2">
                {shouldShowIcon && (
                    <div
                        className={cn(
                            "h-2 w-2 flex-shrink-0 rounded-full",
                            styles.icon
                        )}
                    />
                )}
                {!!title && (
                    <div className="flex-1">
                        <div
                            className={cn("text-sm font-medium", styles.title)}
                        >
                            {title}
                        </div>
                        {description && (
                            <div
                                className={cn(
                                    "mt-1 text-xs",
                                    styles.description
                                )}
                            >
                                {description}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
