import { cn } from "@/lib/utils";
import { TContentProps } from "../types";

export default function Content({ data, className, ...rest }: TContentProps) {
    return (
        <div
            className={cn("rich-text-content", className)}
            // Terms content is application-owned static HTML, not user input.
            dangerouslySetInnerHTML={{ __html: data.content }}
            {...rest}
        />
    );
}
