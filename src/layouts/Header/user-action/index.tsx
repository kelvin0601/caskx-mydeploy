import { getServerSession } from "next-auth";
import { OptionNextAuth } from "@/config/auth";
import UserActionClient from "./UserActionClient";

export default async function UserAction() {
    const session = await getServerSession(OptionNextAuth());
    if (!session) return null;

    return <UserActionClient session={session} />;
}
