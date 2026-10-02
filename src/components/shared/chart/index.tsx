import { Area, AreaChart } from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
    desktop: {
        label: "Desktop",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig;

export function Chart({
    data,
}: {
    data: {
        price: number;
        date: string;
    }[];
}) {
    return (
        <ChartContainer className="w-full" config={chartConfig}>
            <AreaChart accessibilityLayer data={data}>
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                />
                <defs>
                    <linearGradient id="gradientUp" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="0%"
                            stopColor="hsl(var(--success))"
                            stopOpacity={0.1}
                        />
                        <stop
                            offset="100%"
                            stopColor="hsl(var(--success))"
                            stopOpacity={0}
                        />
                    </linearGradient>
                    <linearGradient
                        id="gradientDown"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="hsl(var(--error))"
                            stopOpacity={0.1}
                        />
                        <stop
                            offset="100%"
                            stopColor="hsl(var(--error))"
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <Area
                    dataKey="price"
                    strokeWidth={2}
                    type="linear"
                    fill={`url(#${data[data.length - 1].price >= data[0].price ? "gradientUp" : "gradientDown"})`}
                    fillOpacity={1}
                    stroke={
                        data[data.length - 1].price >= data[0].price
                            ? "hsl(var(--success))"
                            : "hsl(var(--error))"
                    }
                />
            </AreaChart>
        </ChartContainer>
    );
}
