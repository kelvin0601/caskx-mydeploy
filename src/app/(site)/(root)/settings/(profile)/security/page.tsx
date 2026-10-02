import { PAGE_METADATA } from "@/lib/constants/metadata";
import SecurityModule from "@/modules/security";

export const metadata = PAGE_METADATA.SECURITY;
const SecurityPage = async () => {
    return <SecurityModule />;
};

export default SecurityPage;
