import { Coda, Inter, Work_Sans } from "next/font/google";
import localFont from "next/font/local";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-inter",
    weight: ["400", "500", "600", "700"],
});
const workSans = Work_Sans({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-work-sans",
    weight: ["400", "500", "600", "700"],
});

const coda = Coda({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-coda",
    weight: ["400", "800"],
});

const reckless = localFont({
    src: [
        {
            path: "../../../public/fonts/RecklessTRIAL-Light.woff2",
            weight: "300",
            style: "normal",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-LightItalic.woff2",
            weight: "300",
            style: "italic",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-Regular.woff2",
            weight: "400",
            style: "normal",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-RegularItalic.woff2",
            weight: "400",
            style: "italic",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-Medium.woff2",
            weight: "500",
            style: "normal",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-MediumItalic.woff2",
            weight: "500",
            style: "italic",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-SemiBold.woff2",
            weight: "600",
            style: "normal",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-SemiBoldItalic.woff2",
            weight: "600",
            style: "italic",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-Bold.woff2",
            weight: "700",
            style: "normal",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-BoldItalic.woff2",
            weight: "700",
            style: "italic",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-Heavy.woff2",
            weight: "900",
            style: "normal",
        },
        {
            path: "../../../public/fonts/RecklessTRIAL-HeavyItalic.woff2",
            weight: "900",
            style: "italic",
        },
    ],
    variable: "--font-reckless",
});

export { inter, workSans, coda, reckless };
