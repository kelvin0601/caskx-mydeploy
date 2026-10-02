import Link from "next/link";
import IconChevonDown from "@/components/shared/icons/icon-chevon-down";
import { getResourceGuideRoute } from "@/lib/constants/route";
import { cn } from "@/lib/utils";

type GuideOption = {
    id: string | number;
    slug: string;
    title: string;
};

export default function ResourceGuideMobileNavigation({
    topicSlug,
    activeGuideSlug,
    guides,
}: {
    topicSlug: string;
    activeGuideSlug: string;
    guides: GuideOption[];
}) {
    const activeGuide = guides.find((guide) => guide.slug === activeGuideSlug);

    return (
        <div className="sticky top-[var(--height-header)] z-20 -mx-[var(--padding-container)] hidden flex-col gap-1 bg-bg-main px-[var(--padding-container)] pt-4 transition-all duration-200 header-hidden:top-px tb:flex">
            <span className="text-xs font-normal text-typo-soft">Article</span>
            <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-bd-main pb-4 text-sm font-semibold text-typo-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bd-brown [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0 flex-1 truncate">
                        {activeGuide?.title ?? "Select guide"}
                    </span>
                    <span
                        aria-hidden="true"
                        className="size-4 shrink-0 transition-transform duration-200 group-open:rotate-180"
                    >
                        <IconChevonDown />
                    </span>
                </summary>
                <nav
                    aria-label="Select guide"
                    className="absolute inset-x-0 top-full z-30 max-h-72 overflow-y-auto border border-t-0 border-bd-main bg-bg-main shadow-md"
                >
                    {guides.map((guide) => {
                        const isActive = guide.slug === activeGuideSlug;
                        return (
                            <Link
                                key={guide.id}
                                aria-current={isActive ? "page" : undefined}
                                className={cn(
                                    "block min-w-0 border-b border-bd-main px-4 py-3 text-sm last:border-b-0 hover:bg-bg-sf2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-bd-brown",
                                    isActive
                                        ? "font-semibold text-typo-primary"
                                        : "text-typo-soft"
                                )}
                                href={getResourceGuideRoute(
                                    topicSlug,
                                    guide.slug
                                )}
                                prefetch
                                scroll={false}
                            >
                                <span className="block truncate">
                                    {guide.title}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </details>
        </div>
    );
}
