import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import type { ResourceFaq } from "@/payload/types/resources";
import ResourceRichText from "@/modules/resources/components/resource-rich-text";
import ResourcesEmpty from "@/modules/resources/components/resources-empty";

export default function ResourceFaqList({
    faqs,
    defaultOpenFirst = true,
}: {
    faqs: ResourceFaq[];
    defaultOpenFirst?: boolean;
}) {
    if (!faqs.length) return <ResourcesEmpty />;

    return (
        <Accordion
            type="single"
            collapsible
            defaultValue={defaultOpenFirst ? String(faqs[0]?.id) : undefined}
            className="flex min-w-0 flex-col gap-2"
        >
            {faqs.map((faq) => (
                <AccordionItem
                    key={faq.id}
                    value={String(faq.id)}
                    data-faq-id={String(faq.id)}
                    className="border border-bd-main"
                >
                    <AccordionTrigger
                        className="min-w-0 p-[1.4375rem] text-left text-base font-semibold leading-6 text-typo-primary focus-visible:ring-bd-brown data-[state=open]:pb-0 tb:p-5 tb:text-sm tb:leading-[1.5] tb:data-[state=open]:pb-0 mb:p-4 mb:data-[state=open]:pb-0"
                        classNameChevron="size-5 text-typo-soft"
                    >
                        <span className="min-w-0 flex-1 break-words">
                            {faq.question}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-[1.4375rem] pb-[1.4375rem] pt-1 text-sm font-normal leading-[1.5] text-typo-soft tb:px-5 tb:pb-5 mb:px-4 mb:pb-4">
                        <ResourceRichText data={faq.answer} />
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    );
}
