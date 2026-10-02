import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

const ShowMore = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
    const [showFullText, setShowFullText] = useState(false);
    const [hasMoreContent, setHasMoreContent] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            const element = contentRef.current;
            setHasMoreContent(element.scrollHeight > element.clientHeight);
        }
    }, [props.children]);
    return (
        <div className={cn("w-full", className)} ref={ref}>
            <div
                ref={contentRef}
                className={`line-clamp-3 text-base text-typo-soft transition-all duration-300 ${showFullText ? "line-clamp-none" : ""}`}
            >
                {props.children}
            </div>
            <div>
                <div className="inline-flex">
                    <Button
                        variant="link"
                        onClick={() => setShowFullText(true)}
                        className="text-sm text-primary"
                    >
                        Show more
                    </Button>
                </div>
                {hasMoreContent && !showFullText && (
                    <div className="inline-flex">
                        <Button
                            variant="link"
                            onClick={() => setShowFullText(true)}
                            className="text-sm text-primary"
                        >
                            Show more
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
});

export { ShowMore };
ShowMore.displayName = "ShowMore";
