import { test, expect } from "@playwright/test";
import { mockNotificationApis } from "./helpers/mock-api";

test.describe("Notification Inbox - Infinite Scroll E2E", () => {
    test("loads additional notifications via infinite scrolling pagination", async ({
        page,
    }) => {
        // Set multiPage to true so notifications are chunked across pages
        await mockNotificationApis(page, { multiPage: true });
        await page.goto("/notifications");

        const main = page.getByRole("main");

        // Verify page 1 items are rendered
        await expect(main.getByText("Order Confirmed")).toBeVisible();
        await expect(main.getByText("System Maintenance Notice")).toBeVisible();

        // Scroll down to ensure sentinel is triggered
        await page.evaluate(() =>
            window.scrollTo(0, document.body.scrollHeight)
        );

        // Verify page 2 items are fetched and appended to the unified list
        await expect(main.getByText("New Bid Placed")).toBeVisible();
        await expect(main.getByText("Platform Terms Updated")).toBeVisible();
    });
});
