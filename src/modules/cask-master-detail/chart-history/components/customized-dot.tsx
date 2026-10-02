import * as React from "react";
import { DotProps } from "recharts";
import { convertRemToPx } from "@/lib/utils";

export const CustomizedDot = (
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
