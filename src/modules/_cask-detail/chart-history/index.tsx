import * as React from "react";
import {
    CartesianGrid,
    DotProps,
    Line,
    LineChart,
    ReferenceArea,
    XAxis,
    YAxis,
} from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContentCustom,
} from "@/components/ui/chart";
import { useChartSelection } from "@/hooks/useChartSelection";
import { useChartZoom } from "@/hooks/useChartZoom";
import { TPriceHistoryPoint, useFilteredData } from "@/hooks/useFilteredData";
import { cn, convertRemToPx } from "@/lib/utils";
import IconCoinsStacked from "@/components/shared/icons/icon-coins-stacked";

const DATA_SELECT = [
    { value: 180, label: "6M" },
    { value: 365, label: "1Y" },
    { value: "ytd", label: "YTD" },
    { value: 3650, label: "10Y" },
    { value: "all", label: "All" },
];

export type DataPoint = TPriceHistoryPoint;

const EMPTY_PRICE_HISTORY: DataPoint[] = [];

export function ChartHistory({
    data = EMPTY_PRICE_HISTORY,
}: {
    data?: DataPoint[];
}) {
    const [timeRange, setTimeRange] = React.useState<string | number>("ytd");
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const filteredData = useFilteredData(timeRange, data);
    const [isAnimation, setIsAnimation] = React.useState(false);

    const initialData = React.useMemo(
        () =>
            filteredData.map((item) => ({
                price_date: item.price_date,
                y: item.y,
            })),
        [filteredData]
    );
    const lineChartRef = React.useRef(null);
    const [heightGrid, setHeightGrid] = React.useState(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);
    const [originalData, setOriginalData] =
        React.useState<DataPoint[]>(initialData);

    const {
        startTime,
        endTime,
        setStartTime,
        setEndTime,
        chartRef,
        handleZoom,
        setIsResetCask,
    } = useChartZoom(originalData);

    const {
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        refAreaLeft,
        refAreaRight,
    } = useChartSelection(setStartTime, setEndTime);

    React.useEffect(() => {
        if (initialData?.length) {
            setOriginalData(initialData);
            setStartTime(initialData[0].price_date);
            setEndTime(initialData[initialData.length - 1].price_date);
        }
    }, [initialData]);

    const zoomedData = React.useMemo(() => {
        if (!startTime || !endTime) return originalData;

        const dataPointsInRange = originalData.filter(
            (dataPoint) =>
                dataPoint.price_date >= startTime &&
                dataPoint.price_date <= endTime
        );

        return dataPointsInRange.length > 1
            ? dataPointsInRange
            : originalData.slice(0, 2);
    }, [startTime, endTime, originalData]);

    const isDown = React.useMemo(() => {
        const firstValue = zoomedData[0]?.y;
        const lastValue = zoomedData[zoomedData.length - 1]?.y;
        return firstValue > lastValue;
    }, [zoomedData.length]);
    const animationDuration = 700;

    const color = isDown ? "hsl(var(--error))" : "hsl(var(--success))";
    React.useEffect(() => {
        if (!chartRef.current) return;
        const { height } =
            chartRef.current
                ?.querySelector(".recharts-cartesian-grid")
                ?.getBoundingClientRect() || {};
        if (!height) return;
        setHeightGrid(height);
        return () => {
            if (!chartRef.current) return;
            chartRef.current.removeEventListener<"wheel">(
                "wheel",
                (e: WheelEvent) => {
                    e.preventDefault();
                    handleZoom(e as never);
                }
            );
            chartRef.current.removeEventListener<"touchmove">(
                "touchmove",
                (e: TouchEvent) => {
                    e.preventDefault();
                    handleZoom(e as never);
                }
            );
        };
    }, [chartRef.current, handleZoom]);
    return (
        <div className="flex flex-col gap-4 rounded-none border border-bd-main bg-bg-main p-6 pb-4 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconCoinsStacked className="h-5 w-5 text-typo-primary" />
                    <h3 className="text-lg font-semibold text-typo-primary">
                        Price History
                    </h3>
                </div>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-typo-soft transition-colors hover:text-typo-primary focus:outline-none"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            isCollapsed && "rotate-180"
                        )}
                    >
                        <path
                            d="M12 10L8 6L4 10"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
            </div>

            {!isCollapsed && (
                <>
                    {/* Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Tabs */}
                        <div className="flex items-center gap-1">
                            {DATA_SELECT.map((item) => {
                                const isActive = item.value === timeRange;
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => {
                                            if (timerRef.current) {
                                                clearTimeout(timerRef.current);
                                            }

                                            setStartTime(
                                                originalData[0].price_date
                                            );
                                            setEndTime(
                                                originalData[
                                                    originalData.length - 1
                                                ].price_date
                                            );
                                            setTimeRange(item.value);
                                            setIsResetCask(true);
                                            setIsAnimation(true);
                                            timerRef.current = setTimeout(
                                                () => {
                                                    setIsAnimation(false);
                                                },
                                                animationDuration
                                            );
                                        }}
                                        className={cn(
                                            "select-none rounded-none px-3 py-1.5 text-sm font-semibold transition-all duration-200 focus:outline-none",
                                            isActive
                                                ? "bg-[#0E0702] text-[#FFFCF6]"
                                                : "hover:bg-[#0E0702]/8 bg-transparent text-[#1B0D03]/50"
                                        )}
                                    >
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-typo-soft">
                                Sort by
                            </span>
                            <div className="bg-[#0E0702]/4 hover:bg-[#0E0702]/8 flex h-[30px] min-w-[100px] cursor-pointer select-none items-center justify-between gap-2 px-4 py-1.5 transition-colors">
                                <span className="text-sm font-medium text-typo-primary">
                                    Year
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="h-4 w-4 text-typo-soft"
                                >
                                    <path
                                        d="M4 6L8 10L12 6"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div
                        onWheel={(e) => {
                            if (e.currentTarget) {
                                e.currentTarget.addEventListener(
                                    "wheel",
                                    (e) => e.preventDefault(),
                                    { passive: false }
                                );
                            }
                            handleZoom(e);
                        }}
                        onTouchMove={(e) => {
                            if (e.currentTarget) {
                                e.currentTarget.addEventListener(
                                    "touchmove",
                                    (e) => e.preventDefault(),
                                    { passive: false }
                                );
                            }
                            handleZoom(e);
                        }}
                        style={{ touchAction: "none" }}
                        ref={chartRef}
                        className="w-full pt-2"
                    >
                        <ChartContainer className="h-64 w-full" config={{}}>
                            <LineChart
                                ref={lineChartRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                accessibilityLayer
                                data={zoomedData}
                                margin={{
                                    top: convertRemToPx(1),
                                    right: convertRemToPx(1),
                                    left: convertRemToPx(1),
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <YAxis
                                    domain={["dataMin", "auto"]}
                                    dataKey={"y"}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={0}
                                    width={convertRemToPx(2.5)}
                                    tickFormatter={(value) =>
                                        `${Math.round(value)}`
                                    }
                                    tickCount={6}
                                    interval={"preserveStart"}
                                    style={{
                                        fontSize: "0.75rem",
                                        fontFamily: "Inter",
                                        fontWeight: 400,
                                        fill: "hsl(var(--bg-dark-surface-3))",
                                        userSelect: "none",
                                    }}
                                />
                                <XAxis
                                    domain={["dataMin", "auto"]}
                                    dataKey="price_date"
                                    tickLine={false}
                                    axisLine={false}
                                    tickCount={12}
                                    interval={"preserveStart"}
                                    height={convertRemToPx(2.75)}
                                    tickMargin={convertRemToPx(0.5)}
                                    padding={{
                                        left: convertRemToPx(1.5),
                                    }}
                                    style={{
                                        fontSize: "0.75rem",
                                        fontFamily: "Inter",
                                        fontWeight: 400,
                                        fill: "hsl(var(--bg-dark-surface-3))",
                                        userSelect: "none",
                                    }}
                                    tick={({ x, y, payload }) => {
                                        const date = new Date(payload.value);
                                        const month = date.toLocaleDateString(
                                            "en-US",
                                            {
                                                month: "short",
                                            }
                                        );
                                        const year = date.toLocaleDateString(
                                            "en-US",
                                            {
                                                year: "numeric",
                                            }
                                        );
                                        return (
                                            <g
                                                transform={`translate(${x},${y - 0})`}
                                            >
                                                <text
                                                    x={0}
                                                    y={0}
                                                    dy={0}
                                                    textAnchor="middle"
                                                    style={{
                                                        userSelect: "none",
                                                        fill: "hsl(var(--bg-dark-surface-3))",
                                                    }}
                                                >
                                                    <tspan x="0">{month}</tspan>
                                                    <tspan x="0" dy="1.5em">
                                                        {year}
                                                    </tspan>
                                                </text>
                                            </g>
                                        );
                                    }}
                                />
                                {refAreaLeft && refAreaRight && (
                                    <ReferenceArea
                                        x1={refAreaLeft}
                                        x2={refAreaRight}
                                        strokeOpacity={0.3}
                                        fill="hsl(var(--foreground))"
                                        fillOpacity={0.05}
                                    />
                                )}
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContentCustom
                                            labelFormatter={(d) => {
                                                const date = new Date(d);
                                                const formattedDate =
                                                    date.toLocaleString(
                                                        "en-US",
                                                        {
                                                            month: "short",
                                                            day: "2-digit",
                                                            year: "numeric",
                                                        }
                                                    );
                                                return formattedDate;
                                            }}
                                        />
                                    }
                                />
                                <Line
                                    dataKey="y"
                                    type="linear"
                                    stroke={color}
                                    animationDuration={animationDuration}
                                    strokeWidth={convertRemToPx(0.125)}
                                    dot={false}
                                    animationEasing="ease"
                                    isAnimationActive={isAnimation}
                                    activeDot={(props: DotProps) => (
                                        <CustomizedDot
                                            {...props}
                                            heightGrid={heightGrid}
                                        />
                                    )}
                                />
                            </LineChart>
                        </ChartContainer>
                    </div>
                </>
            )}
        </div>
    );
}

const CustomizedDot = (
    props: DotProps & { heightGrid: number }
): React.JSX.Element => {
    const { cx = 0, cy = 0, fill, heightGrid } = props;
    const distance = Math.min(
        Math.max(
            heightGrid - cy + convertRemToPx(0.75) * 2,
            convertRemToPx(0.75)
        ),
        heightGrid
    );
    return (
        <svg
            x={cx - convertRemToPx(0.75) / 2}
            y={cy - convertRemToPx(0.75) / 2}
            width={convertRemToPx(0.75)}
            height={distance}
            viewBox={`0 0 ${convertRemToPx(0.75)} ${distance}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient
                    id="lineGradient"
                    x1={convertRemToPx(0.75) / 2}
                    y1="0"
                    x2={convertRemToPx(0.75) / 2}
                    y2={distance}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0" stopColor="white" />
                    <stop offset="1" stopColor="black" />
                </linearGradient>

                <mask
                    id="lineMask"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="0"
                    width={convertRemToPx(0.75)}
                    height={distance}
                >
                    <rect
                        x="0"
                        y="0"
                        width={convertRemToPx(0.75)}
                        height={distance}
                        fill="url(#lineGradient)"
                    />
                </mask>
            </defs>

            <g mask="url(#lineMask)">
                <path
                    d={`M${convertRemToPx(0.75) / 2} 6L6 ${distance}`}
                    stroke={fill}
                    strokeWidth={convertRemToPx(0.125)}
                    strokeLinecap="round"
                />
            </g>

            <rect
                x="0.5"
                y="1"
                width={convertRemToPx(0.625)}
                height={convertRemToPx(0.625)}
                rx={convertRemToPx(0.3125)}
                fill="white"
            />
            <rect
                x="0.5"
                y="1"
                width={convertRemToPx(0.625)}
                height={convertRemToPx(0.625)}
                rx={convertRemToPx(0.3125)}
                stroke={fill}
                strokeWidth={convertRemToPx(0.125)}
            />
        </svg>
    );
};
