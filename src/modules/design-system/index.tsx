"use client";

import { useState } from "react";
import { TypographyTab } from "./typography-tab";
import { ColorsTab } from "./colors-tab";
import { ButtonsTab } from "./buttons-tab";
import { FormsTab } from "./forms-tab";
import { InteractiveTab } from "./interactive-tab";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

type TTab = "typography" | "colors" | "buttons" | "forms" | "interactive";

const TABS: { key: TTab; label: string }[] = [
    { key: "typography", label: "Typography & Sizing" },
    { key: "colors", label: "Color Palette" },
    { key: "buttons", label: "Buttons" },
    { key: "forms", label: "Form Inputs" },
    { key: "interactive", label: "Interactive & Feedback" },
];

export default function DesignSystemModule() {
    const [activeTab, setActiveTab] = useState<TTab>("typography");

    return (
        <div className="min-h-screen bg-bg-main p-8 text-typo-primary tb:p-6 mb:p-4">
            <div className="mx-auto w-full max-w-[1600px]">
                <header className="mb-10 border-b border-bd-main pb-6">
                    <h1 className="mb-3 font-reckless text-5xl font-light">
                        Cask Exchange Design System
                    </h1>
                    <p className="text-sm text-typo-soft">
                        Reference catalog for typography, sizing, colors, and
                        components.
                    </p>
                </header>

                {/* Tabs Navigation */}
                <div className="mb-8 flex flex-wrap gap-2 border-b border-bd-main pb-4">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.key
                                    ? "border-bd-inverse bg-black text-typo-dark-primary"
                                    : "border-bd-main bg-transparent text-typo-soft hover:border-bd-brown hover:text-typo-primary"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area: Side-by-Side Light and Dark Columns */}
                <div className="grid grid-cols-2 gap-8 tb:grid-cols-1">
                    {/* Light Mode Column */}
                    <div className="space-y-6">
                        <div className="border-b border-bd-main pb-3">
                            <h2 className="text-xl font-semibold text-typo-primary">
                                Light Mode
                            </h2>
                        </div>
                        <div className="min-h-[400px] rounded-lg border border-bd-main bg-bg-main p-6">
                            {activeTab === "typography" && <TypographyTab />}
                            {activeTab === "colors" && <ColorsTab />}
                            {activeTab === "buttons" && <ButtonsTab />}
                            {activeTab === "forms" && <FormsTab />}
                            {activeTab === "interactive" && <InteractiveTab />}
                        </div>
                    </div>

                    {/* Dark Mode Column */}
                    <div className="dark space-y-6 bg-bg-dark-main text-typo-dark-primary">
                        <div className="border-b border-bd-dark-main pb-3">
                            <h2 className="text-xl font-semibold text-typo-dark-primary">
                                Dark Mode
                            </h2>
                        </div>
                        <div className="min-h-[400px] rounded-lg border border-bd-dark-main bg-bg-dark-main p-6 text-typo-dark-primary">
                            {activeTab === "typography" && <TypographyTab />}
                            {activeTab === "colors" && <ColorsTab />}
                            {activeTab === "buttons" && <ButtonsTab />}
                            {activeTab === "forms" && <FormsTab />}
                            {activeTab === "interactive" && <InteractiveTab />}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
