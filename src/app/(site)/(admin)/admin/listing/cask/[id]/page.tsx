import { PAGE_METADATA } from "@/lib/constants/metadata";
import CaskEditModuleV2 from "@/modules/dashboard/listing-cask/edit_v2";

export const metadata = PAGE_METADATA.ADMIN_LISTING_CASK_EDIT;

export default async function CaskEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CaskEditModuleV2 id={id} />;
}
