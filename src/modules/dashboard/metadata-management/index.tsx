"use client";

import IconPlus from "@/components/shared/icons/icon-plus";
import SearchInput from "@/components/shared/search-input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useCallback, useState } from "react";

const ListingCaskTypeModule = dynamic(() => import("../listing-cask-type"), {
    loading: () => <TabContentSkeleton />,
});
const ListingClassificationModule = dynamic(
    () => import("../listing-classification"),
    {
        loading: () => <TabContentSkeleton />,
    }
);

function TabContentSkeleton() {
    return (
        <div
            className="flex min-h-40 flex-1 flex-col gap-3"
            role="status"
            aria-label="Loading metadata"
        >
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
        </div>
    );
}

const METADATA_TABS = [
    { id: "cask-types", label: "Cask Types" },
    { id: "classifications", label: "Classifications" },
] as const;

type MetadataTabId = (typeof METADATA_TABS)[number]["id"];

const TAB_CONFIG: Record<
    MetadataTabId,
    {
        searchPlaceholder: string;
        createLabel: string;
    }
> = {
    "cask-types": {
        searchPlaceholder: "Search cask type",
        createLabel: "Create Cask Type",
    },
    classifications: {
        searchPlaceholder: "Search classification",
        createLabel: "Create Classification",
    },
};

export default function MetadataManagementModule() {
    const [activeTab, setActiveTab] = useState<MetadataTabId>("cask-types");
    const [searchQuery, setSearchQuery] = useState("");
    const [createCaskTypeRequest, setCreateCaskTypeRequest] = useState(0);
    const [createClassificationRequest, setCreateClassificationRequest] =
        useState(0);

    const config = TAB_CONFIG[activeTab];

    const handleTabChange = useCallback((tabId: MetadataTabId) => {
        setActiveTab(tabId);
        setSearchQuery("");
    }, []);

    const handleSearchChange = useCallback((val: string) => {
        setSearchQuery(val);
    }, []);

    const handleCreate = useCallback(() => {
        if (activeTab === "cask-types") {
            setCreateCaskTypeRequest((request) => request + 1);
        } else {
            setCreateClassificationRequest((request) => request + 1);
        }
    }, [activeTab]);

    return (
        <div className="flex min-w-0 flex-1 flex-col overflow-x-clip">
            {/* Page Header */}
            <div className="flex min-h-20 shrink-0 items-center border-b border-bd-main px-10 py-4 tb:px-6 mb:px-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-balance font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                        Metadata Management
                    </h1>
                    <p className="max-w-3xl text-pretty text-sm font-normal leading-snug text-typo-sub mb:text-xs">
                        Manage metadata used to classify and organize casks
                        across the platform.
                    </p>
                </div>
            </div>

            {/* Tab Content Area */}
            <div className="mx-auto flex min-h-0 w-full max-w-[112.5rem] flex-1 flex-col gap-8 px-10 pb-8 pt-10 tb:gap-6 tb:px-6 tb:pt-6 mb:gap-5 mb:px-4 mb:pb-5 mb:pt-5">
                {/* Tabs Row + Search/Action */}
                <div className="flex items-center justify-between gap-6 tb:flex-col tb:items-stretch tb:gap-4">
                    {/* Tabs */}
                    <div
                        className="flex shrink-0 items-center gap-1 mb:grid mb:w-full mb:grid-cols-2"
                        role="tablist"
                        aria-label="Metadata type"
                    >
                        {METADATA_TABS.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => handleTabChange(tab.id)}
                                    className={cn(
                                        "flex h-10 min-w-0 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bd-brown-lighter mb:px-2",
                                        isActive
                                            ? "bg-bg-dark-main text-white-main"
                                            : "hover:bg-bg-dark bg-bg-sf3 text-typo-sub hover:text-typo-primary"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Search + Create Button */}
                    <div className="flex min-w-0 items-center justify-end gap-2 tb:w-full mb:flex-col mb:items-stretch mb:gap-2">
                        <SearchInput
                            className="h-10 w-[18.75rem] min-w-0 flex-1 tb:w-auto"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder={config.searchPlaceholder}
                        />

                        {/* Create Button */}
                        <Button
                            variant="action"
                            className="shrink-0 mb:w-full"
                            onClick={handleCreate}
                        >
                            {config.createLabel}
                            <div className="size-3.5" aria-hidden="true">
                                <IconPlus />
                            </div>
                        </Button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex min-h-0 flex-1 flex-col">
                    {activeTab === "cask-types" && (
                        <ListingCaskTypeModule
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            createRequest={createCaskTypeRequest}
                        />
                    )}
                    {activeTab === "classifications" && (
                        <ListingClassificationModule
                            searchQuery={searchQuery}
                            onSearchChange={handleSearchChange}
                            createRequest={createClassificationRequest}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
