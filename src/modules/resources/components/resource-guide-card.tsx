import ImagePlaceholder from "@/components/shared/image-placeholder";
import LinkCustom from "@/components/shared/link-custom";
import { cn } from "@/lib/utils";
import type { ResourceGuideCardData } from "@/modules/resources/types/card";

export default function ResourceGuideCard({
    guide,
    className,
}: {
    guide: ResourceGuideCardData;
    className?: string;
}) {
    return (
        <article
            className={cn(
                "hover:border-bd-primary/60 group relative flex h-full w-full min-w-0 cursor-pointer flex-col gap-8 overflow-hidden border border-bd-main bg-bg-sf1 p-6 transition-all duration-200 tb:w-full tb:shrink-0 tb:gap-8 tb:p-5 mb:w-full mb:gap-6 mb:p-4",
                className
            )}
        >
            {guide.href && (
                <LinkCustom
                    href={guide.href}
                    className="absolute inset-0 z-10"
                    aria-label={guide.title}
                >
                    <span className="sr-only">{guide.title}</span>
                </LinkCustom>
            )}

            <div className="relative h-[6.25rem] w-[9.375rem] shrink-0 overflow-hidden tb:h-20 tb:w-[7.5rem] mb:h-[4.1875rem] mb:w-[6.25rem]">
                <ImagePlaceholder
                    src={guide.imageSrc}
                    alt={guide.imageAlt}
                    width={200}
                    height={150}
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>

            <div className="flex h-full min-w-0 flex-col justify-end gap-3 leading-[1.5]">
                <div className="flex min-w-0 flex-col gap-1">
                    <h3 className="truncate text-base font-semibold text-typo-primary transition-colors group-hover:text-typo-brand">
                        {guide.title}
                    </h3>
                    <p className="break-words text-sm font-normal text-typo-soft">
                        {guide.description}
                    </p>
                </div>
                <p className="mt-auto truncate text-sm font-medium text-typo-soft">
                    {guide.readTime}
                </p>
            </div>
        </article>
    );
}
