import Link from "next/link";
import { cn } from "@/lib/utils";
import Breadcrumb from "@/components/shared/breadcrumb";
import ResourceGuideMobileNavigation from "@/modules/resources/components/resource-guide-mobile-navigation";
import ResourceRichText from "@/modules/resources/components/resource-rich-text";
import {
    getResourceGuideRoute,
    getResourceTopicRoute,
    ROUTE_PUBLIC,
} from "@/lib/constants/route";
import type { ResourceGuide, ResourceTopic } from "@/payload/types/resources";
import { getReadTimeMinutes } from "@/modules/resources/utils/read-time";

export default function ResourceTopicGuideLayout({
    topic,
    guides,
    guide,
}: {
    topic: ResourceTopic;
    guides: ResourceGuide[];
    guide: ResourceGuide;
}) {
    return (
        <section className="min-h-screen bg-bg-main">
            <div className="border-b border-bd-main">
                <div className="container flex items-center py-3">
                    <Breadcrumb
                        items={[
                            {
                                label: "Resources",
                                href: ROUTE_PUBLIC.RESOURCES,
                            },
                            {
                                label: topic.title,
                                href: getResourceTopicRoute(topic.slug),
                            },
                            { label: guide.title },
                        ]}
                    />
                </div>
            </div>

            <header className="container flex flex-col gap-2 py-10 tb:py-8 mb:py-6">
                <h1 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                    {topic.title}
                </h1>
                <p className="max-w-3xl text-sm font-normal leading-[1.5] text-typo-soft tb:max-w-none">
                    {topic.description}
                </p>
            </header>

            <div className="border-t border-bd-main">
                <div className="container flex min-h-[calc(100vh-10rem)] items-stretch tb:flex-col">
                    <div className="w-[20.3125rem] shrink-0 border-r border-bd-main tb:hidden">
                        <aside
                            aria-label={`${topic.title} articles`}
                            className="sticky top-[var(--height-header)] z-10 max-h-[calc(100vh-var(--height-header))] w-full overflow-y-auto bg-bg-main transition-all duration-100 header-hidden:top-0 header-hidden:max-h-screen"
                        >
                            <nav className="flex flex-col">
                                {guides.map((item) => {
                                    const isActive = item.id === guide.id;
                                    return (
                                        <Link
                                            key={item.id}
                                            aria-current={
                                                isActive ? "page" : undefined
                                            }
                                            className={cn(
                                                "flex w-full items-center justify-between gap-2 border-b border-bd-main px-6 py-4 text-left text-sm font-semibold leading-[1.5] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px]",
                                                isActive
                                                    ? "text-typo-primary"
                                                    : "text-typo-soft hover:text-typo-primary"
                                            )}
                                            href={getResourceGuideRoute(
                                                topic.slug,
                                                item.slug
                                            )}
                                            prefetch
                                            scroll={false}
                                        >
                                            <span className="min-w-0 break-words">
                                                {item.title}
                                            </span>
                                            {isActive ? (
                                                <span
                                                    aria-hidden="true"
                                                    className="size-1.5 shrink-0 rounded-full bg-typo-primary"
                                                />
                                            ) : null}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>
                    </div>

                    <article className="min-w-0 flex-1 p-10 tb:px-0 tb:pb-8 tb:pt-0 mb:pb-6">
                        <div className="relative flex max-w-4xl flex-col gap-8 tb:gap-8 mb:gap-6">
                            <ResourceGuideMobileNavigation
                                topicSlug={topic.slug}
                                activeGuideSlug={guide.slug}
                                guides={guides}
                            />
                            <h2 className="break-words font-reckless text-4xl font-medium leading-none text-typo-primary tb:text-3xl mb:text-2xl">
                                {guide.title}
                            </h2>
                            <ResourceRichText data={guide.content} />
                        </div>
                    </article>
                </div>
            </div>
        </section>
    );
}
