import { test as setup } from "@playwright/test";
import fs from "fs";
import path from "path";
import { createMockSessionCookie } from "./helpers/auth";

const authFile = path.join(process.cwd(), "playwright/.auth/user.json");

setup("authenticate for e2e tests", async ({ page, baseURL }) => {
    const email = (
        process.env.E2E_USER_EMAIL ||
        process.env.TEST_USER_EMAIL ||
        ""
    ).trim();
    const password = (
        process.env.E2E_USER_PASSWORD ||
        process.env.TEST_USER_PASSWORD ||
        ""
    ).trim();

    // Ensure directory exists
    const dir = path.dirname(authFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    if (email && password) {
        console.log(
            `[auth.setup] Credentials found. Authenticating via login form for: ${email}`
        );

        await page.goto("/log-in");

        // Fill credentials
        const emailInput = page
            .locator('input#email, input[name="email"]')
            .first();
        const passwordInput = page
            .locator('input#password, input[name="password"]')
            .first();

        await emailInput.fill(email);
        await passwordInput.fill(password);

        // Submit form
        const submitButton = page
            .locator('button[type="submit"], button:has-text("Log In")')
            .first();
        await submitButton.click();

        // Wait for successful login or catch potential errors
        try {
            await page.waitForURL((url) => !url.pathname.includes("/log-in"), {
                timeout: 15000,
            });
            console.log(
                `[auth.setup] Login successful! Redirected to: ${page.url()}`
            );
        } catch {
            // Check for error text displayed in the form
            const rootError = await page
                .locator(".text-destructive")
                .textContent()
                .catch(() => null);

            // Check if 2FA dialog popped up
            const is2FA = await page
                .getByRole("dialog")
                .isVisible()
                .catch(() => false);

            if (is2FA) {
                const otpCode = process.env.E2E_OTP_CODE;
                if (otpCode) {
                    console.log("[auth.setup] 2FA detected, filling OTP code");
                    const otpInput = page
                        .locator(
                            'input[data-input-otp="true"], input[autocomplete="one-time-code"]'
                        )
                        .first();
                    if (await otpInput.isVisible()) {
                        await otpInput.fill(otpCode);
                        await page.waitForURL(
                            (url) => !url.pathname.includes("/log-in"),
                            { timeout: 15000 }
                        );
                    }
                } else {
                    console.warn(
                        "[auth.setup] 2FA dialog detected but E2E_OTP_CODE is not provided in env. Please disable 2FA for this test user or set E2E_OTP_CODE."
                    );
                }
            } else if (rootError) {
                console.error(
                    `[auth.setup] Login failed with error message: ${rootError.trim()}`
                );
                throw new Error(
                    `[auth.setup] Authentication failed: ${rootError.trim()}`
                );
            } else {
                throw new Error(
                    `[auth.setup] Timed out waiting for login redirect from ${page.url()}`
                );
            }
        }

        // Save real authenticated browser state (cookies, localStorage, session tokens)
        await page.context().storageState({ path: authFile });
        console.log(
            `[auth.setup] Authenticated storage state saved to ${authFile}`
        );
    } else {
        console.log(
            "[auth.setup] No E2E_USER_EMAIL / E2E_USER_PASSWORD in env. Falling back to mock session cookie."
        );
        const url = new URL(baseURL || "http://localhost:3001");
        const domain = url.hostname;

        const sessionCookieValue = await createMockSessionCookie();

        const storageState = {
            cookies: [
                {
                    name: "next-auth.session-token",
                    value: sessionCookieValue,
                    domain: domain,
                    path: "/",
                    expires: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
                    httpOnly: true,
                    secure: false,
                    sameSite: "Lax" as const,
                },
            ],
            origins: [],
        };

        fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
        console.log(`[auth.setup] Mock storage state saved to ${authFile}`);
    }
});
