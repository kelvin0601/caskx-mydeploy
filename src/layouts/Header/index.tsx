import { OptionNextAuth } from "@/config/auth";
import { MENU_NAVIGATION, ROUTE_DASHBOARD } from "@/lib/constants";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import HeaderClient from "./HeaderClient";
import HeaderStats from "./header-stats";
import { Menu } from "./menu";
import UserAction from "./user-action";

async function getMenuItems() {
    const session = await getServerSession(OptionNextAuth());
    const isAdmin = session?.user?.role === "Admin";
    return isAdmin
        ? MENU_NAVIGATION
        : MENU_NAVIGATION.filter((item) => item.href !== ROUTE_DASHBOARD.ROOT);
}

export default async function Header() {
    const menuItems = await getMenuItems();
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const parser = await new UAParser(userAgent);
    const device = await parser.getDevice();
    const isMobile = device.type === "mobile" || device.type === "tablet";

    return (
        <HeaderClient
            menuItems={menuItems}
            headerStats={<HeaderStats />}
            userAction={<UserAction />}
            isMobile={isMobile}
        >
            <Menu menuItems={menuItems} />
        </HeaderClient>
    );
}
