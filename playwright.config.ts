import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local and .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * Playwright configuration for Next.js App Router.
 * See https://playwright.dev/docs/test-configuration.
 */
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
    testDir: "./e2e",
    /* Timeout for each expect() assertion */
    expect: {
        timeout: 10000,
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [["list"], ["html", { open: "never" }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: BASE_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "retain-on-failure",
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "setup",
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["setup"],
        },
        {
            name: "webkit",
            use: {
                ...devices["Desktop Safari"],
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["setup"],
        },
        /* Test against mobile viewports. */
        {
            name: "mobile-chrome",
            use: {
                ...devices["Pixel 5"],
                storageState: "playwright/.auth/user.json",
            },
            dependencies: ["setup"],
        },
    ],

    /* Run local dev server before starting the tests */
    webServer: {
        command: "npm run dev",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
        env: {
            TMPDIR: "/tmp",
        },
    },
});
