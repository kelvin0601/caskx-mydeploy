import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/layout/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    future: {
        hoverOnlyWhenSupported: true,
    },
    theme: {
        fontFamily: {
            workSans: ["var(--font-work-sans)"],
            inter: ["var(--font-inter)"],
            coda: ["var(--font-coda)"],
            reckless: ["var(--font-reckless)"],
        },

        fontSize: {
            cap: [
                "0.625rem",
                {
                    lineHeight: "1.2",
                },
            ],
            xs: [
                "0.75rem",
                {
                    lineHeight: "1.2",
                },
            ],
            sm: [
                "0.875rem",
                {
                    lineHeight: "1.5",
                },
            ],
            base: [
                "1rem",
                {
                    lineHeight: "1.2",
                },
            ],
            lg: [
                "1.125rem",
                {
                    lineHeight: "1.2",
                },
            ],
            xl: [
                "1.25rem",
                {
                    lineHeight: "1.3",
                },
            ],
            "2xl": [
                "1.5rem",
                {
                    lineHeight: "1",
                },
            ],
            "3xl": [
                "1.75rem",
                {
                    lineHeight: "1",
                },
            ],
            "4xl": [
                "2rem",
                {
                    lineHeight: "1",
                },
            ],
            "5xl": [
                "2.25rem",
                {
                    lineHeight: "1",
                },
            ],
            "6xl": [
                "2.75rem",
                {
                    lineHeight: "1",
                },
            ],
            "7xl": [
                "3rem",
                {
                    lineHeight: "1",
                },
            ],
            "8xl": [
                "3.25rem",
                {
                    lineHeight: "1",
                },
            ],
        },
        colors: {
            transparent: "transparent",
            current: "currentColor",

            // Design System flat semantic colors (matches CSS variable names)
            // "text-strong": "hsl(var(--text-strong))",
            // "text-sub": "hsl(var(--text-sub))",
            // "text-soft": "hsl(var(--text-soft))",
            // "text-note": "hsl(var(--text-note))",
            // "text-disable": "hsl(var(--text-disable))",
            // "text-dark-strong": "hsl(var(--text-dark-strong))",
            // "text-dark-sub": "hsl(var(--text-dark-sub))",
            // "text-dark-soft": "hsl(var(--text-dark-soft))",
            // "text-dark-note": "hsl(var(--text-dark-note))",
            // "text-dark-disable": "hsl(var(--text-dark-disable))",

            // "bg-main": "hsl(var(--bg-main))",
            // "bg-surface-1": "hsl(var(--bg-surface-1))",
            // "bg-surface-2": "hsl(var(--bg-surface-2))",
            // "bg-surface-3": "hsl(var(--bg-surface-3))",
            // "bg-surface-4": "hsl(var(--bg-surface-4))",
            // "bg-inverse": "hsl(var(--bg-inverse))",
            // "bg-dark-main": "hsl(var(--bg-dark-main))",
            // "bg-dark-surface-1": "hsl(var(--bg-dark-surface-1))",
            // "bg-dark-surface-2": "hsl(var(--bg-dark-surface-2))",
            // "bg-dark-surface-3": "hsl(var(--bg-dark-surface-3))",
            // "bg-dark-surface-4": "hsl(var(--bg-dark-surface-4))",
            // "bg-dark-inverse": "hsl(var(--bg-dark-inverse))",

            // "border-main": "hsl(var(--border-main))",
            // "border-brown": "hsl(var(--border-brown))",
            // "border-brown-lighter": "hsl(var(--border-brown-lighter))",
            // "border-surface": "hsl(var(--border-surface))",
            // "border-inverse": "hsl(var(--border-inverse))",
            // "border-dark-main": "hsl(var(--border-dark-main))",
            // "border-dark-brown": "hsl(var(--border-dark-brown))",
            // "border-dark-surface": "hsl(var(--border-dark-surface))",
            // "border-dark-inverse": "hsl(var(--border-dark-inverse))",

            // "icon-main": "hsl(var(--icon-main))",
            // "icon-highlight": "hsl(var(--icon-highlight))",
            // "icon-disable": "hsl(var(--icon-disable))",
            // "icon-dark-main": "hsl(var(--icon-dark-main))",
            // "icon-dark-highlight": "hsl(var(--icon-dark-highlight))",
            // "icon-dark-disable": "hsl(var(--icon-dark-disable))",

            typo: {
                brand: "hsl(var(--brand))",
                disable: "hsl(var(--text-disable))",
                primary: "hsl(var(--text-strong))",
                sub: "hsl(var(--text-sub))",
                soft: "hsl(var(--text-soft))",
                note: "hsl(var(--text-note))",
                dark: {
                    brand: "hsl(var(--brand))",
                    disable: "hsl(var(--text-dark-disable))",
                    primary: "hsl(var(--text-dark-strong))",
                    sub: "hsl(var(--text-dark-sub))",
                    soft: "hsl(var(--text-dark-soft))",
                    note: "hsl(var(--text-dark-note))",
                },
            },
            icon: {
                DEFAULT: "hsl(var(--icon))",
                main: "hsl(var(--icon-main))",
                highlight: "hsl(var(--icon-highlight))",
                disable: "hsl(var(--icon-disable))",
                dark: {
                    DEFAULT: "hsl(var(--icon-dark))",
                    main: "hsl(var(--icon-dark-main))",
                    highlight: "hsl(var(--icon-dark-highlight))",
                    disable: "hsl(var(--icon-dark-disable))",
                },
            },
            bd: {
                main: "hsl(var(--border-main))",
                brown: "hsl(var(--border-brown))",
                "brown-lighter": "hsl(var(--border-brown-lighter))",
                surface: "hsl(var(--border-surface))",
                inverse: "hsl(var(--border-inverse))",
                dark: {
                    main: "hsl(var(--border-dark-main))",
                    brown: "hsl(var(--border-dark-brown))",
                    surface: "hsl(var(--border-dark-surface))",
                    inverse: "hsl(var(--border-dark-inverse))",
                },
            },
            bg: {
                main: "hsl(var(--background))",
                disable: "hsl(var(--bg-surface-3))",
                sf1: "hsl(var(--bg-surface-1))",
                sf2: "hsl(var(--bg-surface-2))",
                sf3: "hsl(var(--bg-surface-3))",
                sf4: "hsl(var(--bg-surface-4))",
                dark: {
                    main: "hsl(var(--bg-dark-main))",
                    disable: "hsl(var(--white-100))",
                    sf1: "hsl(var(--bg-dark-surface-1))",
                    sf2: "hsl(var(--bg-dark-surface-2))",
                    sf3: "hsl(var(--bg-dark-surface-3))",
                    sf4: "hsl(var(--bg-dark-surface-4))",
                    grey: "hsl(var(--color-dark-gray))",
                },
                darker: "hsl(var(--black-darker))",
            },
            white: {
                "100": "hsl(var(--bg-main))",
                "200": "hsl(var(--bg-surface-1))",
                "300": "hsl(var(--bg-surface-2))",
                "400": "hsl(var(--bg-surface-3))",
                "500": "hsl(var(--text-dark-sub))",
                "600": "hsl(var(--text-dark-soft))",
                "700": "hsl(var(--text-dark-note))",
                "800": "hsl(var(--text-dark-disable))",
                "900": "hsl(var(--color-sand-dark))",
                main: "hsl(var(--light))",
            },
            brown: {
                "100": "hsl(var(--brown-100))",
                "200": "hsl(var(--brown-200))",
                "300": "hsl(var(--brown-300))",
                "400": "hsl(var(--brown-400))",
            },
            dark: {
                "100": "hsl(var(--bg-dark-surface-1))",
                "200": "hsl(var(--text-strong))",
                "300": "hsl(var(--text-sub))",
                "400": "hsl(var(--text-soft))",
                "500": "hsl(var(--text-note))",
                "600": "hsl(var(--text-disable))",
                "700": "hsl(var(--dark-700))",
                "800": "hsl(var(--bg-dark-surface-3))",
                "900": "hsl(var(--bg-dark-surface-4))",
            },
            black: {
                DEFAULT: "hsl(var(--black))",
            },
            "dark-gray": "hsl(var(--color-dark-gray))",
            brand: {
                DEFAULT: "hsl(var(--brand))",
                darker: "hsl(var(--brand-darker))",
                darkest: "hsl(var(--brand-darkest))",
                "50": "hsl(var(--brand-50))",
                lighter: "hsl(var(--brand-lighter))",
                lightest: "hsl(var(--brand-lightest))",
            },
            purple: {
                DEFAULT: "hsl(var(--purple))",
                "50": "hsl(var(--purple-50))",
                "200": "hsl(var(--purple-200))",
            },
            pink: {
                DEFAULT: "hsl(var(--pink))",
                "50": "hsl(var(--pink-50))",
                "200": "hsl(var(--pink-200))",
            },
            info: "hsl(var(--info))",
            error: {
                DEFAULT: "hsl(var(--error))",
                darker: "hsl(var(--error-darker))",
                darkest: "hsl(var(--error-darkest))",
                lighter: "hsl(var(--error-lighter))",
            },
            warn: {
                DEFAULT: "hsl(var(--warn))",
                darker: "hsl(var(--warn-darker))",
                darkest: "hsl(var(--warn-darkest))",
                lighter: "hsl(var(--warn-lighter))",
            },
            success: {
                DEFAULT: "hsl(var(--success))",
                darker: "hsl(var(--success-darker))",
                darkest: "hsl(var(--success-darkest))",
                lighter: "hsl(var(--success-lighter))",
                "50": "hsl(var(--success-50))",
                "100": "hsl(var(--success-100))",
            },
            complete: {
                DEFAULT: "hsl(var(--complete))",
                "50": "hsl(var(--complete-50))",
                "200": "hsl(var(--complete-200))",
            },
            overlay: {
                DEFAULT: "hsl(var(--overlay))",
            },
        },
        extend: {
            gridTemplateColumns: {
                "16": "repeat(16, minmax(0, 1fr))",
            },
            gridColumn: {
                "span-13": "span 13 / span 13",
                "span-14": "span 14 / span 14",
                "span-15": "span 15 / span 15",
                "span-16": "span 16 / span 16",
            },
            transitionDuration: {
                DEFAULT: "350ms",
            },
            transitionTimingFunction: {
                DEFAULT: "ease-out",
            },
            letterSpacing: {
                "72": "0.02em",
            },
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--sidebar-background))",
                    foreground: "hsl(var(--sidebar-foreground))",
                    primary: "hsl(var(--sidebar-primary))",
                    "primary-foreground":
                        "hsl(var(--sidebar-primary-foreground))",
                    accent: "hsl(var(--sidebar-accent))",
                    "accent-foreground":
                        "hsl(var(--sidebar-accent-foreground))",
                    border: "hsl(var(--sidebar-border))",
                    ring: "hsl(var(--sidebar-ring))",
                },
            },
            screens: {
                dk: {
                    min: "1024px",
                },
                tb: {
                    max: "1024px",
                },
                "j-tb": {
                    max: "1024px",
                    min: "768px",
                },
                mb: {
                    max: "767px",
                },
                "xl-desktop": {
                    min: "1200px",
                },
                "2xl-desktop": {
                    min: "1400px",
                },
                "height-sm": {
                    raw: "(max-height: 320px)",
                },
                "height-md": {
                    raw: "(max-height: 480px)",
                },
                "height-lg": {
                    raw: "(max-height: 640px)",
                },
                "height-xl": {
                    raw: "(max-height: 800px)",
                },
                "hover-hover": { raw: "(hover: hover)" },
            },
            borderRadius: {
                "3xl": "calc(var(--radius) + 0.375rem)",
                "2xl": "calc(var(--radius) + 0.25rem)",
                xl: "calc(var(--radius) + 0.125rem)",
                lg: "var(--radius)",
                md: "calc(var(--radius) - 0.125rem)",
                sm: "calc(var(--radius) - 0.25rem)",
            },
            animation: {
                "spin-slow": "spin 3s linear infinite",
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "slide-in-right": "slide-in-right 0.3s ease-out",
                "slide-in-left": "slide-in-left 0.3s ease-out",
            },
            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
                "slide-in-right": {
                    "0%": { transform: "translateX(100%)" },
                    "100%": { transform: "translateX(0)" },
                },
                "slide-in-left": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0)" },
                },
            },
            boxShadow: {
                custom: "0px 1px 2px 0px rgba(10, 13, 18, 0.05)",
            },
        },
    },
    plugins: [
        require("tailwindcss-animate"),
        plugin(({ addVariant, matchVariant }) => {
            addVariant("header-hidden", "body.header-hidden &");

            addVariant(
                "has-hover",
                "@media (hover: hover) and (pointer: fine)"
            );
            addVariant(
                "no-hover",
                "@media not all and (hover: hover) and (pointer: fine)"
            );

            addVariant(
                "hover-never",
                "@media (hover: hover) and (pointer: fine) { &:hover }"
            );
            matchVariant(
                "group-hover-never",
                (_, { modifier }) =>
                    `@media (hover: hover) and (pointer: fine) { :merge(.group${modifier ? "\\/" + modifier : ""}):hover & }`,
                { values: { DEFAULT: "" } }
            );
            matchVariant(
                "peer-hover-never",
                (_, { modifier }) =>
                    `@media (hover: hover) and (pointer: fine) { :merge(.peer${modifier ? "\\/" + modifier : ""}):hover & }`,
                { values: { DEFAULT: "" } }
            );

            addVariant("hover-always", [
                "@media (hover: hover) and (pointer: fine) { &:hover }",
                "@media not all and (hover: hover) and (pointer: fine)",
            ]);
            matchVariant(
                "group-hover-always",
                (_, { modifier }) => [
                    `@media (hover: hover) and (pointer: fine) { :merge(.group${modifier ? "\\/" + modifier : ""}):hover & }`,
                    "@media not all and (hover: hover) and (pointer: fine)",
                ],
                { values: { DEFAULT: "" } }
            );
            matchVariant(
                "peer-hover-always",
                (_, { modifier }) => [
                    `@media (hover: hover) and (pointer: fine) { :merge(.peer${modifier ? "\\/" + modifier : ""}):hover & }`,
                    "@media not all and (hover: hover) and (pointer: fine)",
                ],
                { values: { DEFAULT: "" } }
            );
        }),
    ],
} satisfies Config;
