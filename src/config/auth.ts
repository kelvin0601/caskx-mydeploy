import { env } from "./env";
import { ROUTE_AUTH } from "@/lib/constants/route";
import { NextAuthOptions, Session } from "next-auth";
import authService from "@/services/auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken, getSession } from "next-auth/react";
import { NextRequest, userAgent } from "next/server";

export const OptionNextAuth = (req?: NextRequest): NextAuthOptions => {
    return {
        debug: env.nextAuthDebug,
        session: {
            maxAge: 60 * 60 * 24 * 28,
            strategy: "jwt",
            generateSessionToken() {
                return "";
            },
        },

        providers: [
            CredentialsProvider({
                id: "login",
                name: "Domain Account",
                credentials: {
                    email: {
                        label: "Email",
                        type: "email",
                        placeholder: "Please enter your email",
                    },
                    password: { label: "Password", type: "password" },
                    accessToken: {
                        label: "accessToken",
                        type: "password",
                    },
                },
                async authorize(credentials) {
                    let userAG = "";
                    if (req) {
                        const { ua } = userAgent(req);
                        userAG = ua || "";
                    }

                    const user = await authService.loginUser(
                        {
                            email: credentials?.email || "",
                            password: credentials?.password || "",
                        },
                        {
                            headers: {
                                "User-Agent": userAG,
                            },
                        }
                    );
                    console.log("user__________", user);

                    if (user) {
                        return {
                            id: user.id,
                            name: `${user.firstName} ${user.lastName}`,
                            email: user?.email,
                            accessToken: user?.accessToken,
                            refreshToken: user?.refreshToken,
                            role: user?.role,
                            image: user?.avatar,
                            tempToken: user?.tempToken,
                            availableMethods: user?.availableMethods,
                            autoInitiatedMethod: user?.autoInitiatedMethod,
                            phoneNumber: user?.phoneNumber,
                        };
                    }
                    return null;
                },
            }),
        ],

        callbacks: {
            async jwt({ token, user, trigger, session }) {
                if (user) {
                    token.id = user.id;
                    token.role = user.role;
                    token.name = user.name as string;
                    token.accessToken = user.accessToken;
                    token.refreshToken = user.refreshToken;
                    token.picture = user.image;
                    token.tempToken = user?.tempToken;
                    token.availableMethods = user?.availableMethods;
                    token.autoInitiatedMethod = user?.autoInitiatedMethod;
                    token.phoneNumber = user?.phoneNumber;
                }
                //catch event refresh token when not authenticated
                if (trigger === "update" && session?.user?.accessToken) {
                    token.accessToken = session?.user?.accessToken;
                    if (session?.user?.refreshToken)
                        token.refreshToken = session?.user?.refreshToken;
                }
                return token;
            },

            async session({ session, token }) {
                session.user.id = token.id!;
                session.user.name = token.name;
                session.user.role = token.role!;
                session.user.accessToken = token.accessToken;
                session.user.refreshToken = token.refreshToken;
                session.user.image = token.picture || "";
                session.user.tempToken = token.tempToken;
                session.user.availableMethods = token.availableMethods;
                session.user.autoInitiatedMethod = token.autoInitiatedMethod;
                session.user.phoneNumber = token.phoneNumber as string;
                return session;
            },
        },
        secret: env.nextAuthSecret,

        pages: {
            signIn: ROUTE_AUTH.LOGIN,
            signOut: "/signout",
            error: "/404",
        },
    };
};

export const updateSession = async (session: Partial<Session>) => {
    const csrfToken = await getCsrfToken();
    try {
        const res = await getSession({
            req: {
                body: {
                    csrfToken: csrfToken,
                    data: {
                        ...session,
                    },
                },
            },
        });
        return res;
    } catch (err) {
        console.error("err", err);
    }
};

// export const updateSessionServer = async (
//     request: NextRequest,
//     session: Partial<Session>
// ): Promise<NextResponse | null> => {
//     try {
//         // Get current session token from request
//         const currentToken = await getToken({ req: request });

//         if (!currentToken) {
//             console.error("No session token found");
//             return null;
//         }

//         // Determine session cookie name based on environment
//         const sessionCookie =
//             process.env.NEXTAUTH_URL?.startsWith("https://")
//                 ? "__Secure-next-auth.session-token"
//                 : "next-auth.session-token";

//         // Merge current token data with new session data
//         const updatedToken = {
//             ...currentToken,
//             ...(session.user?.accessToken && {
//                 accessToken: session.user.accessToken,
//             }),
//             ...(session.user?.refreshToken && {
//                 refreshToken: session.user.refreshToken,
//             }),
//             ...(session.user?.id && { id: session.user.id }),
//             ...(session.user?.role && { role: session.user.role }),
//             ...(session.user?.name && { name: session.user.name }),
//             ...(session.user?.email && { email: session.user.email }),
//             ...(session.user?.image && { picture: session.user.image }),
//             ...(session.user?.tempToken && { tempToken: session.user.tempToken }),
//             ...(session.user?.availableMethods && {
//                 availableMethods: session.user.availableMethods,
//             }),
//             ...(session.user?.autoInitiatedMethod && {
//                 autoInitiatedMethod: session.user.autoInitiatedMethod,
//             }),
//             ...(session.user?.phoneNumber && {
//                 phoneNumber: session.user.phoneNumber,
//             }),
//         };

//         // Encode new session token
//         const newSessionToken = await encode({
//             secret: process.env.NEXTAUTH_SECRET!,
//             token: updatedToken,
//             maxAge: 60 * 60 * 24 * 29, // 29 days (matching session maxAge)
//         });

//         // Create response with updated cookie
//         const response = NextResponse.next();
//         response.cookies.set(sessionCookie, newSessionToken, {
//             httpOnly: true,
//             secure: process.env.NEXTAUTH_URL?.startsWith("https://") || false,
//             sameSite: "lax",
//             path: "/",
//             maxAge: 60 * 60 * 24 * 29, // 29 days
//         });

//         return response;
//     } catch (err) {
//         console.error("Error updating session server-side:", err);
//         return null;
//     }
// };
