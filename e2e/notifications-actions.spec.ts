import { test, expect } from "@playwright/test";
import { mockNotificationApis } from "./helpers/mock-api";

test.describe("Notification Inbox - Mark as Read Interactions E2E", () => {
    test.beforeEach(async ({ page }) => {
        await mockNotificationApis(page);
        await page.goto("/notifications");
    });

    test("marks a single notification as read on button click", async ({
        page,
    }) => {
        const main = page.getByRole("main");
        const orderRow = main
            .locator(".group\\/noti")
            .filter({ hasText: "Order Confirmed" });

        // Wait for row to be visible first
        await expect(orderRow).toBeVisible({ timeout: 15000 });

        // Ensure initially unread (has green dot)
        await expect(orderRow.locator(".bg-success")).toBeVisible();

        // Hover over the item to reveal mark as read button on desktop
        await orderRow.hover();

        const markReadBtn = orderRow.getByRole("button", {
            name: "Mark as read",
        });
        await expect(markReadBtn).toBeVisible();

        // Click mark as read
        await markReadBtn.click();

        // Green dot should disappear
        await expect(orderRow.locator(".bg-success")).not.toBeVisible();

        // Mark as read button should no longer exist for this read item
        await expect(
            orderRow.getByRole("button", { name: "Mark as read" })
        ).not.toBeVisible();
    });

    test("marks all notifications as read and disables header button", async ({
        page,
    }) => {
        const main = page.getByRole("main");

        // Wait for list items to be visible first
        await expect(main.getByText("Order Confirmed")).toBeVisible({
            timeout: 15000,
        });

        const markAllButton = main.getByRole("button", {
            name: /mark all read/i,
        });

        // Initially enabled because 2 items are unread
        await expect(markAllButton).toBeEnabled();
        await expect(markAllButton).not.toHaveClass(/cursor-not-allowed/);

        // Click mark all as read
        await markAllButton.click();

        // All unread dots should disappear in main
        await expect(main.locator(".bg-success")).toHaveCount(0);

        // Header button should become disabled with not-allowed cursor
        await expect(markAllButton).toBeDisabled();
        await expect(markAllButton).toHaveClass(/cursor-not-allowed/);
        await expect(markAllButton).toHaveClass(/opacity-40/);
    });
});
