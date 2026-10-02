"use client";

import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { redirect, useRouter } from "next/navigation";

export default function ButtonRedirectHome({
    className,
}: {
    className?: string;
}) {
    const router = useRouter();
    return (
        <Button
            variant={"secondary"}
            onClick={() => router.push(ROUTE_PUBLIC.HOME)}
            className={className}
        >
            Back to home
        </Button>
    );
}
