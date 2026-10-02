import LinkCustom from "@/components/shared/link-custom";
import { ROUTE_PUBLIC } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const FooterV2 = ({ className }: { className?: string }) => {
    const currentYear = new Date().getFullYear();
    const pathname = usePathname();

    const footerLinks = [
        { label: "Privacy Policy", href: "#" },
        { label: "Buyer Terms of Use", href: ROUTE_PUBLIC.TERMS_OF_USE_BUYER },
        {
            label: "Seller Terms of Use",
            href: ROUTE_PUBLIC.TERMS_OF_USE_SUPPLIER,
        },
        { label: "Trading Fee Announcement", href: "#" },
    ];

    return (
        <footer
            className={cn(
                "relative bg-bg-main before:absolute before:-inset-x-0 before:top-0 before:border-t before:border-bd-main",
                pathname === "/" ? "tb:pb-11" : ""
            )}
        >
            <div
                className={cn(
                    "container mt-auto pb-8 tb:pb-6 mb:pb-0",
                    className
                )}
            >
                {/* Desktop & Tablet Layout */}
                <div className="relative flex flex-row items-center justify-between overflow-hidden pt-8 tb:flex-col tb:items-center tb:gap-3 tb:pt-[1.4375rem] mb:hidden">
                    <div className="flex flex-row items-center tb:flex-wrap tb:gap-y-4 mb:flex-wrap mb:gap-y-3">
                        {footerLinks.map((link) => (
                            <LinkCustom
                                key={link.label}
                                href={link.href}
                                className="border-r border-bd-main px-4 text-sm font-medium leading-[1em] text-typo-soft transition-colors first:pl-0 last:border-none last:pr-0 hover:text-typo-primary mb:text-xs"
                            >
                                {link.label}
                            </LinkCustom>
                        ))}
                    </div>

                    <div className="text-sm text-typo-soft mb:text-xs">
                        © {currentYear} Cask Exchange. All rights reserved.
                    </div>
                </div>

                {/* Mobile Layout */}
                <div className="-mx-[var(--padding-container)] hidden flex-col mb:flex">
                    {/* Copyright Row */}
                    <div className="flex h-[2.375rem] w-full items-center justify-center border-y border-bd-main bg-transparent text-xs text-typo-soft">
                        © {currentYear} Cask Exchange. All rights reserved.
                    </div>

                    {/* Links Row 1 */}
                    <div className="flex h-[2.125rem] w-full flex-row border-b border-bd-main bg-bg-sf2 text-xs text-typo-soft">
                        <LinkCustom
                            href={footerLinks[0].href}
                            className="flex flex-1 items-center justify-center border-r border-bd-main font-normal transition-colors hover:text-typo-primary"
                        >
                            {footerLinks[0].label}
                        </LinkCustom>
                        <LinkCustom
                            href={footerLinks[1].href}
                            className="flex flex-1 items-center justify-center font-normal transition-colors hover:text-typo-primary"
                        >
                            {footerLinks[1].label}
                        </LinkCustom>
                    </div>

                    {/* Links Row 2 */}
                    <div className="flex h-[2.125rem] w-full flex-row border-b border-bd-main bg-bg-sf2 text-xs text-typo-soft">
                        <LinkCustom
                            href={footerLinks[2].href}
                            className="flex flex-1 items-center justify-center border-r border-bd-main font-normal transition-colors hover:text-typo-primary"
                        >
                            {footerLinks[2].label}
                        </LinkCustom>
                        <LinkCustom
                            href={footerLinks[3].href}
                            className="flex flex-1 items-center justify-center font-normal transition-colors hover:text-typo-primary"
                        >
                            {footerLinks[3].label}
                        </LinkCustom>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default FooterV2;
