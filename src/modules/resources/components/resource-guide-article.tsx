import type { ReactNode } from "react";
import type { SerializedEditorState } from "lexical";
import ResourceRichText from "@/modules/resources/components/resource-rich-text";

export default function ResourceGuideArticle({
    title,
    content,
    emptyContent,
}: {
    title: string;
    content: SerializedEditorState | null;
    emptyContent?: ReactNode;
}) {
    return (
        <article className="flex min-w-0 flex-1 flex-col gap-10 border-l border-bd-main p-10 tb:gap-8 tb:border-l-0 tb:px-0 tb:pb-8 tb:pt-0 mb:gap-6 mb:pb-6">
            <h1 className="break-words font-reckless text-4xl font-medium leading-none text-typo-primary">
                {title}
            </h1>
            {content ? (
                <ResourceRichText data={content} />
            ) : (
                (emptyContent ?? null)
            )}
        </article>
    );
}
