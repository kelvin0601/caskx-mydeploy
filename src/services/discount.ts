import axiosInstance from "@/config/axios";
import { KEY_DISCOUNT } from "@/lib/constants/key";
import { PATH_DISCOUNT } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";

class DiscountServices {
    //EXPIRED
    //LIMITED
    //VIP20
    //VIETNAM15
    //WHISKY10
    //FIRSTORDER
    //ACTIVE
    //INACTIVE
    //EXPIRED
    //LIMITED
    //VIP20
    //VIETNAM15
    //WHISKY10
    applyDiscountCode({
        code,
        orderSubtotal,
        sessionId,
    }: {
        code: string;
        sessionId: string;
        orderSubtotal: number;
    }) {
        return handleRequest<discount.TDiscountResponse>(
            axiosInstance.post(
                `${PATH_DISCOUNT}/${KEY_DISCOUNT.APPLY_DISCOUNT}`,
                {
                    code,
                    orderSubtotal,
                    sessionId,
                }
            )
        );
    }
    confirmDiscountCode({ reservationId }: { reservationId: string }) {
        return handleRequest(
            axiosInstance.post(
                `${PATH_DISCOUNT}/${KEY_DISCOUNT.CONFIRM_DISCOUNT}`,
                {
                    reservationId,
                }
            )
        );
    }
    getActiveDiscountCode() {
        return handleRequest(
            axiosInstance.get<discount.TDiscountResponse>(
                `${PATH_DISCOUNT}/${KEY_DISCOUNT.ACTIVE_DISCOUNT}`
            )
        );
    }
    getReservationDiscountCode() {
        return handleRequest(
            axiosInstance.get<discount.TDiscountResponse[]>(
                `${PATH_DISCOUNT}/${KEY_DISCOUNT.RESERVATION_DISCOUNT}`
            )
        );
    }
    deleteDiscountCode({ reservationId }: { reservationId: string }) {
        return handleRequest(
            axiosInstance.delete(
                `${PATH_DISCOUNT}/${KEY_DISCOUNT.DELETE_DISCOUNT}`,
                {
                    data: {
                        reservationId,
                    },
                }
            )
        );
    }
    getHealthMapDiscountCode() {
        return handleRequest(
            axiosInstance.get<discount.TDiscountResponse[]>(
                `${PATH_DISCOUNT}/${KEY_DISCOUNT.HEALTH_MAP_DISCOUNT}`
            )
        );
    }
}

export const discountServices = new DiscountServices();
