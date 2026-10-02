import { DataPoint } from "@/modules/cask-master-detail/chart-history";
import React, { useEffect, useRef } from "react";

export const useChartZoom = (originalData: DataPoint[]) => {
    const [startTime, setStartTime] = React.useState<string | null>(null);
    const [endTime, setEndTime] = React.useState<string | null>(null);
    const chartRef = React.useRef<HTMLDivElement>(null);
    const originalPosition = useRef({
        startTime: originalData[0]?.price_date,
        endTime: originalData[originalData.length - 1]?.price_date,
    });
    const [isReset, setIsResetCask] = React.useState(false);

    const handleZoom = React.useCallback(
        (
            e:
                | React.WheelEvent<HTMLDivElement>
                | React.TouchEvent<HTMLDivElement>
        ) => {
            if (!originalData.length || !chartRef.current) return;

            const zoomFactor = 0.1;
            let direction = 0;
            let clientX = 0;

            if ("deltaY" in e) {
                direction = e.deltaY < 0 ? 1 : -1;
                clientX = e.clientX;
            } else if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const currentDistance = Math.hypot(
                    touch1.clientX - touch2.clientX,
                    touch1.clientY - touch2.clientY
                );
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((e as any).lastTouchDistance) {
                    direction =
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        currentDistance > (e as any).lastTouchDistance ? 1 : -1;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (e as any).lastTouchDistance = currentDistance;

                clientX = (touch1.clientX + touch2.clientX) / 2;
            } else {
                return;
            }
            const startDate = new Date(startTime || originalData[0].price_date);
            const endDate = new Date(
                endTime || originalData[originalData.length - 1].price_date
            );

            const currentRange = endDate.getTime() - startDate.getTime();
            if (currentRange === 0) return;

            const zoomAmount = currentRange * zoomFactor * direction;
            const chartRect = chartRef.current.getBoundingClientRect();
            const mouseX = clientX - chartRect.left;
            const mousePercentage = mouseX / chartRect.width;

            const originalStartTime = new Date(
                originalPosition.current.startTime
            );
            const originalEndTime = new Date(originalPosition.current.endTime);
            const currentStartTime = new Date(
                startTime || originalPosition.current.startTime
            );
            const currentEndTime = new Date(
                endTime || originalPosition.current.endTime
            );

            const newStartTime = new Date(
                currentStartTime.getTime() + zoomAmount * mousePercentage
            );
            const newEndTime = new Date(
                currentEndTime.getTime() - zoomAmount * (1 - mousePercentage)
            );

            // Calculate the total time range of the data
            const totalTimeRange =
                originalEndTime.getTime() - originalStartTime.getTime();

            // Calculate the new time range after zoom
            const newTimeRange = newEndTime.getTime() - newStartTime.getTime();

            // Define minimum zoom level (e.g., 20% of total range)
            const minZoomRange = totalTimeRange * 0.1;

            // Define maximum zoom level (e.g., 100% of total range)

            // const maxZoomRange = totalTimeRange;

            // Check if we're beyond zoom limits
            const isBeyondMinZoom = newTimeRange < minZoomRange;
            // const isBeyondMaxZoom = newTimeRange > maxZoomRange;
            // const isBeyondStart =
            //     newStartTime.getTime() < originalStartTime.getTime();
            // const isBeyondEnd =
            //     newEndTime.getTime() > originalEndTime.getTime();

            if (
                isBeyondMinZoom
                // ||
                // isBeyondMaxZoom
                // ||
                // isBeyondStart ||
                // isBeyondEnd
            ) {
                console.log("Stopping zoom at boundary");
                return;
            }

            setStartTime(newStartTime.toISOString());
            setEndTime(newEndTime.toISOString());
        },
        [originalData, startTime, endTime]
    );

    useEffect(() => {
        if (isReset) {
            setStartTime(originalPosition.current.startTime);
            setEndTime(originalPosition.current.endTime);
            setIsResetCask(false);
        }
    }, [isReset]);
    return {
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        chartRef,
        handleZoom,
        setIsResetCask,
    };
};
