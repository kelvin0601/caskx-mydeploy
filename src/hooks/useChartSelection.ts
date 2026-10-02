import React from "react";

export const useChartSelection = (
    setStartTime: (time: string) => void,
    setEndTime: (time: string) => void
) => {
    const [refAreaLeft, setRefAreaLeft] = React.useState<string | null>(null);
    const [refAreaRight, setRefAreaRight] = React.useState<string | null>(null);
    const [isSelecting, setIsSelecting] = React.useState(false);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMouseDown = React.useCallback((e: any) => {
        if (e.activeLabel) {
            setRefAreaLeft(e.activeLabel);
            setIsSelecting(true);
        }
    }, []);

    const handleMouseMove = React.useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (e: any) => {
            if (isSelecting && e.activeLabel) {
                setRefAreaRight(e.activeLabel);
            }
        },
        [isSelecting]
    );

    const handleMouseUp = React.useCallback(() => {
        if (refAreaLeft && refAreaRight) {
            const [left, right] = [refAreaLeft, refAreaRight].sort();
            setStartTime(left);
            setEndTime(right);
            // setIsResetCask(true);
        }
        setRefAreaLeft(null);
        setRefAreaRight(null);
        setIsSelecting(false);
    }, [refAreaLeft, refAreaRight, setStartTime, setEndTime]);

    return {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        refAreaLeft,
        refAreaRight,
    };
};
