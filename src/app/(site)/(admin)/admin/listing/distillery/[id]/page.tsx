import { PAGE_METADATA } from "@/lib/constants/metadata";
import DistilleryEditModule from "@/modules/dashboard/listing-distillery/edit";

export const metadata = PAGE_METADATA.ADMIN_LISTING_DISTILLERY_EDIT;

export default async function DistilleryEditPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <DistilleryEditModule id={id} />;
}
