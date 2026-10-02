import { Badge } from "@/components/ui/badge";

type TStatusBadgeProps = {
    status: string;
    text?: string;
};

export function StatusBadge({ status, text }: TStatusBadgeProps) {
    const displayText = text || status;

    // Existing status mappings
    if (status === "Pending")
        return <Badge variant="warning">{displayText}</Badge>;
    if (status === "Invalid")
        return <Badge variant="destructive">{displayText}</Badge>;

    // Verification status mappings
    if (status === "verified")
        return <Badge variant="success">{displayText}</Badge>;
    if (status === "pending")
        return <Badge variant="warning">{displayText}</Badge>;

    if (status === "unverified")
        return <Badge variant="destructive">{displayText}</Badge>;
}
