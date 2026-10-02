import { ROUTE_DASHBOARD } from "@/lib/constants";
import { redirect } from "next/navigation";

const DashboardPage = () => {
    redirect(ROUTE_DASHBOARD.CASK);
};

export default DashboardPage;
