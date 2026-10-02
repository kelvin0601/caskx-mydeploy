import "server-only";

import { OptionNextAuth } from "@/config/auth";
import { checkoutServerAction } from "@/services/server-action/checkout";
import { getServerSession } from "next-auth";
import { cache } from "react";

export const getCheckoutStatus = cache(async (sessionId: string) => {
    const session = await getServerSession(OptionNextAuth());

    return checkoutServerAction.getStatusSessionServer({
        sessionId,
        token: session?.user?.accessToken || "",
    });
});
