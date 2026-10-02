import { PAGE_METADATA } from "@/lib/constants/metadata";
import PaymentsModule from "@/modules/mange-cask/payments";

export const metadata = PAGE_METADATA.BUYING_PAYMENTS;

const PaymentsPage = () => {
    return <PaymentsModule />;
};

export default PaymentsPage;
