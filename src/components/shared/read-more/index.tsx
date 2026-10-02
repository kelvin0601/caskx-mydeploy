import { Button } from "@/components/ui/button";
import React, { useState } from "react";

type TReadMoreProps = {
    id: string;
    text?: string;
    amountOfWords?: number;
};

export default function ReadMore({
    id,
    text,
    amountOfWords = 50,
}: TReadMoreProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const splittedText = text?.split(" ");
    const itCanOverflow = (splittedText?.length || 0) > amountOfWords;
    const beginText = itCanOverflow
        ? splittedText?.slice(0, amountOfWords - 1).join(" ")
        : text;
    const endText = splittedText?.slice(amountOfWords - 1).join(" ");

    const handleKeyboard = (e: React.KeyboardEvent) => {
        if (e.code === "Space" || e.code === "Enter") {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <p id={id} className="text-typo-sub tb:text-sm">
            {beginText}
            {itCanOverflow && (
                <>
                    {!isExpanded && <span>... </span>}
                    <span
                        className={`${!isExpanded && "hidden"}`}
                        aria-hidden={!isExpanded}
                    >
                        {endText}
                    </span>
                    {!isExpanded && (
                        <Button
                            variant={"link"}
                            tabIndex={0}
                            className="!inline-flex"
                            aria-expanded={isExpanded}
                            aria-controls={id}
                            onKeyDown={handleKeyboard}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            Show more
                        </Button>
                    )}
                </>
            )}
        </p>
    );
}
