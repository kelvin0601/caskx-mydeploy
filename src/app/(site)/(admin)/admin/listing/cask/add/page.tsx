import { PAGE_METADATA } from "@/lib/constants/metadata";
import CaskAddModuleV2 from "@/modules/dashboard/listing-cask/add_v2";

export const dynamic = "force-dynamic";
export const metadata = PAGE_METADATA.ADMIN_LISTING_CASK_ADD;

export default function CaskAddPage() {
    return <CaskAddModuleV2 />;
}
