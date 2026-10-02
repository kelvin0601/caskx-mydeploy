"use client";

import { Button } from "@/components/ui/button";
import React from "react";

export default function CaskEmpty({ onClear }: { onClear?: () => void }) {
    return (
        <div className="my-auto w-full">
            <div className="flex flex-col items-center justify-center gap-6 py-20">
                <div className="flex w-full flex-col items-center gap-2 text-center">
                    <h3 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                        No matching results
                    </h3>
                    <div className="text-base font-normal leading-[1.5] text-typo-soft tb:text-sm">
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
