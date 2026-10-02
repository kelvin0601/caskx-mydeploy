"use client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import LinkCustom from "../link-custom";

const links = [
    {
        title: "Profile",
        href: "/user/profile",
    },
    {
        title: "Orders",
        href: "/user/orders",
    },
];

const UserMainNav = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) => {
    const pathname = usePathname();
    return (
        <nav
            className={cn(
                "flex items-center space-x-4 lg:space-x-6",
                className
            )}
            {...props}
        >
            {links.map((link) => (
                <LinkCustom
                    key={link.title}
                    href={link.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        pathname.includes(link.href)
                            ? ""
                            : "text-muted-foreground"
                    )}
                >
                    {link.title}
                </LinkCustom>
            ))}
        </nav>
    );
};

export default UserMainNav;
