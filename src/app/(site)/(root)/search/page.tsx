import { PAGE_METADATA } from "@/lib/constants/metadata";
import SearchResultsModule from "@/modules/search-results";

export const metadata = PAGE_METADATA.SEARCH;

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; search?: string }>;
}) {
    const { q, search } = await searchParams;
    const query = q || search || "";
    return <SearchResultsModule initialSearchQuery={query} />;
}
