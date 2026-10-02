import axiosInstance from "@/config/axios";
import { AUTH_KEYS, LICENSE_KEYS, SECURITY_KEYS } from "@/lib/constants/key";
import { PATH_AUTH } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { auth } from "@/types";
import { AxiosRequestConfig } from "axios";

export class AuthService {
    async registerUser(data: auth.TRegisterUser): Promise<auth.TUserSchema> {
        return handleRequest(
            axiosInstance.post<auth.TUserSchema>(
                `${PATH_AUTH}/${AUTH_KEYS.SIGNUP}`,
                data
            )
        );
    }

    async whoami(): Promise<auth.TUserSchema> {
        return handleRequest(
            axiosInstance.get<auth.TUserSchema>(
                `${PATH_AUTH}/${AUTH_KEYS.WHOAMI}`
            )
        );
    }
    async verifyUser(data: auth.TVerifyUser): Promise<{ email: string }> {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}/${AUTH_KEYS.VERIFY}`, data)
        );
    }
    async verifyTokenResetPassword(data: { token: string }) {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}/${AUTH_KEYS.CHECK_RESET_PASSWORD}`,
                data
            )
        );
    }

    async loginUser(
        data: auth.TLoginUser,
        config?: AxiosRequestConfig<{ userAgent: string }>
    ): Promise<auth.TUserSchema> {
        return handleRequest(
            axiosInstance.post<auth.TUserSchema>(
                `${PATH_AUTH}/${AUTH_KEYS.SIGNIN}`,
                {
                    ...data,
                },
                config
            )
        );
    }

    async resendEmailVerification(email: string): Promise<void> {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}/${AUTH_KEYS.RESEND_EMAIL}`, {
                email,
            })
        );
    }

    async updateUser(
        data: Partial<auth.TUserSchema>
    ): Promise<auth.TUserSchema> {
        return handleRequest(
            axiosInstance.put<auth.TUserSchema>("/api/user/update", data)
        );
    }

    async fetchUser(): Promise<auth.TUserSchema> {
        return handleRequest(
            axiosInstance.get<auth.TUserSchema>("/user/get-info")
        );
    }

    async forgotPassword(data: auth.TForgotPassword): Promise<void> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}/${AUTH_KEYS.FORGOT_PASSWORD}`,
                data
            )
        );
    }

    async resetPassword(data: {
        token: string;
        password: string;
    }): Promise<void> {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}/${AUTH_KEYS.RESET_PASSWORD}`, data)
        );
    }
    async changePassword(data: {
        oldPassword: string;
        password: string;
        confirmPassword: string;
    }): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}/${AUTH_KEYS.CHANGE_PASSWORD}`,
                data
            )
        );
    }
    async getUserList(params: {
        search: string;
        page?: number;
        pageSize?: number;
        sortField?: string;
        sortOrder?: string;
    }): Promise<unknown> {
        return handleRequest(
            axiosInstance.get<unknown>("/api/user-management", { params })
        );
    }

    async getUserDetail(id: number): Promise<auth.TUserSchema> {
        return handleRequest(
            axiosInstance.get<auth.TUserSchema>(`/api/user-management/${id}`)
        );
    }
    async getLicenseType(): Promise<Record<string, string>> {
        return handleRequest(
            axiosInstance.get(`${PATH_AUTH}/${LICENSE_KEYS.TTB_LICENSE_TYPES}`)
        );
    }
    async refreshToken(data: { refreshToken: string }): Promise<auth.TToken> {
        return handleRequest(
            axiosInstance.post<auth.TToken>(
                `${PATH_AUTH}/${AUTH_KEYS.REFRESH_TOKEN}`,
                data
            )
        );
    }
    async signOut() {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}/${AUTH_KEYS.LOGOUT}`)
        );
    }
    async verifyPassword(data: { userId: string; password: string }): Promise<{
        success: boolean;
        message: string;
    }> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}/${AUTH_KEYS.VERIFY_PASSWORD}`,
                data
            )
        );
    }
    async emergencyLogout({ refreshToken }: { refreshToken: string }) {
        //logOut with session devices
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}/${SECURITY_KEYS.EMERGENCY_LOGOUT}`,
                {
                    refreshToken,
                }
            )
        );
    }
}

const authService = new AuthService();
export default authService;
