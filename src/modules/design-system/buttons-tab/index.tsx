"use client";

import { Button } from "@/components/ui/button";

export function ButtonsTab() {
    const buttons = [
        { variant: "default" as const, label: "default (Tab variant)" },
        { variant: "primary" as const, label: "primary" },
        { variant: "secondary" as const, label: "secondary" },
        { variant: "outline" as const, label: "outline" },
        { variant: "outline-text" as const, label: "outline-text" },
        { variant: "tab" as const, label: "tab" },
        { variant: "ghost" as const, label: "ghost" },
        { variant: "link" as const, label: "link" },
    ];

    return (
        <div className="space-y-8 duration-200 animate-in fade-in">
            <section className="space-y-4">
                <h2 className="border-b border-bd-main pb-2 font-reckless text-2xl font-medium dark:border-bd-dark-main">
                    Button Variants
                </h2>
                <div className="grid grid-cols-4 gap-4 tb:grid-cols-2 mb:grid-cols-1">
                    {buttons.map((btn) => (
                        <div
                            key={btn.variant}
                            className="flex flex-col gap-4 border border-bd-main bg-bg-sf1 p-4 dark:border-bd-dark-main dark:bg-bg-dark-sf1"
                        >
                            <span className="text-xs text-typo-note dark:text-typo-dark-note">
                                {btn.label}
                            </span>
                            <div className="flex flex-col gap-2">
                                <Button variant={btn.variant}>
                                    {btn.label.split(" ")[0]} Button
                                </Button>
                                <Button variant={btn.variant} disabled>
                                    {btn.label.split(" ")[0]} Disabled
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
