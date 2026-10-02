import axiosInstance from "@/config/axios";
import { TWO_FA_KEYS, SMS_KEYS } from "@/lib/constants/key";
import {
    PATH_AUTH,
    PATH_TWO_FA,
    PATH_DEVICES,
    PATH_RECOVERY,
    PATH_SMS_TWO_FA,
} from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { AuthService } from "./auth";
import { auth } from "@/types";

class AuthWith2FaService extends AuthService {
    async status2FaDevices(): Promise<auth.T2FaStatus> {
        return handleRequest(
            axiosInstance.get(
                `${PATH_AUTH}${PATH_TWO_FA}/${TWO_FA_KEYS.STATUS}`
            )
        );
    }
    async enable2FaGoogleAuthDevice({
        deviceName,
    }: {
        deviceName?: string;
    }): Promise<auth.TEnableGoogleAuth> {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}${PATH_TWO_FA}${PATH_DEVICES}`, {
                ...(deviceName && { deviceName }),
            })
        );
    }
    async get2FaDevices(): Promise<{ devices: auth.T2FaDevice[] }> {
        return handleRequest(
            axiosInstance.get(`${PATH_AUTH}${PATH_TWO_FA}${PATH_DEVICES}`)
        );
    }
    async verifyAccountWith2Fa(data: {
        userId: string;
        tempToken: string;
        token: string;
    }): Promise<{
        id: string;
        email: string;
        accessToken: string;
        refreshToken: string;
    }> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}/${TWO_FA_KEYS.VERIFY_ACCOUNT_WITH_2FA}`,
                data
            )
        );
    }
    async verify2FaDevices(data: { deviceId: string; token: string }): Promise<{
        success: boolean;
    }> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}${PATH_TWO_FA}${PATH_DEVICES}/${TWO_FA_KEYS.VERIFY_GOOGLE_AUTH}`,
                data
            )
        );
    }
    async updateDevices(data: {
        deviceId: string;
        deviceName: string;
    }): Promise<auth.T2FaDevice> {
        return handleRequest(
            axiosInstance.patch(
                `${PATH_AUTH}${PATH_TWO_FA}${PATH_DEVICES}/${data.deviceId}`,
                data
            )
        );
    }
    async deleteDevice(deviceId: string): Promise<unknown> {
        return handleRequest(
            axiosInstance.delete(
                `${PATH_AUTH}${PATH_TWO_FA}${PATH_DEVICES}/${deviceId}`
            )
        );
    }

    async disable2FaGoogleAuthDevices(): Promise<unknown> {
        return handleRequest(
            axiosInstance.delete(
                `${PATH_AUTH}${PATH_TWO_FA}/${TWO_FA_KEYS.DISABLE_GOOGLE_AUTH}`
            )
        );
    }
    async regenerate2FaGoogleAuth(data: { code: string }): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}${PATH_TWO_FA}${PATH_RECOVERY}/${TWO_FA_KEYS.REGENERATE_RECOVERY_CODES}`,
                data
            )
        );
    }
    async startInitSMS2Fa({ id }: { id: string }): Promise<auth.TInitSMS2Fa> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}${PATH_SMS_TWO_FA}/${SMS_KEYS.SMS_START_INIT}`,
                { userId: id }
            )
        );
    }
    async enabledSMS2Fa({ id }: { id: string }): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}${PATH_SMS_TWO_FA}/${SMS_KEYS.SMS_ENABLE}`,
                { userId: id }
            )
        );
    }
    async verifySMS2FaEnable({
        userId,
        otpCode,
    }: {
        userId: string;
        otpCode: string;
    }): Promise<{
        success: boolean;
        message: string;
    }> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}${PATH_SMS_TWO_FA}/${SMS_KEYS.SMS_VERIFY}`,
                {
                    userId,
                    otpCode,
                }
            )
        );
    }
    async chooseMethodSend2Fa({
        userId,
        method,
    }: {
        userId: string;
        method: "sms" | "app";
    }): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}/${SMS_KEYS.INITIATE_SMS_2FA}`, {
                userId,
                method,
            })
        );
    }
    async disableSMS2Fa({ userId }: { userId: string }): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(
                `${PATH_AUTH}${PATH_SMS_TWO_FA}/${SMS_KEYS.SMS_DISABLE}`,
                { userId }
            )
        );
    }
    async verifySMS2FaAuth({
        userId,
        otpCode,
        tempToken,
    }: {
        userId: string;
        otpCode: string;
        tempToken: string;
    }): Promise<unknown> {
        return handleRequest(
            axiosInstance.post(`${PATH_AUTH}/${SMS_KEYS.SMS_VERIFY_2FA}`, {
                userId,
                otpCode,
                tempToken,
            })
        );
    }
}

export const authWith2Fa = new AuthWith2FaService();
