import { test, expect } from "@playwright/test";

test.describe("Login Page E2E (Unauthenticated)", () => {
    // Override storageState to be unauthenticated for this suite
    test.use({ storageState: { cookies: [], origins: [] } });

    test("loads login page with credentials form", async ({ page }) => {
        await page.goto("/log-in");

        // Verify login heading
        await expect(
            page.getByRole("heading", { name: "Welcome Back!" })
        ).toBeVisible();

        // Verify email and password input fields exist
        await expect(
            page.locator('input#email, input[name="email"]')
        ).toBeVisible();
        await expect(
            page.locator('input#password, input[name="password"]')
        ).toBeVisible();

        // Verify Log In submit button
        await expect(
            page.getByRole("button", { name: /log in/i })
        ).toBeVisible();
    });

    test("redirects unauthenticated user accessing protected route to /log-in", async ({
        page,
    }) => {
        // Navigating to protected route without session token should redirect to login
        await page.goto("/notifications");
        await expect(page).toHaveURL(/\/log-in/);
    });
});
