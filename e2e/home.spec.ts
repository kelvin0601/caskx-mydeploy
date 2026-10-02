import { test, expect } from "@playwright/test";
import { mockNotificationApis } from "./helpers/mock-api";

test.describe("Home Page & Header Navigation E2E", () => {
    test.beforeEach(async ({ page }) => {
        await mockNotificationApis(page);
    });

    test("loads home page and displays header", async ({ page }) => {
        await page.goto("/");

        // Check page title / basic elements
        await expect(page).toHaveTitle(/Cask Exchange/i);

        // Header notification bell icon button
        const notificationButton = page.getByRole("button", {
            name: /open notifications/i,
        });
        if (await notificationButton.isVisible()) {
            await notificationButton.click();
            // Notification preview dropdown should appear
            await expect(
                page.getByText("Notifications", { exact: true })
            ).toBeVisible();
        }
    });
});
