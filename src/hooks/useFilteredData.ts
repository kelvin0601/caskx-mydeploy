import React from "react";

export type TPriceHistoryPoint = {
    price_date: string;
    y: number;
};

export const useFilteredData = (
    timeRange: string | number,
    data: TPriceHistoryPoint[]
) => {
    return React.useMemo(() => {
        return data.filter((item) => {
            const date = new Date(item.price_date);
            const lastItem = data[data.length - 1];
            const referenceDate = lastItem
                ? new Date(lastItem.price_date)
                : new Date();

            if (timeRange === "all") return true;

            if (timeRange === "ytd") {
                const startOfYear = new Date(referenceDate.getFullYear(), 0, 1);
                return date >= startOfYear;
            }

            const daysToSubtract = Number(timeRange);
            if (!isNaN(daysToSubtract)) {
                const cutoffDate = new Date(referenceDate);
                cutoffDate.setDate(cutoffDate.getDate() - daysToSubtract);
                return date >= cutoffDate;
            }

            return false;
        });
    }, [timeRange, data]);
};
