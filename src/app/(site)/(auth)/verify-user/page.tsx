import { PAGE_METADATA } from "@/lib/constants/metadata";
import VerifyModule from "@/modules/verify";
import React from "react";

export const metadata = PAGE_METADATA.VERIFY_USER;

export default async function VerifyUserPage({
    searchParams,
}: {
    searchParams: Promise<{ token: string }>;
}) {
    const { token } = await searchParams;
    return <VerifyModule token={token} />;
}
