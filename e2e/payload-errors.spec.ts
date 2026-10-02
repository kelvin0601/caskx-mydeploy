import { expect, test } from "@playwright/test";

test.describe("Payload failure boundaries", () => {
    test("returns 404 when the Payload API URL is invalid", async ({
        request,
    }) => {
        const response = await request.get(
            "/api-cms/__e2e__/missing-payload-resource"
        );

        expect(response.status()).toBe(404);
    });
});
