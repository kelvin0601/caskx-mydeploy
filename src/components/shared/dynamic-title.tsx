"use client";

import { APP_NAME } from "@/lib/constants/app";
import { useEffect } from "react";

export default function DynamicTitle({ title }: { title?: string }) {
    useEffect(() => {
        if (title) {
            document.title = `${title} | ${APP_NAME}`;
        }
    }, [title]);

    return null;
}
