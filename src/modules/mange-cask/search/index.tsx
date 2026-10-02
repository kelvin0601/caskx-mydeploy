"use client";

import SearchInput from "@/components/shared/search-input";
import { useManageCask } from "../provider";
import { memo } from "react";

function SearchComp() {
    const { search, setSearch } = useManageCask();

    return (
        <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by cask name or bid ID"
            className="w-80 flex-initial"
        />
    );
}

export default memo(SearchComp);
