"use client";

import { Button } from "@/components/ui/button";
import React from "react";
import { useRouter } from "next/navigation";

function NotFound() {
    const router = useRouter();
    return (
        <div className="h-screen items-start bg-bg-main">
            <div className="flex-center flex h-full w-full flex-col items-center">
                <div className="flex-center flex flex-col items-center gap-5 rounded-lg">
                    <span className="text-[13.75rem] leading-none text-typo-primary">
                        404
                    </span>
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-2 px-[95px]">
                            <span className="text-4xl font-medium text-typo-primary">
                                Page not found
                            </span>
                            <span className="text-base">
                                Maybe you got a broken link, or maybe you made a
                                misprint in the address bar.
                            </span>
                        </div>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => router.push("/")}
                        >
                            {"Take me home"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
