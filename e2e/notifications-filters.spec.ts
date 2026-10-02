import { test, expect } from "@playwright/test";
import { mockNotificationApis } from "./helpers/mock-api";

test.describe("Notification Inbox - Categories & Filters E2E", () => {
    test.beforeEach(async ({ page }) => {
        await mockNotificationApis(page);
        await page.goto("/notifications");
    });

    test("filters notifications by category tab and syncs URL search params", async ({
        page,
    }) => {
        const main = page.getByRole("main");

        const selectTab = async (name: string) => {
            const directButton = main.getByRole("button", {
                name,
                exact: true,
            });
            if (await directButton.isVisible()) {
                await directButton.click();
                return;
            }
            // On mobile viewports, tabs are collapsed inside an accordion
            const accordionTrigger = main.locator("button[data-state]").first();
            await accordionTrigger.click();
            // Once expanded, click the tab button inside the accordion content
            const tabInAccordion = main
                .locator("[data-state='open']")
                .getByRole("button", { name, exact: true })
                .or(main.getByRole("button", { name, exact: true }).last());
            await tabInAccordion.click();
        };

        // 1. Click Buying tab
        await selectTab("Buying");
        await expect(page).toHaveURL(/category=buying/);
        await expect(
            main.getByRole("heading", { name: "Buying", level: 2 })
        ).toBeVisible();
        await expect(main.getByText("Order Confirmed")).toBeVisible();
        await expect(main.getByText("New Bid Placed")).not.toBeVisible();

        // 2. Click Market tab
        await selectTab("Market");
        await expect(page).toHaveURL(/category=market/);
        await expect(
            main.getByRole("heading", { name: "Market", level: 2 })
        ).toBeVisible();
        await expect(main.getByText("New Bid Placed")).toBeVisible();
        await expect(main.getByText("Order Confirmed")).not.toBeVisible();

        // 3. Click Account tab
        await selectTab("Account");
        await expect(page).toHaveURL(/category=account/);
        await expect(
            main.getByRole("heading", { name: "Account", level: 2 })
        ).toBeVisible();
        await expect(main.getByText("Account Verified")).toBeVisible();

        // 4. Click All tab to return
        await selectTab("All");
        await expect(
            main.getByRole("heading", {
                name: "All Notifications",
                level: 2,
            })
        ).toBeVisible();
        await expect(main.getByText("Order Confirmed")).toBeVisible();
        await expect(main.getByText("New Bid Placed")).toBeVisible();
    });

    test("toggles Unread only filter and syncs URL search param", async ({
        page,
    }) => {
        const main = page.getByRole("main");
        const unreadSwitch = main.getByRole("switch");
        await expect(unreadSwitch).toBeVisible();

        // Turn switch ON
        await unreadSwitch.click();
        await expect(page).toHaveURL(/isRead=false/);

        // Should only show the 2 unread items in main
        await expect(main.getByText("Order Confirmed")).toBeVisible();
        await expect(main.getByText("System Maintenance Notice")).toBeVisible();
        await expect(main.getByText("New Bid Placed")).not.toBeVisible();
        await expect(main.getByText("Account Verified")).not.toBeVisible();

        // Turn switch OFF
        await unreadSwitch.click();
        await expect(page).not.toHaveURL(/isRead=false/);

        // Read items should be visible again
        await expect(main.getByText("New Bid Placed")).toBeVisible();
        await expect(main.getByText("Account Verified")).toBeVisible();
    });

    test("displays empty state when no notifications match filter", async ({
        page,
    }) => {
        // Set up mock with 0 notifications
        await mockNotificationApis(page, { initialItems: [] });
        await page.goto("/notifications");

        const main = page.getByRole("main");

        // Verify empty inbox state
        await expect(
            main.getByRole("heading", { name: "No notifications" })
        ).toBeVisible();
        await expect(main.getByText(/You're all caught up!/i)).toBeVisible();
    });
});
