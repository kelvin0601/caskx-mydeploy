import { cn } from "@/lib/utils";
import React from "react";

const ItemLabelWithIcon = ({
    label,
    isActive,
    order,
    icon,
    onClick,
}: {
    label: string | React.ReactNode;
    isActive?: boolean;
    order?: "asc" | "desc" | "none";
    icon?: React.ReactNode;
    onClick?: (value: string) => void;
}) => {
    return (
        <div
            className="flex flex-row items-center gap-1 whitespace-nowrap"
            onClick={() => onClick?.(label as string)}
        >
            <div className="text-sm font-medium text-typo-soft">{label}</div>
            <div
                className={cn(
                    "h-4 w-4 text-typo-disable transition-all",
                    isActive && "text-typo-soft"
                )}
            >
                {React.isValidElement(icon)
                    ? (React.cloneElement(
                          icon as React.ReactElement<{
                              state: "asc" | "desc" | "none";
                          }>,
                          {
                              state: isActive ? (order ?? "none") : "none",
                          }
                      ) as React.ReactNode)
                    : icon}
            </div>
        </div>
    );
};

export default ItemLabelWithIcon;
