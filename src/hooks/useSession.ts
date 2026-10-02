import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useSessionWithCache() {
    const { data: session, status } = useSession();
    const [cachedSession, setCachedSession] = useState(session);

    useEffect(() => {
        if (session) {
            setCachedSession(session);
        }
    }, [session]);

    return {
        session: cachedSession,
        status,
    };
}
