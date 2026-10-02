import { PAGE_METADATA } from "@/lib/constants/metadata";
import ForgotPasswordModule from "@/modules/forgot-password";

export const metadata = PAGE_METADATA.FORGOT_PASSWORD;

const ForgotPasswordPage = async () => {
    return <ForgotPasswordModule />;
};

export default ForgotPasswordPage;
