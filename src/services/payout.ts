import axiosInstance from "@/config/axios";
import { KEY_PAYOUT, PATH_ADMIN } from "@/lib/constants";
import { handleRequest } from "@/lib/utils";
import { payout } from "@/types/payout";
import { PayoutServerAction } from "./server-action/payout";

class PayoutServices extends PayoutServerAction {
    constructor() {
        super();
    }

    /**
     * GET /api/admin/settlements
     */
    getAdminSettlements(
        params?: payout.TGetAdminSettlementsParams
    ): Promise<payout.TGetAdminSettlementsResponse> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_ADMIN}/${KEY_PAYOUT.GET_ADMIN_SETTLEMENTS}`,
                {
                    params,
                }
            )
        );
    }

    /**
     * GET /api/admin/settlements/{id}
     */
    getAdminSettlementDetail(
        id: string
    ): Promise<payout.TAdminSettlementDetail> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_ADMIN}/${KEY_PAYOUT.GET_ADMIN_SETTLEMENTS}/${id}`
            )
        );
    }

    /**
     * PATCH /api/admin/settlements/{id}
     */
    updateAdminSettlement(
        id: string,
        data: payout.TUpdateAdminSettlementRequest
    ): Promise<payout.TAdminSettlement> {
        return handleRequest(
            axiosInstance.patch(
                `${PATH_ADMIN}/${KEY_PAYOUT.GET_ADMIN_SETTLEMENTS}/${id}`,
                data
            )
        );
    }
    triggerPayout(id: string): Promise<payout.TAdminSettlement> {
        return handleRequest(
            axiosInstance.patch(
                `${PATH_ADMIN}/${KEY_PAYOUT.GET_ADMIN_SETTLEMENTS}/${id}`,
                {
                    triggerStripePayout: true,
                }
            )
        );
    }
}

const payoutServices = new PayoutServices();

export default payoutServices;
