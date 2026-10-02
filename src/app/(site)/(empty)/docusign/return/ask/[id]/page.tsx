"use client";

import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { PAGE_METADATA } from "@/lib/constants/metadata";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";

export default function DocusignComplete({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const resolvedParams = use(params);
    const resolvedSearchParams = use(searchParams);

    const event = resolvedSearchParams?.event as string;
    const id = resolvedParams.id ?? "";
    const query = new URLSearchParams();
    Object.entries(resolvedSearchParams).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach((v) => query.append(key, v));
        } else {
            query.set(key, value);
        }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const returnPath = id
        ? `${ROUTE_PUBLIC.PAYOUT}/${id}${suffix}`
        : ROUTE_PUBLIC.PAYOUT;
    const debugInfo = JSON.stringify({ id, searchParams }, null, 2);

    const handleMapContent = () => {
        switch (event) {
            case "ttl_expired":
                return {
                    title: "Docusign Agreement Expired",
                    description:
                        "Your agreement has expired. Please sign a new agreement to continue. Please back to your ask to sign a new agreement.",
                    onClick: () => {
                        if (typeof window !== "undefined") {
                            window.history.back();
                        }
                    },
                };
            default:
                return {
                    title: "Agreement signed successfully",
                    description:
                        "Your agreement has been filed. To finalize your investment, please proceed to the payment step.",
                    link: returnPath,
                };
        }
    };

    const { title, description, onClick, link } = handleMapContent();
    return (
        <section className="text-gray-900 flex min-h-screen flex-col items-center justify-center bg-bg-main px-4 py-16 text-center">
            <Image
                src="/images/docusign_popup.png"
                alt="Docusign popup"
                width={160}
                height={160}
                priority
                className="mb-6 h-40 w-40 object-contain"
            />

            <h1 className="text-lg font-semibold text-typo-primary">{title}</h1>
            <p className="mb-6 mt-2 max-w-xl text-sm">{description}</p>
            <Button variant="secondary" asChild>
                <Link
                    onClick={(e) => {
                        if (onClick) {
                            e.preventDefault();
                            onClick();
                        }
                    }}
                    href={link ?? ""}
                >
                    Back To Your Ask
                </Link>
            </Button>
        </section>
    );
}
