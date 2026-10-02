"use client";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LabelWithOutForm } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function InteractiveTab() {
    return (
        <div className="space-y-8 duration-200 animate-in fade-in">
            {/* Toggle Controls */}
            <section className="space-y-4">
                <h2 className="border-b border-bd-main pb-2 font-reckless text-2xl font-medium dark:border-bd-dark-main">
                    Toggle Controls
                </h2>
                <div className="grid grid-cols-3 gap-6 tb:grid-cols-1">
                    <div className="space-y-4 border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                        <h3 className="text-sm font-semibold text-typo-note dark:text-typo-dark-note">
                            Checkboxes
                        </h3>
                        <div className="flex items-center gap-2">
                            <Checkbox id="chk-1" />
                            <LabelWithOutForm htmlFor="chk-1">
                                Unchecked
                            </LabelWithOutForm>
                        </div>
                        <div className="flex items-center gap-2">
                            <Checkbox id="chk-2" defaultChecked />
                            <LabelWithOutForm htmlFor="chk-2">
                                Checked
                            </LabelWithOutForm>
                        </div>
                    </div>

                    <div className="space-y-4 border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                        <h3 className="text-sm font-semibold text-typo-note dark:text-typo-dark-note">
                            Switches
                        </h3>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm">Default</span>
                            <Switch />
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm">Disabled</span>
                            <Switch disabled />
                        </div>
                    </div>

                    <div className="space-y-4 border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                        <h3 className="text-sm font-semibold text-typo-note dark:text-typo-dark-note">
                            Radio Groups
                        </h3>
                        <RadioGroup defaultValue="r-1">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="r-1" id="r-1" />
                                <LabelWithOutForm htmlFor="r-1">
                                    Option One
                                </LabelWithOutForm>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="r-2" id="r-2" />
                                <LabelWithOutForm htmlFor="r-2">
                                    Option Two
                                </LabelWithOutForm>
                            </div>
                        </RadioGroup>
                    </div>
                </div>
            </section>

            {/* Overlays */}
            <section className="space-y-4">
                <h2 className="border-b border-bd-main pb-2 font-reckless text-2xl font-medium dark:border-bd-dark-main">
                    Feedback & Overlays
                </h2>
                <div className="grid grid-cols-2 gap-6 tb:grid-cols-1">
                    <div className="space-y-4 border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                        <h3 className="text-sm font-semibold text-typo-note dark:text-typo-dark-note">
                            Accordion
                        </h3>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>
                                    What is Cask Exchange?
                                </AccordionTrigger>
                                <AccordionContent>
                                    A premium digital marketplace for trading
                                    whiskey casks.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>

                    <div className="space-y-4 border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                        <h3 className="text-sm font-semibold text-typo-note dark:text-typo-dark-note">
                            Tooltip & Popover
                        </h3>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline">
                                        Hover for Tooltip
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Premium tooltip</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="primary">
                                    Click for Popover
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-60">
                                <p className="text-sm">Popover content here</p>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
            </section>

            {/* Badges */}
            <section className="space-y-4">
                <h3 className="text-sm font-semibold text-typo-note dark:text-typo-dark-note">
                    Badges
                </h3>
                <div className="flex flex-wrap gap-2 border border-bd-main bg-bg-sf1 p-6 dark:border-bd-dark-main dark:bg-bg-dark-sf1">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="outline">Outline</Badge>
                </div>
            </section>
        </div>
    );
}
