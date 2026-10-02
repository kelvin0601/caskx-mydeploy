import { PAGE_METADATA } from "@/lib/constants/metadata";
import PaymentsDetailModule, {
    PaymentDetailModuleWrap,
} from "@/modules/dashboard/payments/payments-detail";

export const metadata = PAGE_METADATA.ADMIN_ORDERS_PAYMENT_DETAIL;

export default async function PaymentsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <PaymentDetailModuleWrap id={id} />;
}
