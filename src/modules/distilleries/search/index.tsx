"use client";

import SearchComponent from "@/components/shared/search";
import { PARAMS } from "@/lib/constants/route";

type TSearchProps = {
    className?: string;
    placeholder?: string;
};

export default function Search({ className, placeholder }: TSearchProps) {
    return (
        <SearchComponent
            className={className}
            placeholder={placeholder}
            paramName={PARAMS.search}
            inputClassName="rounded-md pl-9 mb:pl-8"
        />
    );
}
