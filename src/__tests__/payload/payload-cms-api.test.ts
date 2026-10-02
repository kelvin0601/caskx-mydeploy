jest.mock("server-only", () => ({}), { virtual: true });

class TestResponse {
    readonly status: number;

    constructor(_body: string, init?: { status?: number }) {
        this.status = init?.status ?? 200;
    }
}

global.Response = TestResponse as unknown as typeof Response;

import { PayloadCmsApi } from "@/payload/services/PayloadCmsApi";

describe("PayloadCmsApi", () => {
    it("returns 404 for every handler when CMS is disabled", async () => {
        const api = new PayloadCmsApi(false);
        const handler = jest.fn(async () => new Response("ok"));

        const response = await api.withCmsEnabled(handler)();

        expect(response.status).toBe(404);
        expect(handler).not.toHaveBeenCalled();
    });

    it("delegates to Payload when CMS is enabled", async () => {
        const api = new PayloadCmsApi(true);
        const handler = jest.fn(
            async () => new Response("ok", { status: 201 })
        );

        const response = await api.withCmsEnabled(handler)();

        expect(response.status).toBe(201);
        expect(handler).toHaveBeenCalledTimes(1);
    });
});
