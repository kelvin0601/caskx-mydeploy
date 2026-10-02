"use client";

import SearchInput from "@/components/shared/search-input";
import { useDebounce } from "@/hooks/useDebounce";
import { PARAMS } from "@/lib/constants/route";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, startTransition, useRef } from "react";

type TSearchProps = {
    className?: string;
    inputClassName?: string;
    placeholder?: string;
    paramName?: string;
};

export default function Search(props: TSearchProps) {
    const {
        className,
        inputClassName,
        placeholder = "Search for anything",
        paramName = PARAMS.search,
    } = props;
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const urlSearchParam = searchParams.get(paramName) || "";
    const [search, setSearch] = useState<string>(urlSearchParam);
    const initialRender = useRef(true);

    const debounceSearch = useDebounce(search, 500);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    // Push to URL only when the debounced search term changes
    useEffect(() => {
        if (initialRender.current) {
            initialRender.current = false;
            return;
        }

        // Prevent pushing if it's already in sync with the URL
        if (debounceSearch === urlSearchParam) return;

        const params = new URLSearchParams(searchParams.toString());
        if (debounceSearch) {
            params.set(paramName, debounceSearch);
        } else {
            params.delete(paramName);
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [debounceSearch, paramName]); // Omit searchParams/urlSearchParam to prevent recursive loops

    // Force sync input if URL changes externally
    useEffect(() => {
        if (urlSearchParam !== search) {
            setSearch(urlSearchParam);
        }
    }, [urlSearchParam]);

    return (
        <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={placeholder}
            size="lg"
            className={cn("w-full min-w-[16rem]", className)}
        />
    );
}
