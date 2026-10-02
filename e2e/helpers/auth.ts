import { encode } from "next-auth/jwt";

/**
 * Creates a valid mock NextAuth session cookie for Playwright tests.
 * This satisfies `getToken()` in Next.js middleware and downstream `getServerSession()`.
 */
export async function createMockSessionCookie(
    secret: string = process.env.NEXTAUTH_SECRET ||
        "6zAJjYOqUi9wGFUGvXN3K1A+fao6JrTMraNE5AQfBkA="
): Promise<string> {
    // Generate a valid mock JWT accessToken with expiration 1 year in the future
    const header = Buffer.from(
        JSON.stringify({ alg: "HS256", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
        JSON.stringify({
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
            sub: "test-user-id",
            email: "test@caskexchange.com",
            role: "User",
        })
    ).toString("base64url");
    const mockAccessToken = `${header}.${payload}.mockSignature`;

    const token = {
        id: "test-user-id",
        name: "Test User",
        email: "test@caskexchange.com",
        accessToken: mockAccessToken,
        refreshToken: "mock-refresh-token",
        role: "User" as const,
        sub: "test-user-id",
    };

    return encode({
        secret,
        token,
        maxAge: 30 * 24 * 60 * 60,
    });
}
