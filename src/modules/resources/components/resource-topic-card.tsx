import LinkCustom from "@/components/shared/link-custom";
import ImagePlaceholder from "@/components/shared/image-placeholder";
import { cn } from "@/lib/utils";
import type { ResourceTopicCardData } from "@/modules/resources/types/card";
import { Button } from "@/components/ui/button";

export function ResourceTopicIcon({
    icon,
}: {
    icon: ResourceTopicCardData["icon"];
}) {
    return (
        <span
            className="flex size-5 items-center justify-center"
            aria-hidden="true"
        >
            <ImagePlaceholder
                src={`/icons/resources/${icon}.svg`}
                alt=""
                width={20}
                height={20}
                imgClassName="object-contain"
            />
        </span>
    );
}

export default function ResourceTopicCard({
    topic,
    className,
}: {
    topic: ResourceTopicCardData;
    className?: string;
}) {
    const hasArticles = topic.articleCount > 0;

    return (
        <article
            className={cn(
                "hover:border-bd-primary/60 group relative flex w-full min-w-0 cursor-pointer flex-col gap-8 overflow-hidden border border-bd-main p-6 transition-all duration-200 tb:h-auto tb:w-full tb:gap-6 tb:p-5 mb:w-full mb:gap-6 mb:p-4",
                className
            )}
        >
            {hasArticles ? (
                <LinkCustom
                    href={topic.href}
                    className="absolute inset-0 z-10"
                    aria-label={topic.title}
                >
                    <span className="sr-only">{topic.title}</span>
                </LinkCustom>
            ) : null}

            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden bg-bg-sf4 text-typo-note transition-colors duration-200 group-hover:text-typo-primary">
                <ResourceTopicIcon icon={topic.icon} />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-end gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate text-base font-semibold leading-6 text-typo-primary tb:text-sm">
                        {topic.title}
                    </h3>
                    <p className="break-words text-sm font-normal leading-[1.5] text-typo-soft">
                        {topic.description}
                    </p>
                </div>

                <div className="flex min-w-0 items-center justify-between gap-4">
                    <p className="truncate text-sm font-medium leading-[1.5] text-typo-primary">
                        {topic.articleCount} articles
                    </p>
                    {hasArticles ? (
                        <Button
                            variant={"link"}
                            asChild
                            className="pointer-events-none"
                        >
                            <span className="shrink-0 text-sm font-medium capitalize text-typo-primary">
                                {topic.actionLabel}
                            </span>
                        </Button>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
