import axiosInstance from "@/config/axios";
import { SECURITY_KEYS } from "@/lib/constants/key";
import { PATH_SECURITY } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { security } from "@/types";

class SecurityService {
    constructor() {}

    async getSecuritySession() {
        const response = handleRequest<security.TSecuritySession>(
            axiosInstance.get(
                `${PATH_SECURITY}/${SECURITY_KEYS.GET_SECURITY_SESSION}`
            )
        );

        return response;
    }
    async revokeSecuritySession(id: string) {
        const response = handleRequest<{
            message: string;
        }>(
            axiosInstance.post(
                `${PATH_SECURITY}/${SECURITY_KEYS.REVOKE_SESSION}`,
                {
                    sessionIds: [id],
                }
            )
        );
        return response;
    }
    async revokeAllSecuritySession() {
        const response = handleRequest(
            axiosInstance.post(
                `${PATH_SECURITY}/${SECURITY_KEYS.REVOKE_ALL_SESSION}`
            )
        );

        return response;
    }
    async logoutSessionCurrent() {
        const response = handleRequest(
            axiosInstance.post(
                `${PATH_SECURITY}/${SECURITY_KEYS.LOGOUT_CURRENT_SESSION}`
            )
        );
        return response;
    }
}
const securityService = new SecurityService();
export default securityService;
