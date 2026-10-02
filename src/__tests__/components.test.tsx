// Mock query-string to avoid ESM issues
jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([k, v]) => `${k}=${v}`)
            .join("&")
    ),
    parse: jest.fn((str) => Object.fromEntries(new URLSearchParams(str))),
}));

jest.mock("lucide-react", () => ({
    EyeIcon: () => <span data-testid="eye-icon" />,
    EyeOff: () => <span data-testid="eye-off-icon" />,
    ShoppingCart: () => <span data-testid="shopping-cart-icon" />,
    Shield: () => <span data-testid="shield-icon" />,
    TrendingUp: () => <span data-testid="trending-up-icon" />,
    CheckCheck: () => <span data-testid="check-check-icon" />,
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/notifications",
}));

import { render, screen, fireEvent } from "@testing-library/react";
import { StatItem } from "@/components/shared/stat-item";
import RankBadge from "@/components/shared/rank-badge";
import StatusAlert from "@/components/shared/status-alert";
import SearchInput from "@/components/shared/search-input";

// ============================================
// StatItem Component
// ============================================
describe("StatItem", () => {
    it("renders title and value", () => {
        render(<StatItem title="Total" value="100" />);

        expect(screen.getByText("Total")).toBeInTheDocument();
        expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("renders with border-right by default", () => {
        const { container } = render(<StatItem title="Test" value="Value" />);
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("border-r");
    });

    it("renders with empty border-right class when borderRight is false", () => {
        const { container } = render(
            <StatItem title="Test" value="Value" borderRight={false} />
        );
        const wrapper = container.firstChild as HTMLElement;
        // When borderRight is false, the conditional border-r is empty string
        // but mb:border-r-0 is still present for mobile responsive
        expect(wrapper.className).toContain("mb:border-r-0");
    });

    it("applies custom className", () => {
        const { container } = render(
            <StatItem title="Test" value="Value" className="custom-class" />
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("custom-class");
    });

    it("renders React node as value", () => {
        render(
            <StatItem
                title="Status"
                value={<span data-testid="custom-value">Active</span>}
            />
        );

        expect(screen.getByTestId("custom-value")).toBeInTheDocument();
    });
});

// ============================================
// RankBadge Component
// ============================================
describe("RankBadge", () => {
    it("renders rank 1 with correct styling", () => {
        const { container } = render(<RankBadge rank={1} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge.textContent).toBe("1");
    });

    it("renders rank 2", () => {
        const { container } = render(<RankBadge rank={2} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge.textContent).toBe("2");
    });

    it("renders rank 3", () => {
        const { container } = render(<RankBadge rank={3} />);
        const badge = container.firstChild as HTMLElement;
        expect(badge.textContent).toBe("3");
    });

    it("renders nothing for rank > 3 without showCount", () => {
        const { container } = render(<RankBadge rank={4} />);
        expect(container.firstChild).toBeNull();
    });

    it("renders rank number for rank > 3 with showCount", () => {
        const { container } = render(<RankBadge rank={5} showCount />);
        expect(container.textContent).toBe("5");
    });

    it("renders nothing for rank < 1 without showCount", () => {
        const { container } = render(<RankBadge rank={0} />);
        expect(container.firstChild).toBeNull();
    });

    it("applies custom className", () => {
        const { container } = render(
            <RankBadge rank={1} className="custom-class" />
        );
        const badge = container.firstChild as HTMLElement;
        expect(badge.className).toContain("custom-class");
    });
});

// ============================================
// StatusAlert Component
// ============================================
describe("StatusAlert", () => {
    it("renders title", () => {
        render(<StatusAlert variant="completed" title="Success!" />);
        expect(screen.getByText("Success!")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
        render(
            <StatusAlert
                variant="pending"
                title="Pending"
                description="Please wait..."
            />
        );
        expect(screen.getByText("Please wait...")).toBeInTheDocument();
    });

    it("does not render description when not provided", () => {
        render(<StatusAlert variant="completed" title="Done" />);
        expect(screen.queryByText("Please wait...")).not.toBeInTheDocument();
    });

    it("shows icon for expired variant by default", () => {
        const { container } = render(
            <StatusAlert variant="expired" title="Expired" />
        );
        const icon = container.querySelector(".rounded-full");
        expect(icon).toBeInTheDocument();
    });

    it("does not show icon for completed variant by default", () => {
        const { container } = render(
            <StatusAlert variant="completed" title="Done" />
        );
        const icon = container.querySelector(".rounded-full");
        expect(icon).not.toBeInTheDocument();
    });

    it("shows icon when showIcon is true", () => {
        const { container } = render(
            <StatusAlert variant="completed" title="Done" showIcon />
        );
        const icon = container.querySelector(".rounded-full");
        expect(icon).toBeInTheDocument();
    });

    it("applies custom className", () => {
        const { container } = render(
            <StatusAlert
                variant="completed"
                title="Test"
                className="custom-class"
            />
        );
        const wrapper = container.firstChild as HTMLElement;
        expect(wrapper.className).toContain("custom-class");
    });
});

// ============================================
// SearchInput Component
// ============================================
describe("SearchInput", () => {
    it("renders with placeholder and search icon", () => {
        const handleChange = jest.fn();
        render(
            <SearchInput
                value=""
                onChange={handleChange}
                placeholder="Search Casks"
            />
        );

        expect(screen.getByPlaceholderText("Search Casks")).toBeInTheDocument();
    });

    it("renders size md by default and handles lg size", () => {
        const { container: mdContainer } = render(
            <SearchInput value="" onChange={jest.fn()} />
        );
        const inputMd = mdContainer.querySelector("input");
        expect(inputMd).toHaveClass("h-full");

        const { container: lgContainer } = render(
            <SearchInput value="" onChange={jest.fn()} size="lg" />
        );
        const inputLg = lgContainer.querySelector("input");
        expect(inputLg).toHaveClass("h-full");
    });

    it("displays close button only when filled and handles click", () => {
        const handleChange = jest.fn();
        const { rerender } = render(
            <SearchInput value="" onChange={handleChange} />
        );

        expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();

        rerender(<SearchInput value="Macallan" onChange={handleChange} />);
        const clearBtn = screen.getByLabelText("Clear search");
        expect(clearBtn).toBeInTheDocument();

        fireEvent.click(clearBtn);
        expect(handleChange).toHaveBeenCalledWith("");
    });

    it("conditionally shows chevron down icon", () => {
        const { container: noChevronContainer } = render(
            <SearchInput value="" onChange={jest.fn()} showChevron={false} />
        );
        // Chevron icon's SVG path / button shouldn't exist in DOM
        expect(
            noChevronContainer.querySelector("svg path[d*='15.0003']")
        ).not.toBeInTheDocument();

        const { container: chevronContainer } = render(
            <SearchInput value="" onChange={jest.fn()} showChevron={true} />
        );
        expect(
            chevronContainer.querySelector("svg path[d*='15.0003']")
        ).toBeInTheDocument();
    });
});

import NotificationDropdownItem from "@/components/shared/notification-dropdown-item";
import EmptyState from "@/modules/notification-inbox/notification-list/empty-state";

// ============================================
// NotificationDropdownItem Component
// ============================================
describe("NotificationDropdownItem", () => {
    const mockNotification = {
        id: "notif-1",
        title: "Offer Received",
        message: "You received an offer of $5,000",
        category: "TRANSACTION",
        isRead: false,
        createdAt: new Date().toISOString(),
    };

    it("renders notification title and message", () => {
        render(<NotificationDropdownItem notification={mockNotification} />);

        expect(screen.getByText("Offer Received")).toBeInTheDocument();
        expect(
            screen.getByText("You received an offer of $5,000")
        ).toBeInTheDocument();
    });

    it("triggers onClick callback on click and on key press", () => {
        const handleClick = jest.fn();
        render(
            <NotificationDropdownItem
                notification={mockNotification}
                onClick={handleClick}
            />
        );

        const item = screen.getByRole("button");
        fireEvent.click(item);
        expect(handleClick).toHaveBeenCalledTimes(1);

        fireEvent.keyDown(item, { key: "Enter" });
        expect(handleClick).toHaveBeenCalledTimes(2);

        fireEvent.keyDown(item, { key: " " });
        expect(handleClick).toHaveBeenCalledTimes(3);
    });

    it("renders unread indicator dot when isRead is false", () => {
        const { container } = render(
            <NotificationDropdownItem notification={mockNotification} />
        );

        expect(container.querySelector(".bg-success")).toBeInTheDocument();
    });

    it("does not render unread indicator dot when isRead is true", () => {
        const { container } = render(
            <NotificationDropdownItem
                notification={{ ...mockNotification, isRead: true }}
            />
        );

        expect(container.querySelector(".bg-success")).not.toBeInTheDocument();
    });

    it("disables hover and role=button when isClickable is false", () => {
        const handleClick = jest.fn();
        const { container } = render(
            <NotificationDropdownItem
                notification={{ ...mockNotification, isRead: true }}
                isClickable={false}
                onClick={handleClick}
            />
        );

        const item = container.firstChild as HTMLElement;
        expect(item).toHaveClass("cursor-default");
        expect(item.className).not.toContain("hover:bg-bg-dark-sf4");
        expect(item.className).not.toContain("cursor-pointer");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();

        fireEvent.click(item);
        expect(handleClick).not.toHaveBeenCalled();
    });
});

// ============================================
// EmptyState Component
// ============================================
describe("EmptyState", () => {
    it("renders default empty state", () => {
        render(<EmptyState />);

        expect(screen.getByText("No notifications")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You're all caught up! Check back later for new updates."
            )
        ).toBeInTheDocument();
    });

    it("renders unread-only specific message when isUnreadOnly is true", () => {
        render(<EmptyState isUnreadOnly={true} />);

        expect(screen.getByText("No unread notifications")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You're all caught up! Switch off 'Unread only' to view previous notifications."
            )
        ).toBeInTheDocument();
    });

    it("renders custom title and description when provided", () => {
        render(
            <EmptyState title="Custom Title" description="Custom Description" />
        );

        expect(screen.getByText("Custom Title")).toBeInTheDocument();
        expect(screen.getByText("Custom Description")).toBeInTheDocument();
    });
});

// ============================================
// NotificationItem Component
// ============================================
import NotificationItem from "@/modules/notification-inbox/notification-item";
import { TNotificationItem } from "@/lib/constants/notification";

describe("NotificationItem", () => {
    const unreadItem: TNotificationItem = {
        id: "item-1",
        title: "New Transaction",
        description: "Payment successful for cask #101",
        category: "buying",
        timestamp: "Just now",
        isRead: false,
        icon: "shopping-cart",
        actionLabel: "View Order",
        actionHref: "/profile/portfolio",
    };

    const readItemNoAction: TNotificationItem = {
        id: "item-2",
        title: "System Maintenance",
        description: "Platform will undergo maintenance",
        category: "system",
        timestamp: "2h ago",
        isRead: true,
        icon: "settings",
    };

    it("renders unread item with cursor-pointer and hover classes", () => {
        const handleMarkAsRead = jest.fn();
        const { container } = render(
            <NotificationItem
                notification={unreadItem}
                onMarkAsRead={handleMarkAsRead}
            />
        );

        const row = container.firstChild as HTMLElement;
        expect(row).toHaveClass("cursor-pointer");
        expect(row.className).toContain("hover:border-bd-main");
        expect(row.className).toContain("hover:bg-bg-sf4");

        // Green unread dot present
        expect(container.querySelector(".bg-success")).toBeInTheDocument();

        // Mark as read icon button present
        const markButton = screen.getByLabelText("Mark as read");
        expect(markButton).toBeInTheDocument();
        expect(markButton).toHaveClass("cursor-pointer");
        expect(markButton.className).toContain("hover:text-typo-primary");

        // Clicking mark read button calls onMarkAsRead
        fireEvent.click(markButton);
        expect(handleMarkAsRead).toHaveBeenCalledWith("item-1");
    });

    it("disables mark as read button and prevents hover when isMarkingRead is true", () => {
        const handleMarkAsRead = jest.fn();
        render(
            <NotificationItem
                notification={unreadItem}
                onMarkAsRead={handleMarkAsRead}
                isMarkingRead={true}
            />
        );

        const markButton = screen.getByLabelText("Mark as read");
        expect(markButton).toBeDisabled();
        expect(markButton).toHaveClass("cursor-not-allowed");
        expect(markButton).toHaveClass("pointer-events-none");
        expect(markButton.className).not.toContain("hover:text-typo-primary");
    });

    it("renders read item with actionHref as clickable with hover styles", () => {
        const readItemWithAction: TNotificationItem = {
            ...unreadItem,
            isRead: true,
        };

        const { container } = render(
            <NotificationItem notification={readItemWithAction} />
        );

        const row = container.firstChild as HTMLElement;
        expect(row).toHaveClass("cursor-pointer");
        expect(row.className).toContain("hover:border-bd-main");
        expect(row.className).toContain("hover:bg-bg-sf4");

        // Clicking row navigates to actionHref
        mockPush.mockClear();
        fireEvent.click(row);
        expect(mockPush).toHaveBeenCalledWith("/profile/portfolio");
    });

    it("renders read item without actionHref with cursor-default and NO hover styles", () => {
        const { container } = render(
            <NotificationItem notification={readItemNoAction} />
        );

        const row = container.firstChild as HTMLElement;
        expect(row).toHaveClass("cursor-default");
        expect(row.className).not.toContain("cursor-pointer");
        expect(row.className).not.toContain("hover:border-bd-main");
        expect(row.className).not.toContain("hover:bg-bg-sf4");

        // Mark as read button should not exist
        expect(screen.queryByLabelText("Mark as read")).not.toBeInTheDocument();

        // Clicking does nothing
        mockPush.mockClear();
        fireEvent.click(row);
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("renders action link when actionHref exists, and marks as read when action link is clicked", () => {
        const handleMarkAsRead = jest.fn();
        render(
            <NotificationItem
                notification={unreadItem}
                onMarkAsRead={handleMarkAsRead}
            />
        );

        const actionLink = screen.getByRole("link", { name: "View Order" });
        expect(actionLink).toBeInTheDocument();
        expect(actionLink).toHaveAttribute("href", "/profile/portfolio");

        fireEvent.click(actionLink);
        expect(handleMarkAsRead).toHaveBeenCalledWith("item-1");
    });

    it("hides the action completely when actionHref is missing even if actionLabel is provided", () => {
        const itemWithLabelNoHref: TNotificationItem = {
            ...readItemNoAction,
            actionLabel: "Review Account",
            actionHref: undefined,
        };

        render(<NotificationItem notification={itemWithLabelNoHref} />);

        expect(screen.queryByText("Review Account")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: "Review Account" })
        ).not.toBeInTheDocument();
    });

    it("renders action link always visible when actionHref exists", () => {
        render(<NotificationItem notification={unreadItem} />);

        const actionLink = screen.getByRole("link", { name: "View Order" });
        expect(actionLink).toBeInTheDocument();
        expect(actionLink).toHaveAttribute("href", "/profile/portfolio");
        expect(actionLink.closest(".opacity-0")).toBeNull();
    });
});

// ============================================
// NotificationHeader Component
// ============================================
import NotificationHeader from "@/modules/notification-inbox/notification-header";

describe("NotificationHeader", () => {
    it("disables Mark all read button and removes hover class when unreadCount is 0", () => {
        const handleMarkAll = jest.fn();
        render(
            <NotificationHeader
                activeTab="all"
                unreadCount={0}
                showUnreadOnly={false}
                onToggleUnreadOnly={jest.fn()}
                onMarkAllRead={handleMarkAll}
            />
        );

        const button = screen.getByRole("button", { name: /mark all read/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass("cursor-not-allowed");
        expect(button).toHaveClass("opacity-40");
        expect(button.className).not.toContain("hover:text-typo-soft");
        expect(button.className).not.toContain("cursor-pointer");
    });

    it("disables Mark all read button and removes hover class when isMarkingAllRead is true", () => {
        render(
            <NotificationHeader
                activeTab="all"
                unreadCount={5}
                showUnreadOnly={false}
                isMarkingAllRead={true}
                onToggleUnreadOnly={jest.fn()}
                onMarkAllRead={jest.fn()}
            />
        );

        const button = screen.getByRole("button", { name: /marking/i });
        expect(button).toBeDisabled();
        expect(button).toHaveClass("cursor-not-allowed");
        expect(button.className).not.toContain("hover:text-typo-soft");
    });

    it("enables Mark all read button with hover class when unreadCount > 0 and not marking", () => {
        const handleMarkAll = jest.fn();
        render(
            <NotificationHeader
                activeTab="all"
                unreadCount={3}
                showUnreadOnly={false}
                isMarkingAllRead={false}
                onToggleUnreadOnly={jest.fn()}
                onMarkAllRead={handleMarkAll}
            />
        );

        const button = screen.getByRole("button", { name: /mark all read/i });
        expect(button).not.toBeDisabled();
        expect(button).toHaveClass("cursor-pointer");
        expect(button.className).toContain("hover:text-typo-soft");

        fireEvent.click(button);
        expect(handleMarkAll).toHaveBeenCalledTimes(1);
    });

    it("renders title without badge count pill", () => {
        render(
            <NotificationHeader
                activeTab="all"
                unreadCount={5}
                showUnreadOnly={false}
                onToggleUnreadOnly={jest.fn()}
                onMarkAllRead={jest.fn()}
            />
        );

        expect(screen.getByText("All Notifications")).toBeInTheDocument();
        expect(
            screen.queryByTestId("inbox-badge-count")
        ).not.toBeInTheDocument();
    });
});

// ============================================
// HeaderActionIcon Component
// ============================================
import { HeaderActionIcon } from "@/layouts/Header/header-action-icon";

describe("HeaderActionIcon", () => {
    it("renders notification dot without numbers when hasNotification is true", () => {
        render(
            <HeaderActionIcon icon={<span>Bell</span>} hasNotification={true} />
        );

        const dot = screen.getByTestId("header-notification-dot");
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveTextContent("");
        expect(
            screen.queryByTestId("header-unread-badge-count")
        ).not.toBeInTheDocument();
    });

    it("renders notification dot when badgeCount > 0 without numbers", () => {
        render(<HeaderActionIcon icon={<span>Bell</span>} badgeCount={5} />);

        const dot = screen.getByTestId("header-notification-dot");
        expect(dot).toBeInTheDocument();
        expect(dot).toHaveTextContent("");
        expect(
            screen.queryByTestId("header-unread-badge-count")
        ).not.toBeInTheDocument();
    });

    it("does not render notification dot when hasNotification is false and badgeCount is 0", () => {
        render(
            <HeaderActionIcon
                icon={<span>Bell</span>}
                hasNotification={false}
                badgeCount={0}
            />
        );

        expect(
            screen.queryByTestId("header-notification-dot")
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId("header-unread-badge-count")
        ).not.toBeInTheDocument();
    });
});
