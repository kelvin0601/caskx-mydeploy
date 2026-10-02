import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import IconArUp from "../icons/icon-ar-up";

export default function BackTop() {
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleScroll = () => {
            setIsShow(window.scrollY > 100);
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-30 tb:right-5 mb:bottom-[3.75rem]">
            <div
                className={cn(
                    "gap flex origin-bottom-left translate-y-0 cursor-pointer select-none flex-row items-center gap-1 transition-all tb:h-full tb:w-full tb:translate-x-0 tb:translate-y-0",
                    isShow ? "opacity-100" : "pointer-events-none opacity-0"
                )}
            >
                <div className="flex-center flex origin-center">
                    <Button
                        aria-label="Back to top"
                        className="aspect-square size-10 min-w-0 p-0"
                        variant={"action"}
                        onClick={() => {
                            window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <div className="size-5">
                            <IconArUp />
                        </div>
                    </Button>
                </div>
            </div>
        </div>
    );
}
