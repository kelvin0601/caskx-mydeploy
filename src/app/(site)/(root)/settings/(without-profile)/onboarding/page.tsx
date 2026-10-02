"use client";
import IconChevonLeft from "@/components/shared/icons/icon-chevon-left";
import LinkCustom from "@/components/shared/link-custom";
import { Button } from "@/components/ui/button";
import { ConnectAccountOnboarding } from "@stripe/react-connect-js";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function Onboarding() {
    const [isLoading, setIsLoading] = useState(true);
    return (
        <div className="flex min-h-screen w-full bg-bg-sf1 py-[80px]">
            <div className="mx-auto flex h-max min-w-[400px] flex-col self-center rounded-lg bg-bg-main p-[24px]">
                <LinkCustom href={"/settings"} className="mx-auto mb-2">
                    <Button variant={"invisible"} className="gap-[2px]">
                        <div className="h-[16px] w-[16px]">
                            <IconChevonLeft />
                        </div>
                        <span className="text-sm text-typo-primary">
                            Back to settings
                        </span>
                    </Button>
                </LinkCustom>
                <div className="no-scrollbar w-full rounded-md">
                    {isLoading && (
                        <div className="flex-center flex min-h-[120px]">
                            <div className="loader-circle mx-auto" />
                        </div>
                    )}
                    <ConnectAccountOnboarding
                        onLoaderStart={() => {
                            setIsLoading(false);
                        }}
                        onExit={() => {
                            redirect("/");
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
