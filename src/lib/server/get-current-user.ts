import "server-only";

import { authServerAction } from "@/services/server-action/auth";
import { cache } from "react";

export const getCurrentUser = cache(() => authServerAction.whoami(true));
