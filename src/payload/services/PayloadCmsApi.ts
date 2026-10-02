import "server-only";

export type PayloadRouteHandler<TArgs extends unknown[] = [Request, unknown]> =
    (...args: TArgs) => Response | Promise<Response>;

/**
 * Small adapter around Payload's REST handlers. The route file only wires
 * Payload handlers into Next.js; this class owns the CMS feature-flag guard so
 * every HTTP method follows the same rule.
 */
export class PayloadCmsApi {
    constructor(private readonly enabled: boolean) {}

    withCmsEnabled<TArgs extends unknown[]>(
        handler: PayloadRouteHandler<TArgs>
    ): PayloadRouteHandler<TArgs> {
        return async (...args) => {
            if (!this.enabled)
                return new Response("Not Found", { status: 404 });

            return handler(...args);
        };
    }
}
