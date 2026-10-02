import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { redirect } from "next/navigation";

function CheckoutPage() {
    redirect(ROUTE_PUBLIC.HOME);
}

export default CheckoutPage;
