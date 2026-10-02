import { getServerSession } from "next-auth";
import { OptionNextAuth } from "@/config/auth";
import HeaderStatsClient from "./HeaderStatsClient";

export default async function HeaderStats() {
    const session = await getServerSession(OptionNextAuth());

    if (!session) return null;

    return <HeaderStatsClient session={session} />;
}
