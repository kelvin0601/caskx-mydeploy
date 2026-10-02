"use client";

import { useState } from "react";
import { InputWithoutForm } from "@/components/ui/input";
import { LabelWithOutForm } from "@/components/ui/label";
import { TextareaWOutForm } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { VirtualizedCombobox } from "@/components/ui/virtualized-combobox";

const countryOptions = [
    { value: "us", label: "United States" },
    { value: "gb", label: "United Kingdom" },
    { value: "fr", label: "France" },
    { value: "de", label: "Germany" },
    { value: "jp", label: "Japan" },
];

export function FormsTab() {
    const [inputValue, setInputValue] = useState("");
    const [textareaValue, setTextareaValue] = useState("");
    const [selectedValue, setSelectedValue] = useState("");

    return (
        <div className="space-y-8 duration-200 animate-in fade-in">
            <section className="space-y-6">
                <h2 className="border-b border-bd-main pb-2 font-reckless text-2xl font-medium dark:border-bd-dark-main">
                    Form Controls
                </h2>
                <div className="grid grid-cols-2 gap-8 tb:grid-cols-1">
                    <div className="space-y-4">
                        <FormField
                            label="Input Default"
                            htmlFor="input-default"
                        >
                            <InputWithoutForm
                                id="input-default"
                                placeholder="Enter text..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </FormField>
                        <FormField
                            label="Input Password"
                            htmlFor="input-password"
                        >
                            <InputWithoutForm
                                id="input-password"
                                type="password"
                                variant="password"
                                placeholder="Enter password..."
                            />
                        </FormField>
                        <FormField
                            label="Select Dropdown"
                            htmlFor="select-default"
                        >
                            <Select
                                value={selectedValue}
                                onValueChange={setSelectedValue}
                            >
                                <SelectTrigger
                                    id="select-default"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Choose an option..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="cask-1">
                                        Macallan Cask 2012
                                    </SelectItem>
                                    <SelectItem value="cask-2">
                                        Dalmore Cask 2015
                                    </SelectItem>
                                    <SelectItem value="cask-3">
                                        Laphroaig Cask 2009
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>
                    </div>
                    <div className="space-y-4">
                        <FormField label="Textarea" htmlFor="textarea-default">
                            <TextareaWOutForm
                                id="textarea-default"
                                placeholder="Enter paragraph details..."
                                value={textareaValue}
                                onChange={(e) =>
                                    setTextareaValue(e.target.value)
                                }
                            />
                        </FormField>
                        <FormField label="Phone Input">
                            <PhoneInput
                                defaultCountry="US"
                                placeholder="Enter phone number..."
                            />
                        </FormField>
                        <FormField label="Virtualized Combobox">
                            <VirtualizedCombobox
                                options={countryOptions}
                                searchPlaceholder="Select country..."
                            />
                        </FormField>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FormField({
    label,
    htmlFor,
    children,
}: {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <LabelWithOutForm
                htmlFor={htmlFor}
                className="mb-2 block text-xs text-typo-note dark:text-typo-dark-note"
            >
                {label}
            </LabelWithOutForm>
            {children}
        </div>
    );
}
