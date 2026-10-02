import * as React from "react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    DotProps,
    ReferenceArea,
    XAxis,
    YAxis,
} from "recharts";

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
import { ChartControls } from "./components/chart-controls";
import { CustomizedDot } from "./components/customized-dot";

export type DataPoint = TPriceHistoryPoint;

const EMPTY_PRICE_HISTORY: DataPoint[] = [];

const MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

export function ChartHistory({
    data = EMPTY_PRICE_HISTORY,
}: {
    data?: DataPoint[];
}) {
    const [chartMode, setChartMode] = React.useState<"price" | "monthly">(
        "price"
    );
    const [timeRange, setTimeRange] = React.useState<string | number>("ytd");
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [isAnimation, setIsAnimation] = React.useState(false);

    // Get the base raw price data from constants
    // Filter raw data for price mode (chronological line chart)
    const filteredPriceData = useFilteredData(
        // chartMode === "price" ? timeRange : "all",
        "all",
        data
    );

    const rawPriceData = React.useMemo(
        () =>
            data.map((item) => ({
                price_date: item.price_date,
                y: item.y,
            })),
        [data]
    );

    const initialData = React.useMemo(
        () =>
            filteredPriceData.map((item) => ({
                price_date: item.price_date,
                y: item.y,
            })),
        [filteredPriceData]
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
        if (initialData?.length && chartMode === "price") {
            setOriginalData(initialData);
            setStartTime(initialData[0].price_date);
            setEndTime(initialData[initialData.length - 1].price_date);
        }
    }, [initialData, chartMode, setEndTime, setStartTime]);

    // Data specifically formatted for price mode (chronological zoomable line chart)
    const zoomedData = React.useMemo(() => {
        if (chartMode !== "price") return [];
        if (!startTime || !endTime) return originalData;

        const dataPointsInRange = originalData.filter(
            (dataPoint) =>
                dataPoint.price_date >= startTime &&
                dataPoint.price_date <= endTime
        );

        return dataPointsInRange.length > 1
            ? dataPointsInRange
            : originalData.slice(0, 2);
    }, [startTime, endTime, originalData, chartMode]);

    // Calculate 12 monthly data points for a selected year in monthly mode
    const monthlyYearData = React.useMemo(() => {
        if (chartMode !== "monthly") return [];

        const yearStr = timeRange.toString();
        const monthlyData = MONTH_LABELS.map((label, index) => {
            const monthNum = index + 1;
            const monthStr = monthNum < 10 ? `0${monthNum}` : `${monthNum}`;
            const prefix = `${yearStr}-${monthStr}`;

            const points = rawPriceData.filter((p) =>
                p.price_date.startsWith(prefix)
            );

            if (points.length > 0) {
                const avgY =
                    points.reduce((sum, p) => sum + p.y, 0) / points.length;
                return {
                    price_date: label,
                    y: avgY,
                };
            }
            return {
                price_date: label,
                y: null as number | null,
            };
        });

        // Continuous line: fill null months with the last available price value
        let lastValidY = 0;
        const firstValid = monthlyData.find((m) => m.y !== null);
        if (firstValid && firstValid.y !== null) lastValidY = firstValid.y;

        return monthlyData.map((m) => {
            if (m.y !== null) {
                lastValidY = m.y;
                return { price_date: m.price_date, y: m.y };
            }
            return { price_date: m.price_date, y: lastValidY };
        });
    }, [chartMode, rawPriceData, timeRange]);

    const activeChartData =
        chartMode === "price" ? zoomedData : monthlyYearData;

    const isDown = React.useMemo(() => {
        if (!activeChartData.length) return false;
        const firstValue = activeChartData[0]?.y;
        const lastValue = activeChartData[activeChartData.length - 1]?.y;
        return firstValue > lastValue;
    }, [activeChartData]);

    const animationDuration = 700;
    const color = isDown ? "hsl(var(--error))" : "hsl(var(--success))";

    React.useEffect(() => {
        const chartElement = chartRef.current;
        if (chartMode !== "price" || !chartElement) return;
        let animationFrame: number | null = null;
        let pendingEvent: WheelEvent | TouchEvent | null = null;
        const { height } =
            chartElement
                ?.querySelector(".recharts-cartesian-grid")
                ?.getBoundingClientRect() || {};
        if (!height) return;
        setHeightGrid(height);

        const scheduleZoom = (event: WheelEvent | TouchEvent) => {
            pendingEvent = event;
            if (animationFrame !== null) return;

            animationFrame = requestAnimationFrame(() => {
                if (pendingEvent) handleZoom(pendingEvent as never);
                pendingEvent = null;
                animationFrame = null;
            });
        };
        const wheelListener = (e: WheelEvent) => {
            e.preventDefault();
            scheduleZoom(e);
        };
        const touchListener = (e: TouchEvent) => {
            e.preventDefault();
            scheduleZoom(e);
        };

        chartElement.addEventListener("wheel", wheelListener, {
            passive: false,
        });
        chartElement.addEventListener("touchmove", touchListener, {
            passive: false,
        });

        return () => {
            if (animationFrame !== null) cancelAnimationFrame(animationFrame);
            chartElement.removeEventListener("wheel", wheelListener);
            chartElement.removeEventListener("touchmove", touchListener);
        };
    }, [handleZoom, chartMode, chartRef]);

    return (
        <div
            style={{
                touchAction: chartMode === "price" ? "none" : "auto",
            }}
            ref={chartRef}
            className="flex w-full flex-col gap-4 px-6 tb:px-5 mb:px-4"
        >
            {/* <ChartControls
                chartMode={chartMode}
                setChartMode={setChartMode}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                originalData={originalData}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
                setIsResetCask={setIsResetCask}
                setIsAnimation={setIsAnimation}
                timerRef={timerRef}
                animationDuration={animationDuration}
            /> */}

            {/* Chart Container */}
            <div className="w-full">
                <ChartContainer className="h-64 w-full" config={{}}>
                    <AreaChart
                        ref={lineChartRef}
                        onMouseDown={
                            chartMode === "price" ? handleMouseDown : undefined
                        }
                        onMouseMove={
                            chartMode === "price" ? handleMouseMove : undefined
                        }
                        onMouseUp={
                            chartMode === "price" ? handleMouseUp : undefined
                        }
                        onMouseLeave={
                            chartMode === "price" ? handleMouseUp : undefined
                        }
                        accessibilityLayer
                        data={activeChartData}
                        margin={{
                            top: 8,
                            right: 8,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient
                                id="chartGradient"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="#FBC30F"
                                    stopOpacity={0.2}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="#FBC30F"
                                    stopOpacity={0}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} />
                        <YAxis
                            domain={[0, "auto"]}
                            dataKey="y"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={0}
                            width={convertRemToPx(2.5)}
                            tickFormatter={(value) =>
                                value != null
                                    ? value.toLocaleString("en-US")
                                    : "0"
                            }
                            tickCount={8}
                            interval="preserveStart"
                            style={{
                                fontSize: "0.75rem",
                                fontFamily: "Inter",
                                fontWeight: 400,
                                fill: "hsl(var(--text-soft))",
                                userSelect: "none",
                            }}
                        />
                        {chartMode === "price" ? (
                            <XAxis
                                domain={["dataMin", "auto"]}
                                dataKey="price_date"
                                tickLine={false}
                                axisLine={false}
                                tickCount={12}
                                interval="preserveStart"
                                height={convertRemToPx(2.75)}
                                tickMargin={convertRemToPx(0.5)}
                                padding={{
                                    left: convertRemToPx(1.5),
                                }}
                                style={{
                                    fontSize: "0.75rem",
                                    fontFamily: "Inter",
                                    fontWeight: 400,
                                    fill: "hsl(var(--text-soft))",
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
                                                    fill: "hsl(var(--text-soft))",
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
                        ) : (
                            <XAxis
                                dataKey="price_date"
                                tickLine={false}
                                axisLine={false}
                                height={convertRemToPx(2)}
                                tickMargin={convertRemToPx(0.5)}
                                style={{
                                    fontSize: "0.75rem",
                                    fontFamily: "Inter",
                                    fontWeight: 400,
                                    fill: "hsl(var(--text-soft))",
                                    userSelect: "none",
                                }}
                            />
                        )}
                        {chartMode === "price" &&
                            refAreaLeft &&
                            refAreaRight && (
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
                                        if (chartMode === "price") {
                                            const date = new Date(d);
                                            return date.toLocaleString(
                                                "en-US",
                                                {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                }
                                            );
                                        }
                                        return d;
                                    }}
                                />
                            }
                        />
                        <Area
                            dataKey="y"
                            type="linear"
                            stroke="#FBC30F"
                            fillOpacity={1}
                            fill="url(#chartGradient)"
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
                    </AreaChart>
                </ChartContainer>
            </div>
        </div>
    );
}
