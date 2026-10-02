// path/to/ReactScanComponent

"use client";
// react-scan must be imported before react
import { env } from "@/config/env";
import { JSX, useEffect } from "react";

export function ReactScan(): JSX.Element {
    useEffect(() => {
        if (env.isDevelopment && env.enableReactScan) {
            import("react-scan").then(({ scan }) => {
                scan({
                    enabled: true,
                });
            });
        }
    }, []);

    return <></>;
}
