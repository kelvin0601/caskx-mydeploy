import { PAGE_METADATA } from "@/lib/constants/metadata";
import ResetPasswordModule from "@/modules/reset-password";

export const metadata = PAGE_METADATA.RESET_PASSWORD;

const ResetPasswordPage = async ({
    searchParams,
}: {
    searchParams: Promise<{ token: string }>;
}) => {
    const { token } = await searchParams;
    return <ResetPasswordModule token={token} />;
};

export default ResetPasswordPage;
