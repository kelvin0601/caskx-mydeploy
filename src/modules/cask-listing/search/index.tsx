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
            inputClassName="w-full rounded-md bg-bg-sf4 pl-9 pr-3 tb:w-[15rem] mb:w-full mb:pl-8"
        />
    );
}
