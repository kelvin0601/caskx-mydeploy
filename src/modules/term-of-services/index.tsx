"use client";

import { cn } from "@/lib/utils";
import Content from "./content";
import TableOfContent from "./table-of-content";
import { TTermsOfServicesProps } from "./types";

function TermOfServicesModule({
    title,
    lastUpdated,
    content,
    className,
}: TTermsOfServicesProps) {
    return (
        <section className={cn("bg-bg-main", className)}>
            <div className="container w-full py-10 j-tb:py-8 mb:py-6">
                <h1 className="font-reckless text-3xl font-medium text-typo-primary j-tb:text-2xl mb:text-xl mb:leading-none">
                    {title}
                </h1>
                <div className="mt-2 text-base font-normal text-typo-soft j-tb:leading-6 mb:text-sm">
                    Last updated: {lastUpdated}
                </div>
            </div>

            <div className="border-t border-bd-main">
                <div className="container grid min-h-screen items-stretch dk:grid-cols-16 tb:relative tb:flex tb:flex-col">
                    <TableOfContent className="shrink-0 bg-bg-main dk:col-span-3 dk:-mr-[var(--gap-x)] tb:sticky tb:top-[var(--height-header)] tb:w-full" />
                    <Content
                        className="min-w-0 flex-1 border-l border-bd-main p-10 dk:col-span-13 tb:border-l-0 tb:p-8 tb:px-0 tb:py-4 mb:py-6"
                        data={{ title, lastUpdated, content }}
                    />
                </div>
            </div>
        </section>
    );
}

export default TermOfServicesModule;
