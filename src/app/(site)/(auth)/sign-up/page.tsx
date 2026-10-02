import { PAGE_METADATA } from "@/lib/constants/metadata";
import SignUpModule from "@/modules/signup";

export const metadata = PAGE_METADATA.SIGN_UP;

const SignUpPage = async () => {
    return <SignUpModule />;
};

export default SignUpPage;
