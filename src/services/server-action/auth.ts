import { AUTH_KEYS } from "@/lib/constants";
import { PATH_AUTH } from "@/lib/constants/path";
import { auth } from "@/types";
import { BaseServerAction } from "./base";

class AuthServerAction extends BaseServerAction {
    async whoami(skipRedirect = false): Promise<auth.TUserSchema> {
        return await this.get(
            `${PATH_AUTH}/${AUTH_KEYS.WHOAMI}`,
            {},
            skipRedirect
        );
    }
    async refreshToken(data: { refreshToken: string }): Promise<auth.TToken> {
        // Use skipRefresh=true to prevent infinite loop if refreshToken API also returns 401
        const response = await this.post<auth.TToken>(
            `${PATH_AUTH}/${AUTH_KEYS.REFRESH_TOKEN}`,
            {
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            },
            true // skipRefresh flag
        );
        return response;
    }

    async signOut(skipRedirect = false) {
        return await this.post(
            `${PATH_AUTH}/${AUTH_KEYS.LOGOUT}`,
            {},
            false,
            skipRedirect
        );
    }
}

export const authServerAction = new AuthServerAction();
