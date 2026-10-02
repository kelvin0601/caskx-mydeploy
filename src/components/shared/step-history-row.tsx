import React from "react";

type StepHistoryRowProps = {
    title: string;
    by: string;
    at: string;
};

export default function StepHistoryRow({ title, by, at }: StepHistoryRowProps) {
    return (
        <div className="flex flex-row items-center justify-between gap-6 py-3">
            <div className="flex flex-col">
                <h3 className="text-sm font-medium text-typo-primary">
                    {title}
                </h3>
                <div className="text-sm text-typo-note">{by}</div>
            </div>
            <div className="text-sm text-typo-note">{at}</div>
        </div>
    );
}
