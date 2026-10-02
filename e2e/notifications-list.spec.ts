import { test, expect } from "@playwright/test";
import { mockNotificationApis } from "./helpers/mock-api";

test.describe("Notification Inbox - List & Item Display E2E", () => {
    test.beforeEach(async ({ page }) => {
        await mockNotificationApis(page);
        await page.goto("/notifications");
    });

    test("renders date section headers (Today, Yesterday, Earlier)", async ({
        page,
    }) => {
        // Verify grouped headings are present
        await expect(
            page.getByRole("heading", { name: "Today", exact: true })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "Yesterday", exact: true })
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "Earlier", exact: true })
        ).toBeVisible();
    });

    test("renders notification items with title, description, and status indicator", async ({
        page,
    }) => {
        const main = page.getByRole("main");

        // Verify notification titles inside main inbox
        await expect(main.getByText("Order Confirmed")).toBeVisible();
        await expect(main.getByText("System Maintenance Notice")).toBeVisible();
        await expect(main.getByText("New Bid Placed")).toBeVisible();
        await expect(main.getByText("Platform Terms Updated")).toBeVisible();

        // Verify description content
        await expect(
            main.getByText(
                "Your purchase of Highland Park 1990 has been confirmed."
            )
        ).toBeVisible();

        // Check unread indicator (green dot .bg-success) inside main inbox
        const unreadDots = main.locator(".bg-success");
        // 2 items are unread in default mock
        await expect(unreadDots).toHaveCount(2);
    });

    test("conditionally renders action button only when action link exists", async ({
        page,
    }) => {
        const main = page.getByRole("main");

        // 1. "Order Confirmed" has an action link -> "View Order" button should exist
        const viewOrderLink = main.getByRole("link", { name: "View Order" });
        await expect(viewOrderLink).toBeVisible();
        await expect(viewOrderLink).toHaveAttribute(
            "href",
            "/profile/portfolio"
        );

        // 2. "New Bid Placed" has an action link -> "View Offer" button should exist
        const viewOfferLink = main.getByRole("link", { name: "View Offer" });
        await expect(viewOfferLink).toBeVisible();
        await expect(viewOfferLink).toHaveAttribute("href", "/profile/offer");

        // 3. "Account Verified" has an action link -> "Review Account" button should exist
        const reviewAccountLink = main.getByRole("link", {
            name: "Review Account",
        });
        await expect(reviewAccountLink).toBeVisible();
        await expect(reviewAccountLink).toHaveAttribute(
            "href",
            "/settings/security"
        );

        // 4. "System Maintenance Notice" and "Platform Terms Updated" have NO action links
        const termsRow = main
            .locator(".group\\/noti")
            .filter({ hasText: "Platform Terms Updated" });
        await expect(termsRow.getByRole("link")).not.toBeVisible();

        const systemRow = main
            .locator(".group\\/noti")
            .filter({ hasText: "System Maintenance Notice" });
        await expect(systemRow.getByRole("link")).not.toBeVisible();
    });

    test("enforces cursor-default and non-hoverable style on read item without link", async ({
        page,
    }) => {
        const main = page.getByRole("main");

        // "Platform Terms Updated" is read and has no action link -> non-clickable
        const nonClickableRow = main
            .locator(".group\\/noti")
            .filter({ hasText: "Platform Terms Updated" });

        await expect(nonClickableRow).toBeVisible();
        // Should have cursor-default class
        await expect(nonClickableRow).toHaveClass(/cursor-default/);
        // Should NOT have cursor-pointer
        await expect(nonClickableRow).not.toHaveClass(/cursor-pointer/);
    });
});
