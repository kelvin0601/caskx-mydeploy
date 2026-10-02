import { PAGE_METADATA } from "@/lib/constants/metadata";
import DistilleryAddModule from "@/modules/dashboard/listing-distillery/add";

export const metadata = PAGE_METADATA.ADMIN_LISTING_DISTILLERY_ADD;

export default function DistilleryAddPage() {
    return <DistilleryAddModule />;
}
