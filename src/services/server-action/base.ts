import { OptionNextAuth } from "@/config/auth";
import { env } from "@/config/env";
import { ROUTE_AUTH, ROUTE_PUBLIC } from "@/lib/constants";
import { getErrorMessage } from "@/lib/utils";
import { refreshToken as refreshTokenApi } from "@/lib/auth-middleware";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export class BaseServerAction {
    protected BASE_URL = env.public_domain || env.apiUrl;

    private async tryRefreshToken(): Promise<string | null> {
        try {
            const session = await getServerSession(OptionNextAuth());
            const refreshTokenValue = session?.user?.refreshToken;
            if (!refreshTokenValue) return null;
            const newTokens = await refreshTokenApi(refreshTokenValue);
            return newTokens?.accessToken || null;
        } catch {
            return null;
        }
    }

    handleRequest = async (
        promise: Promise<Response>,
        url?: string,
        options?: RequestInit,
        skipRefresh = false,
        skipRedirect = false
    ): Promise<unknown> => {
        try {
            const response = await promise;
            if (!response.ok) {
                throw response as Response;
            }
            return response.json();
        } catch (error: unknown) {
            if ((error as Response).status === 401) {
                if (skipRefresh || !url || !options) {
                    if (skipRedirect) {
                        throw error;
                    }
                    redirect(ROUTE_AUTH.LOGIN);
                }

                const newAccessToken = await this.tryRefreshToken();
                if (!newAccessToken) {
                    if (skipRedirect) {
                        throw error;
                    }
                    redirect(ROUTE_AUTH.LOGIN);
                }

                return await this.handleRequest(
                    fetch(`${this.BASE_URL}${url}`, {
                        ...options,
                        cache: "no-cache",
                        headers: {
                            ...(options.headers as Record<string, string>),
                            Authorization: `Bearer ${newAccessToken}`,
                        },
                    }),
                    url,
                    options,
                    true,
                    skipRedirect
                );
            }

            console.error(
                "[BaseServerAction] Error:",
                getErrorMessage(error, "An unexpected error occurred")
            );

            if (skipRedirect) {
                throw error;
            }

            // Redirect home if have error
            redirect(ROUTE_PUBLIC.NOT_FOUND);
            // throw error;
        }
    };

    async getToken() {
        const session = await getServerSession(OptionNextAuth());
        return session?.user?.accessToken;
    }

    protected async fetch(
        url: string,
        options: RequestInit = {},
        skipRefresh = false,
        skipRedirect = false
    ) {
        const token = await this.getToken();
        const headers: Record<string, string> = {
            ...(options.headers as Record<string, string>),
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        return await this.handleRequest(
            fetch(`${this.BASE_URL}${url}`, {
                ...options,
                cache: "no-cache",
                headers,
            }),
            url,
            options,
            skipRefresh,
            skipRedirect
        );
    }
    protected async get<T>(
        url: string,
        options: RequestInit = {},
        skipRedirect = false
    ): Promise<T> {
        return (await this.fetch(
            url,
            {
                ...options,
                method: "GET",
                cache: "no-cache",
            },
            false,
            skipRedirect
        )) as T;
    }
    protected async post<T>(
        url: string,
        options: RequestInit = {},
        skipRefresh = false,
        skipRedirect = false
    ): Promise<T> {
        return (await this.fetch(
            url,
            {
                ...options,
                method: "POST",
            },
            skipRefresh,
            skipRedirect
        )) as T;
    }
    protected async put(
        url: string,
        options: RequestInit = {},
        skipRedirect = false
    ) {
        return await this.fetch(
            url,
            {
                ...options,
                method: "PUT",
            },
            false,
            skipRedirect
        );
    }
    protected async delete(
        url: string,
        options: RequestInit = {},
        skipRedirect = false
    ) {
        return await this.fetch(
            url,
            {
                ...options,
                method: "DELETE",
            },
            false,
            skipRedirect
        );
    }
}
