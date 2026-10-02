export const findClosestIndex = (
    scrollSnaps: number[],
    percentageFromLeft: number
): number => {
    const point = percentageFromLeft / 100;

    return scrollSnaps.reduce((closestIndex, currentSnap, currentIndex) => {
        const closestSnap = scrollSnaps[closestIndex];
        return Math.abs(currentSnap - point) < Math.abs(closestSnap - point)
            ? currentIndex
            : closestIndex;
    }, 0);
};
