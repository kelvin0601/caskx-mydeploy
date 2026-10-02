import { revalidatePath } from "next/cache.js";
import type {
    CollectionAfterChangeHook,
    CollectionAfterDeleteHook,
    GlobalAfterChangeHook,
} from "payload";
import { ROUTE_PUBLIC } from "../../../lib/constants/route.ts";

const DISABLE_REVALIDATION_CONTEXT_KEY = "disableResourceRevalidation";

function isPublished(value: unknown) {
    return (
        typeof value === "object" &&
        value !== null &&
        "_status" in value &&
        value._status === "published"
    );
}

function shouldSkip(context: Record<string, unknown>) {
    return context[DISABLE_REVALIDATION_CONTEXT_KEY] === true;
}

function revalidateResources(logger: { info: (message: string) => void }) {
    logger.info("Revalidating public Resources routes");
    revalidatePath(ROUTE_PUBLIC.RESOURCES, "layout");
}

export const revalidateResourceAfterChange: CollectionAfterChangeHook = ({
    context,
    doc,
    previousDoc,
    req,
}) => {
    if (
        !shouldSkip(context) &&
        (isPublished(doc) || isPublished(previousDoc))
    ) {
        revalidateResources(req.payload.logger);
    }

    return doc;
};

export const revalidateResourceAfterDelete: CollectionAfterDeleteHook = ({
    context,
    doc,
    req,
}) => {
    if (!shouldSkip(context) && isPublished(doc)) {
        revalidateResources(req.payload.logger);
    }

    return doc;
};

export const revalidateResourceSettings: GlobalAfterChangeHook = ({
    context,
    doc,
    previousDoc,
    req,
}) => {
    if (
        !shouldSkip(context) &&
        (isPublished(doc) || isPublished(previousDoc))
    ) {
        revalidateResources(req.payload.logger);
    }

    return doc;
};
