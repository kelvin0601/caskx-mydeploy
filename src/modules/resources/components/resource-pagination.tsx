import Link from "next/link";
import { PARAMS } from "@/lib/constants/route";
import type { ResourceSearchParams } from "@/modules/resources/utils/search-params";

export default function ResourcePagination({
    page,
    totalPages,
    pathname,
    params,
}: {
    page: number;
    totalPages: number;
    pathname: string;
    params: ResourceSearchParams;
}) {
    if (totalPages <= 1) return null;

    const href = (nextPage: number) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((item) => query.append(key, item));
            } else if (value !== undefined) {
                query.set(key, value);
            }
        });
        query.set(PARAMS.page, String(nextPage));
        return `${pathname}?${query}`;
    };

    return (
        <nav
            aria-label="Resource pages"
            className="flex items-center justify-center gap-6 py-6 text-sm text-typo-primary"
        >
            {page > 1 ? (
                <Link
                    className="underline focus-visible:outline"
                    href={href(page - 1)}
                >
                    Previous
                </Link>
            ) : null}
            <span>
                Page {page} of {totalPages}
            </span>
            {page < totalPages ? (
                <Link
                    className="underline focus-visible:outline"
                    href={href(page + 1)}
                >
                    Next
                </Link>
            ) : null}
        </nav>
    );
}
