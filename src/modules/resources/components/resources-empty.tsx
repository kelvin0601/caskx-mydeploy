import EmptyState from "@/components/shared/empty-state";

export default function ResourcesEmpty({ search = "" }: { search?: string }) {
    return (
        <EmptyState
            title={search ? "No matching resources" : "No resources yet"}
            description={
                search
                    ? "Try another search."
                    : "Check back soon for new content."
            }
            height="min-h-32"
        />
    );
}
