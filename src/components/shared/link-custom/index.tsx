import Link, { LinkProps } from "next/link";
import React from "react";

type TLinkCustom = {
    href: string;
    children: React.ReactNode;
    className?: string;
    scroll?: boolean;
} & LinkProps &
    React.AnchorHTMLAttributes<HTMLAnchorElement>;

export default function LinkCustom(props: TLinkCustom) {
    const { href, children, className, ...rest } = props;
    return (
        <Link href={href} className={className} {...rest} prefetch={true}>
            {children}
        </Link>
    );
}
