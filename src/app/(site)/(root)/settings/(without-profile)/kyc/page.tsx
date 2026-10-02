import { PAGE_METADATA } from "@/lib/constants/metadata";
import KycModule from "@/modules/kyc";

export const metadata = PAGE_METADATA.KYC;

export default function KycPage() {
    return <KycModule />;
}
