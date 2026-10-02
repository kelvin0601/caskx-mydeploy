import MobileNotSupported from "@/components/shared/mobile-not-supported";
import { PAGE_METADATA } from "@/lib/constants/metadata";

export const metadata = PAGE_METADATA.MOBILE_NOT_SUPPORTED;

export default function PageMobileNotSupported() {
    return <MobileNotSupported />;
}
