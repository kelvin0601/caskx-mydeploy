import { test, expect } from "@playwright/test";
import { mockNotificationApis } from "./helpers/mock-api";

test.describe("Header Notification Dropdown Preview E2E", () => {
    test.beforeEach(async ({ page }) => {
        await mockNotificationApis(page);
        await page.goto("/");
    });

    test("opens notification dropdown and renders preview items", async ({
        page,
    }) => {
        const bellButton = page.getByRole("button", {
            name: /open notifications/i,
        });
        await expect(bellButton).toBeVisible();

        // Click bell icon to open preview dropdown
        await bellButton.click();

        // Verify dropdown container and title
        await expect(
            page.getByText("Notifications", { exact: true })
        ).toBeVisible();

        // Verify preview items
        await expect(page.getByText("Order Confirmed")).toBeVisible();
        await expect(page.getByText("System Maintenance Notice")).toBeVisible();

        // Verify "View All Notifications" footer link
        const viewAllLink = page.getByRole("link", {
            name: "View All Notifications",
        });
        await expect(viewAllLink).toBeVisible();

        // Click "View All Notifications" should navigate to /notifications
        await viewAllLink.click();
        await expect(page).toHaveURL(/\/notifications/);
    });

    test("filters preview dropdown by unread only", async ({ page }) => {
        // Open dropdown
        await page.getByRole("button", { name: /open notifications/i }).click();

        const unreadSwitch = page.getByRole("switch", {
            name: /show unread notifications only/i,
        });
        await expect(unreadSwitch).toBeVisible();

        // Toggle unread only
        await unreadSwitch.click({ force: true });

        // Read item ("New Bid Placed") should not be in the unread-only list
        await expect(page.getByText("New Bid Placed")).not.toBeVisible();
        // Unread item should be visible
        await expect(page.getByText("Order Confirmed")).toBeVisible();
    });

    test("marks all notifications as read from inside dropdown", async ({
        page,
    }) => {
        // Open dropdown
        await page.getByRole("button", { name: /open notifications/i }).click();

        const markAllButton = page.getByRole("button", {
            name: "Mark all notifications as read",
        });
        await expect(markAllButton).toBeEnabled();

        // Click mark all read
        await markAllButton.click();

        // Button should become disabled
        await expect(markAllButton).toBeDisabled();
        await expect(markAllButton).toHaveClass(/cursor-not-allowed/);
    });
});
