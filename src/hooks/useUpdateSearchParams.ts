"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export const useUpdateSearchParams = (name: string) => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [valueParamsUpdate, setValueParamsUpdate] = useState<
        string | undefined
    >(undefined);

    useEffect(() => {
        setValueParamsUpdate(searchParams.get(name) || "");
    }, [searchParams]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value === "") {
                params.delete(name);
            } else {
                params.set(name, value);
            }
            return params.toString();
        },
        [searchParams]
    );

    const updateParams = useCallback(
        (newValue: string) => {
            const queryString = createQueryString(name, newValue);
            router.push(`${pathname}${queryString ? `?${queryString}` : ""}`, {
                scroll: false,
            });
        },
        [searchParams, pathname, name, createQueryString, router]
    );

    return {
        updateParams,
        valueParamsUpdate,
        valueParams: searchParams.get(name) || "", // Add this line to return the value from searchParams
    };
};
