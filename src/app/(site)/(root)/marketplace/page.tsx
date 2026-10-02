import { PAGE_METADATA } from "@/lib/constants/metadata";
import CaskListingModule from "@/modules/cask-listing";

export const metadata = PAGE_METADATA.MARKETPLACE;

export default async function PageCaskListing({
    searchParams,
}: {
    searchParams: Promise<{ filter: string; sortBy: string; search: string }>;
}) {
    const { sortBy, search } = await searchParams;
    return <CaskListingModule sortBy={sortBy} search={search} />;
}
