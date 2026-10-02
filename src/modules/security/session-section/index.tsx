"use client";

import { Button } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";
import { security } from "@/types";
import { UAParser } from "ua-parser-js";
import SecurityContentItem from "../security-content-item";

type TSessionSection = {
    title: string;
    sessions: security.TSession[];
    isCurrentSession: boolean;
    onRevokeSession: (id: string) => void;
    className?: string;
};

export default function SessionSection({
    title,
    sessions,
    isCurrentSession,
    onRevokeSession,
    className,
}: TSessionSection) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {/* Sub-section label */}
            <p className="text-sm font-medium text-typo-primary">{title}</p>

            {/* Session rows */}
            <div className="flex flex-col gap-2">
                {sessions.map((session) => {
                    const device = UAParser(session.deviceInfo);
                    const browser = [device.browser.name, device.browser.major]
                        .filter(Boolean)
                        .join(" ");
                    const os =
                        [device.os.name, device.os.version]
                            .filter(Boolean)
                            .join(" ") || "Unknown Device";

                    const meta = [
                        browser || "Unknown Browser",
                        session.location ?? "Unknown",
                        isCurrentSession
                            ? "Online"
                            : formatDateTime(session.createdAt).dataOnlyNumber,
                    ];

                    return (
                        <SecurityContentItem
                            key={session.id}
                            title={os}
                            meta={meta}
                            rightAction={
                                !isCurrentSession ? (
                                    <Button
                                        variant="link"
                                        className="h-auto p-0 text-sm font-medium text-destructive"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRevokeSession(session.id);
                                        }}
                                    >
                                        Delete
                                    </Button>
                                ) : undefined
                            }
                        />
                    );
                })}
            </div>
        </div>
    );
}
