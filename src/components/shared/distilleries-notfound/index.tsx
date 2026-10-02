"use client";

import { Button } from "@/components/ui/button";
import React from "react";

export default function DistilleriesEmpty({
    onClear,
}: {
    onClear?: () => void;
}) {
    return (
        <div className="mb-12 mt-6 h-[80vh] w-full py-[7.5rem]">
            <div className="mx-auto flex h-full flex-col items-center justify-center gap-6">
                <div className="flex w-full flex-col items-center gap-2 text-center">
                    <h3 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                        No matching results
                    </h3>
                    <div className="max-w-[28.5rem] text-base font-normal leading-[1.5] text-typo-soft tb:text-sm">
                        <p>We couldn&apos;t find anything matching.</p>
                        <p>
                            Try checking your spelling or adjusting your
                            filters.
                        </p>
                    </div>
                </div>
                {onClear && (
                    <Button variant="link" onClick={onClear}>
                        Clear All
                    </Button>
                )}
            </div>
        </div>
    );
}
