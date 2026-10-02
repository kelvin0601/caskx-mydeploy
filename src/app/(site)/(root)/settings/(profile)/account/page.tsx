import { PAGE_METADATA } from "@/lib/constants/metadata";
import Account from "@/modules/account";

export const metadata = PAGE_METADATA.ACCOUNT;

export default function AccountPage() {
    return <Account />;
}
