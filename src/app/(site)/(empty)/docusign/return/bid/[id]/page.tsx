"use client";
import { Button } from "@/components/ui/button";
import { CHECKOUT_STEP } from "@/enum/checkout";
import { PATH_CHECKOUT } from "@/lib/constants/path";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

export default function DocusignComplete() {
    const params = useParams<{ id: string }>();
    const searchParams = useSearchParams() as unknown as Record<
        string,
        string | string[] | undefined
    >;
    const checkoutSessionId = params?.id ?? "";
    const event = searchParams?.event as string;
    const query = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
        if (key === "id" || value === undefined) return;
        if (Array.isArray(value)) {
            value.forEach((v) => query.append(key, v));
        } else {
            query.set(key, value);
        }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";

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
                    title: "Docusign Agreement Signed",
                    description:
                        "Your agreement has been signed. You can proceed to the payment step.",
                    link: `${PATH_CHECKOUT}/${checkoutSessionId}/${CHECKOUT_STEP.INVOICE_PAYMENT}${suffix}`,
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
                        //or: Expected an assignment or function call and instead saw an expression.  @typescript-eslint/no-unused-expressions
                        if (onClick) {
                            e.preventDefault();
                            onClick();
                        }
                    }}
                    href={link ?? ""}
                >
                    Proceed To Payment
                </Link>
            </Button>
        </section>
    );
}
