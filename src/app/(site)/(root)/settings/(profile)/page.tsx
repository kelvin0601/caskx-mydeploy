import { PAGE_METADATA } from "@/lib/constants/metadata";
import Account from "@/modules/account";

export const metadata = PAGE_METADATA.ACCOUNT_SETTINGS;

export default function Settings() {
    return <Account />;
}
