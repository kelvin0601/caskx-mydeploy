import EmptyState from "@/components/shared/empty-state";
import { ROUTE_PUBLIC } from "@/lib/constants/route";

export default function ResourceNotFound() {
    return (
        <EmptyState
            title="Resource not found"
            description="This resource is unavailable."
            action={{
                label: "Browse resources",
                href: ROUTE_PUBLIC.RESOURCES,
            }}
        />
    );
}
