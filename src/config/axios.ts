import { env } from "./env";
import { ROUTE_AUTH } from "@/lib/constants/route";
import authService from "@/services/auth";
import { auth } from "@/types";
import axios, { AxiosRequestConfig } from "axios";
import { Session } from "next-auth";
import { getSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { updateSession } from "./auth";

const axiosInstance = axios.create({
    baseURL: env.public_domain || env.apiUrl,
    timeout: 30000,
    adapter: "fetch",
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,PATCH,OPTIONS",
        "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Credentials": "true",
        "X-Requested-With": "XMLHttpRequest",
        "X-Forwarded-Proto": "https",
    },
});

/**
 * GLOBAL REQUEST CANCELLATION
 *
 * Map to store active request controllers.
 * This is used to keep track of in-flight GET requests and cancel them if a duplicate
 * request (same endpoint and params) is triggered before the first one finishes.
 * Extremely useful for rapid filter toggles or debounced search inputs.
 */
const activeRequests = new Map<string, AbortController>();

/**
 * Generates a unique key for a request based on its method and BASE URL (ignoring query params).
 * This ensures that a new request to the same endpoint (e.g., /casks?page=2)
 * will correctly cancel an older, pending request to that endpoint (e.g., /casks?page=1).
 */
const generateRequestKey = (config: AxiosRequestConfig) => {
    const url = config.url || "";
    const baseUrl = url.split("?")[0]; // Strip inline query parameters
    return `${config.method?.toLowerCase()}:${baseUrl}`;
};

axiosInstance.interceptors.request.use(async (request) => {
    // -------------------------------------------------------------------------
    // 1. GLOBAL CANCELLATION LOGIC (GET requests only)
    // -------------------------------------------------------------------------
    if (request.method?.toLowerCase() === "get") {
        const requestKey = generateRequestKey(request);

        // If a request with the exact same key is already in flight, cancel it.
        // This prevents race conditions and saves network bandwidth.
        if (activeRequests.has(requestKey)) {
            const previousController = activeRequests.get(requestKey);
            previousController?.abort(
                "Cancelled due to a newer identical request."
            );
            activeRequests.delete(requestKey);
        }

        // Create a new AbortController for the current request,
        // attach its signal to the Axios request, and store it in our Map.
        const controller = new AbortController();
        request.signal = controller.signal;
        activeRequests.set(requestKey, controller);
    }

    // -------------------------------------------------------------------------
    // 2. AUTHENTICATION & QUEUE LOGIC
    // -------------------------------------------------------------------------
    if (!isAccessTokenAttachedToAxiosDefaults()) {
        // Use request queue to prevent multiple concurrent session calls
        await new Promise((resolve, reject) => {
            pendingRequests.push({ resolve, reject });

            if (!isProcessingRequests) {
                isProcessingRequests = true;
                processRequestQueue();
            }
        });

        await setAccessTokenOnRequestAndAsAxiosDefaults(request);
    }
    return request;
});

/**
 * Process the request queue to handle concurrent requests efficiently
 */
const processRequestQueue = async () => {
    while (pendingRequests.length > 0) {
        const batch = pendingRequests.splice(0, 10); // Process up to 10 requests at once

        try {
            // All requests in this batch will use the same session
            await Promise.all(batch.map(({ resolve }) => resolve(undefined)));
        } catch (error) {
            batch.forEach(({ reject }) => reject(error));
        }
    }

    isProcessingRequests = false;
};

axiosInstance.interceptors.response.use(
    (response) => {
        // -------------------------------------------------------------------------
        // 1. GLOBAL CANCELLATION CLEANUP (SUCCESS)
        // -------------------------------------------------------------------------
        // When a request completes successfully, we MUST remove it from the Map
        // to free up memory and prevent the Map from growing indefinitely.
        const requestKey = generateRequestKey(response.config);
        if (activeRequests.has(requestKey)) {
            activeRequests.delete(requestKey);
        }
        return response;
    },
    async (error) => {
        // -------------------------------------------------------------------------
        // 1. GLOBAL CANCELLATION CLEANUP (ERROR/ABORT)
        // -------------------------------------------------------------------------
        if (error.config) {
            const requestKey = generateRequestKey(error.config);
            if (activeRequests.has(requestKey)) {
                activeRequests.delete(requestKey); // Cleanup failed or aborted requests
            }
        }

        // If the error was explicitly thrown by our AbortController (from the Request Interceptor),
        // we catch it here and reject it silently so it doesn't crash the UI.
        if (axios.isCancel(error)) {
            console.log("Request cancelled:", error.message);
            return Promise.reject(error);
        }

        try {
            const isVerify2FA =
                error.config?.url?.includes("/auth/verify-2fa") ||
                error.config?.url?.includes("/auth/verify-sms-2fa");

            // Check if the user is currently visiting any of the public terms or privacy policy pages
            const isPublicPage =
                typeof window !== "undefined" &&
                (window.location.pathname.includes("/terms-of-use") ||
                    window.location.pathname.includes("/privacy-policy"));

            const isPrivacyPolicy =
                error.config?.url?.includes("/terms-of-use/buyer") ||
                error.config?.url?.includes("/terms-of-use/seller") ||
                error.config?.url?.includes("/terms-of-use/shipping-partner");

            if (isVerify2FA || isPrivacyPolicy || isPublicPage) {
                // Do not check/refresh token or trigger redirects on public pages
                return Promise.reject(error);
            }

            if (error.config?.url?.includes("/auth/refresh-token")) {
                console.error("Catch refresh token");
                if (cachedRefreshToken)
                    await authService.emergencyLogout({
                        refreshToken: cachedRefreshToken,
                    });
                await handleSignOut();
                return Promise.reject(error);
            }

            if (error.response?.status === 401 && !error.config._retry) {
                error.config._retry = true; // check point to not loop

                // Clear cached tokens when 401 occurs
                cachedAccessToken = "";

                // Clear session cache to force fresh session fetch for 401 errors
                clearSessionCache();

                const session = await getCachedSession(true); // Force refresh for 401 errors
                const refreshToken = session?.user?.refreshToken || "";

                if (!refreshToken) {
                    console.log("No refresh token", refreshToken);
                    if (typeof window !== "undefined") {
                        await handleSignOut();
                    }
                    return Promise.reject(error);
                }

                try {
                    // Use existing refresh promise if one is in progress
                    if (!refreshTokenPromise && refreshToken) {
                        refreshTokenPromise = authService.refreshToken({
                            refreshToken,
                        });
                    }

                    const result = await refreshTokenPromise;

                    if (!result?.accessToken) {
                        throw new Error("Failed to refresh token");
                    }

                    // Set new access token immediately from result
                    cachedAccessToken = result.accessToken;

                    // Update refresh token if provided
                    if (result.refreshToken) {
                        cachedRefreshToken = result.refreshToken;
                    }

                    // Clear session cache before updating to prevent stale cache
                    clearSessionCache();

                    // Update session with new tokens
                    await updateSession({
                        user: {
                            accessToken: result.accessToken,
                            refreshToken: result.refreshToken || refreshToken,
                            role: session?.user?.role as auth.TRole,
                        },
                    });

                    // Set token on axios defaults and request config directly from result
                    // Don't call getCachedSession() here as it may return stale cache
                    axiosInstance.defaults.headers.common["Authorization"] =
                        `Bearer ${result.accessToken}`;

                    if (error.config?.headers) {
                        error.config.headers["Authorization"] =
                            `Bearer ${result.accessToken}`;
                    } else if (error.config) {
                        error.config.headers = {
                            Authorization: `Bearer ${result.accessToken}`,
                        };
                    }

                    // Clear the refresh promise after successful refresh
                    refreshTokenPromise = null;

                    return axiosInstance(error.config);
                } catch (refreshError) {
                    // Clear the refresh promise on error
                    refreshTokenPromise = null;
                    console.log("Catch refresh error", refreshError);
                    await authService.signOut();
                    if (cachedRefreshToken)
                        await authService.emergencyLogout({
                            refreshToken: cachedRefreshToken,
                        });
                    await handleSignOut();
                    Promise.reject(refreshError);
                }
            }

            return Promise.reject(error);
        } catch (interceptorError) {
            return Promise.reject(interceptorError);
        }
    }
);
const refreshAccessToken = async (errorConfig?: AxiosRequestConfig) => {
    // Force refresh session to get latest token after updateSession
    const session = await getCachedSession(true);

    if (session?.user?.accessToken) {
        cachedAccessToken = session.user.accessToken;
        axiosInstance.defaults.headers.common["Authorization"] =
            `Bearer ${cachedAccessToken}`;

        if (errorConfig?.headers && errorConfig) {
            errorConfig.headers["Authorization"] =
                `Bearer ${cachedAccessToken}`;
        } else if (errorConfig) {
            errorConfig.headers = {
                Authorization: `Bearer ${cachedAccessToken}`,
            };
        }
    }
};
const isAccessTokenAttachedToAxiosDefaults = () => {
    const authHeader = axiosInstance.defaults.headers.common["Authorization"];
    if (authHeader === null || authHeader === undefined || authHeader === "")
        return false;
    else return true;
};

let cachedAccessToken: string = "";
let cachedRefreshToken: string = "";
let refreshTokenPromise: Promise<auth.TToken> | null = null;

// Session caching to prevent multiple getSession calls
let cachedSession: Session | null = null;
let sessionPromise: Promise<Session | null> | null = null;
let sessionCacheTime: number = 0;
const SESSION_CACHE_DURATION = 5000; // 5 seconds cache

// Request queue to handle concurrent requests
let pendingRequests: Array<{
    resolve: (value: void) => void;
    reject: (error: unknown) => void;
}> = [];
let isProcessingRequests = false;

/**
 * Get session with caching to prevent multiple getSession calls
 * Only calls getSession() if cache is expired or doesn't exist
 * @param forceRefresh - If true, bypass cache and fetch fresh session
 */
const getCachedSession = async (forceRefresh: boolean = false) => {
    const now = Date.now();

    // Return cached session if still valid and not forcing refresh
    if (
        !forceRefresh &&
        cachedSession &&
        now - sessionCacheTime < SESSION_CACHE_DURATION
    ) {
        return cachedSession;
    }

    // If there's already a session request in progress and not forcing refresh, wait for it
    if (!forceRefresh && sessionPromise) {
        return await sessionPromise;
    }

    // Clear existing promise if forcing refresh
    if (forceRefresh) {
        sessionPromise = null;
    }

    // Create new session request
    sessionPromise = getSession()
        .then((session) => {
            cachedSession = session;
            sessionCacheTime = now;
            sessionPromise = null; // Clear the promise
            return session;
        })
        .catch((error) => {
            sessionPromise = null; // Clear the promise on error
            throw error;
        });

    return await sessionPromise;
};

/**
 * Clear session cache (call this on logout or when session changes)
 */
export const clearSessionCache = () => {
    cachedSession = null;
    sessionPromise = null;
    sessionCacheTime = 0;
    cachedAccessToken = "";
    cachedRefreshToken = "";

    // Clear pending requests queue
    pendingRequests.forEach(({ reject }) =>
        reject(new Error("Session cleared"))
    );
    pendingRequests = [];
    isProcessingRequests = false;
};

/**
 * Force refresh session cache (call this when session is updated)
 */
export const refreshSessionCache = async () => {
    clearSessionCache();
    return await getCachedSession(true);
};

/**
 * Get session cache statistics for debugging
 */
export const getSessionCacheStats = () => {
    return {
        hasCachedSession: !!cachedSession,
        sessionCacheAge: cachedSession ? Date.now() - sessionCacheTime : 0,
        pendingRequestsCount: pendingRequests.length,
        isProcessingRequests,
        hasCachedAccessToken: !!cachedAccessToken,
        hasCachedRefreshToken: !!cachedRefreshToken,
    };
};

//Add Bear AccessToken
const setAccessTokenOnRequestAndAsAxiosDefaults = async (
    request: AxiosRequestConfig
) => {
    // Always get fresh session if no cached token to ensure we have valid token
    if (!cachedAccessToken) {
        console.log("🔑 Getting session for access token...");
        const startTime = Date.now();
        const session = await getCachedSession();
        const duration = Date.now() - startTime;

        console.log(`⏱️ Session fetch took ${duration}ms`);

        if (session && session.user.accessToken) {
            cachedAccessToken = session.user.accessToken;
            axiosInstance.defaults.headers.common["Authorization"] =
                `Bearer ${session.user.accessToken}`;
        }

        if (session && session.user.refreshToken) {
            cachedRefreshToken = session.user.refreshToken;
        }
    }

    // Always set token on request, even if cached, to ensure it's up to date
    if (cachedAccessToken) {
        if (!request.headers) request.headers = {};
        request.headers.Authorization = `Bearer ${cachedAccessToken}`;
    } else {
        // If still no token after getting session, try one more time with force refresh
        const session = await getCachedSession(true);
        if (session?.user?.accessToken) {
            cachedAccessToken = session.user.accessToken;
            axiosInstance.defaults.headers.common["Authorization"] =
                `Bearer ${session.user.accessToken}`;
            if (!request.headers) request.headers = {};
            request.headers.Authorization = `Bearer ${cachedAccessToken}`;
        }
    }

    console.log("✅ Using cached access token:", !!cachedAccessToken);
};

// Remove AccessToken SignOut
export const unsetAccessTokenAttachedToAxiosDefaults = async () => {
    delete axiosInstance.defaults.headers.common["Authorization"];
    clearSessionCache(); // Clear session cache on logout
};
const handleSignOut = async () => {
    if (typeof window !== "undefined") {
        await signOut();
        redirect(ROUTE_AUTH.LOGIN);
    }
};

export default axiosInstance;
