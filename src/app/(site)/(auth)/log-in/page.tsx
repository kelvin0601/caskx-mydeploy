import { PAGE_METADATA } from "@/lib/constants/metadata";
import LoginModule from "@/modules/login";

export const metadata = PAGE_METADATA.LOG_IN;

const LogInPage = async () => {
    return <LoginModule />;
};

export default LogInPage;
