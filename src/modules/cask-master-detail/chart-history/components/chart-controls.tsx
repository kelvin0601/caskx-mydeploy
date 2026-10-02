import * as React from "react";
import { cn } from "@/lib/utils";

type DataPoint = {
    price_date: string;
    y: number;
};

const PRICE_TABS = [
    { value: 180, label: "6M" },
    { value: 365, label: "1Y" },
    { value: "ytd", label: "YTD" },
    { value: 3650, label: "10Y" },
    { value: "all", label: "All" },
];

const MONTHLY_TABS = [
    { value: 2023, label: "2023" },
    { value: 2024, label: "2024" },
    { value: 2025, label: "2025" },
    { value: 2026, label: "2026" },
];

type ChartControlsProps = {
    chartMode: "price" | "monthly";
    setChartMode: (mode: "price" | "monthly") => void;
    timeRange: string | number;
    setTimeRange: (range: string | number) => void;
    originalData: DataPoint[];
    setStartTime: (time: string) => void;
    setEndTime: (time: string) => void;
    setIsResetCask: (reset: boolean) => void;
    setIsAnimation: (animation: boolean) => void;
    timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
    animationDuration: number;
};

export function ChartControls({
    chartMode,
    setChartMode,
    timeRange,
    setTimeRange,
    originalData,
    setStartTime,
    setEndTime,
    setIsResetCask,
    setIsAnimation,
    timerRef,
    animationDuration,
}: ChartControlsProps) {
    const [isOpenDropdown, setIsOpenDropdown] = React.useState(false);

    return (
        <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center gap-1">
                {chartMode === "price"
                    ? PRICE_TABS.map((item) => {
                          const isActive = item.value === timeRange;
                          return (
                              <button
                                  key={item.value}
                                  onClick={() => {
                                      if (timerRef.current) {
                                          clearTimeout(timerRef.current);
                                      }

                                      setStartTime(originalData[0]?.price_date);
                                      setEndTime(
                                          originalData[originalData.length - 1]
                                              ?.price_date
                                      );
                                      setTimeRange(item.value);
                                      setIsResetCask(true);
                                      setIsAnimation(true);
                                      timerRef.current = setTimeout(() => {
                                          setIsAnimation(false);
                                      }, animationDuration);
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
                      })
                    : MONTHLY_TABS.map((item) => {
                          const isActive = item.value === timeRange;
                          return (
                              <button
                                  key={item.value}
                                  onClick={() => {
                                      setTimeRange(item.value);
                                      setIsAnimation(true);
                                      setTimeout(() => {
                                          setIsAnimation(false);
                                      }, animationDuration);
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
        </div>
    );
}
