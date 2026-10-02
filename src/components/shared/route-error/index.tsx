"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function RouteError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="font-reckless text-2xl font-medium text-typo-primary">
                Something went wrong
            </h1>
            <p className="max-w-md text-sm text-typo-soft">
                We could not load this page. Please try again.
            </p>
            <Button type="button" onClick={reset}>
                Try again
            </Button>
        </main>
    );
}
