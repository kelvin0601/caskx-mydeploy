import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfileListingDetailPage({
    params,
}: {
    params: Promise<{ askId: string }>;
}) {
    const { askId } = await params;
    redirect(`${ROUTE_PUBLIC.PAYOUT}/${askId}`);
}
