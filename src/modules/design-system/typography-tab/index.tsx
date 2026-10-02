"use client";

export function TypographyTab() {
    const fontFamilies = [
        { className: "font-reckless", label: "Reckless (font-reckless)" },
        { className: "font-inter", label: "Inter (font-inter)" },
        { className: "font-workSans", label: "Work Sans (font-workSans)" },
        { className: "font-coda", label: "Coda (font-coda)" },
    ];

    const typeScale = [
        { size: "text-8xl", label: "8xl (3.25rem / 52px)" },
        { size: "text-7xl", label: "7xl (3rem / 48px)" },
        { size: "text-6xl", label: "6xl (2.75rem / 44px)" },
        { size: "text-5xl", label: "5xl (2.25rem / 36px)" },
        { size: "text-4xl", label: "4xl (2rem / 32px)" },
        { size: "text-3xl", label: "3xl (1.75rem / 28px)" },
        { size: "text-2xl", label: "2xl (1.5rem / 24px)" },
        { size: "text-xl", label: "xl (1.25rem / 20px)" },
        { size: "text-lg", label: "lg (1.125rem / 18px)" },
        { size: "text-base", label: "base (1rem / 16px)" },
        { size: "text-sm", label: "sm (0.875rem / 14px)" },
        { size: "text-xs", label: "xs (0.75rem / 12px)" },
        { size: "text-cap", label: "cap (0.625rem / 10px)" },
    ];

    return (
        <div className="space-y-8 duration-200 animate-in fade-in">
            <section className="space-y-4">
                <h2 className="border-b border-bd-main pb-2 font-reckless text-3xl font-medium dark:border-bd-dark-main">
                    Font Families
                </h2>
                <div className="grid grid-cols-2 gap-4 tb:grid-cols-1">
                    {fontFamilies.map((font) => (
                        <div
                            key={font.className}
                            className="border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1"
                        >
                            <span className="mb-2 block text-xs text-typo-note dark:text-typo-dark-note">
                                {font.label}
                            </span>
                            <p
                                className={`${font.className} text-3xl font-light`}
                            >
                                The Quick Brown Fox Jumps Over The Lazy Dog
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="border-b border-bd-main pb-2 font-reckless text-3xl font-medium dark:border-bd-dark-main">
                    Typography Scale
                </h2>
                <div className="divide-y divide-bd-main border border-bd-main bg-bg-sf1 dark:divide-bd-dark-main dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                    {typeScale.map((scale) => (
                        <div
                            key={scale.size}
                            className="flex items-center justify-between gap-4 p-4"
                        >
                            <span className="font-mono w-48 shrink-0 text-xs text-typo-note dark:text-typo-dark-note">
                                {scale.label}
                            </span>
                            <p className={`${scale.size} flex-1 truncate`}>
                                Almost before we knew it, we had left the
                                ground.
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
