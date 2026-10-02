import { renderHook, act } from "@testing-library/react";
import browserNotificationService, {
    BROWSER_NOTIFICATION_STORAGE_KEY,
} from "@/services/browser-notification";
import { useBrowserNotification } from "@/hooks/useBrowserNotification";

describe("BrowserNotificationService", () => {
    let originalNotification: typeof Notification;

    beforeEach(() => {
        localStorage.clear();
        originalNotification = window.Notification;
    });

    afterEach(() => {
        window.Notification = originalNotification;
        jest.restoreAllMocks();
    });

    it("detects when Notification API is supported", () => {
        (window as any).Notification = jest.fn();
        expect(browserNotificationService.isSupported()).toBe(true);
    });

    it("returns unsupported when Notification API is missing", () => {
        delete (window as any).Notification;
        expect(browserNotificationService.isSupported()).toBe(false);
        expect(browserNotificationService.getPermission()).toBe("unsupported");
    });

    it("reads current permission from window.Notification", () => {
        (window as any).Notification = {
            permission: "default",
            requestPermission: jest.fn().mockResolvedValue("granted"),
        };
        expect(browserNotificationService.getPermission()).toBe("default");
    });

    it("evaluates isEnabled based on permission and localStorage", () => {
        (window as any).Notification = { permission: "granted" };

        expect(browserNotificationService.isEnabled()).toBe(true);

        browserNotificationService.setEnabled(false);
        expect(browserNotificationService.isEnabled()).toBe(false);

        browserNotificationService.setEnabled(true);
        expect(browserNotificationService.isEnabled()).toBe(true);

        (window as any).Notification = { permission: "denied" };
        expect(browserNotificationService.isEnabled()).toBe(false);
    });

    it("requests permission and stores enabled flag on grant", async () => {
        const mockRequest = jest.fn().mockResolvedValue("granted");
        (window as any).Notification = {
            permission: "default",
            requestPermission: mockRequest,
        };

        const result = await browserNotificationService.requestPermission();
        expect(mockRequest).toHaveBeenCalled();
        expect(result).toBe("granted");
        expect(localStorage.getItem(BROWSER_NOTIFICATION_STORAGE_KEY)).toBe(
            "true"
        );
    });

    it("sends notification via new Notification constructor when enabled", async () => {
        const mockNotificationConstructor = jest.fn();
        (window as any).Notification = mockNotificationConstructor;
        (window as any).Notification.permission = "granted";

        const success = await browserNotificationService.sendNotification(
            "Test Title",
            {
                body: "Test Body",
                url: "/profile/orders",
            }
        );

        expect(success).toBe(true);
        expect(mockNotificationConstructor).toHaveBeenCalledWith(
            "Test Title",
            expect.objectContaining({
                body: "Test Body",
                data: expect.objectContaining({ url: "/profile/orders" }),
            })
        );
    });

    it("does not send notification when permission is not granted", async () => {
        const mockNotificationConstructor = jest.fn();
        (window as any).Notification = mockNotificationConstructor;
        (window as any).Notification.permission = "denied";

        const success =
            await browserNotificationService.sendNotification("Denied Title");
        expect(success).toBe(false);
        expect(mockNotificationConstructor).not.toHaveBeenCalled();
    });
});

describe("useBrowserNotification hook", () => {
    beforeEach(() => {
        localStorage.clear();
        (window as any).Notification = {
            permission: "granted",
            requestPermission: jest.fn().mockResolvedValue("granted"),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("initializes with current browser permission and isEnabled state", () => {
        const { result } = renderHook(() => useBrowserNotification());

        expect(result.current.isSupported).toBe(true);
        expect(result.current.permission).toBe("granted");
        expect(result.current.isEnabled).toBe(true);
    });

    it("toggles enabled state correctly", async () => {
        const { result } = renderHook(() => useBrowserNotification());

        await act(async () => {
            await result.current.toggleEnabled(false);
        });
        expect(result.current.isEnabled).toBe(false);

        await act(async () => {
            await result.current.toggleEnabled(true);
        });
        expect(result.current.isEnabled).toBe(true);
    });

    it("requests permission when toggleEnabled(true) is called and permission is default", async () => {
        (window as any).Notification = {
            permission: "default",
            requestPermission: jest.fn().mockResolvedValue("granted"),
        };

        const { result } = renderHook(() => useBrowserNotification());

        await act(async () => {
            const enabled = await result.current.toggleEnabled(true);
            expect(enabled).toBe(true);
        });

        expect(result.current.isEnabled).toBe(true);
    });
});
