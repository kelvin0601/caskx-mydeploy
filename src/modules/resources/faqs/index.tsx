"use client";

import { useEffect, useMemo, useState } from "react";
import Breadcrumb from "@/components/shared/breadcrumb";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import ResourceFaqList from "@/modules/resources/components/resource-faq-list";
import {
    ResourceFaqMobileNavigation,
    ResourceFaqSidebar,
} from "@/modules/resources/components/resource-faq-navigation";
import ResourcesEmpty from "@/modules/resources/components/resources-empty";
import { buildFaqGroups } from "@/modules/resources/utils/faq-groups";
import type { ResourceFaq, ResourceFaqGroup } from "@/payload/types/resources";
import { useResourceFaqPreview } from "@/modules/resources/preview/use-resource-faq-preview";

type ResourceFaqsModuleProps = {
    faqGroups: ResourceFaqGroup[];
    faqs: ResourceFaq[];
    livePreview?: boolean;
    previewId?: string;
};

export default function ResourceFaqsModule({
    faqGroups: initialFaqGroups,
    faqs: initialFaqs,
    livePreview = false,
    previewId,
}: ResourceFaqsModuleProps) {
    const { faqGroups, faqs } = useResourceFaqPreview({
        enabled: livePreview,
        initialFaqGroups,
        initialFaqs,
        previewId,
    });
    const groups = useMemo(
        () => buildFaqGroups(faqGroups, faqs),
        [faqGroups, faqs]
    );
    const [activeGroupId, setActiveGroupId] = useState(groups[0]?.id ?? "");

    useEffect(() => {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        const hashGroup = groups.find((group) => group.id === hash);
        const hashFaqId = hash.startsWith("faq-") ? hash.slice(4) : null;
        const faqGroup = hashFaqId
            ? groups.find((group) =>
                  group.faqs.some((faq) => String(faq.id) === hashFaqId)
              )
            : undefined;
        const targetGroup = hashGroup ?? faqGroup;

        if (targetGroup) setActiveGroupId(targetGroup.id);

        requestAnimationFrame(() => {
            const target = hashGroup
                ? document.getElementById(hashGroup.id)
                : Array.from(
                      document.querySelectorAll<HTMLElement>("[data-faq-id]")
                  ).find((element) => element.dataset.faqId === hashFaqId);
            target?.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }, [groups]);

    useEffect(() => {
        const handleScroll = () => {
            const headerHeight = Number.parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                    "--height-header"
                )
            );
            const offset =
                (Number.isNaN(headerHeight) ? 60 : headerHeight) + 48;
            let currentGroup = groups[0]?.id ?? "";

            for (const group of groups) {
                const element = document.getElementById(group.id);
                if (!element) continue;
                if (element.getBoundingClientRect().top <= offset) {
                    currentGroup = group.id;
                } else {
                    break;
                }
            }

            setActiveGroupId((current) =>
                current === currentGroup ? current : currentGroup
            );
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [groups]);

    const scrollToGroup = (groupId: string) => {
        setActiveGroupId(groupId);
        document.getElementById(groupId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
        window.history.replaceState(null, "", `#${groupId}`);
    };

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
                            { label: "FAQs" },
                        ]}
                    />
                </div>
            </div>

            <header className="container flex flex-col gap-2 py-10 tb:py-8 mb:py-6">
                <h1 className="font-reckless text-3xl font-medium leading-none text-typo-primary tb:text-2xl mb:text-xl">
                    FAQs
                </h1>
                <p className="max-w-3xl text-sm font-normal leading-[1.5] text-typo-soft tb:max-w-none">
                    Find answers to frequently asked questions about Cask
                    Exchange and the trading process.
                </p>
            </header>

            <div className="border-t border-bd-main">
                <div className="container flex min-h-[calc(100vh-18rem)] items-stretch tb:flex-col">
                    <ResourceFaqSidebar
                        groups={groups}
                        activeGroupId={activeGroupId}
                        onSelect={scrollToGroup}
                    />

                    <article className="min-w-0 flex-1 p-10 tb:px-0 tb:pb-8 tb:pt-0 mb:pb-6">
                        {groups.length ? (
                            <div className="relative flex w-full flex-col gap-8 tb:gap-8 mb:gap-6">
                                <ResourceFaqMobileNavigation
                                    groups={groups}
                                    activeGroupId={activeGroupId}
                                    onSelect={scrollToGroup}
                                />
                                {groups.map((group, index) => (
                                    <section
                                        key={group.id}
                                        id={group.id}
                                        className="flex scroll-mt-[calc(var(--height-header)+2rem)] flex-col gap-4"
                                    >
                                        <h2 className="font-reckless text-xl font-medium leading-none text-typo-primary mb:text-lg">
                                            {group.title}
                                        </h2>
                                        <ResourceFaqList
                                            faqs={group.faqs}
                                            defaultOpenFirst={index === 0}
                                        />
                                    </section>
                                ))}
                            </div>
                        ) : (
                            <ResourcesEmpty />
                        )}
                    </article>
                </div>
            </div>
        </section>
    );
}
