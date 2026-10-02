declare namespace security {
    type TSecuritySession = {
        currentSession: TSession;
        otherSessions: TSession[];
    };

    type TSession = {
        id: string;
        deviceInfo: string;
        ipAddress: string;
        location: string;
        isCurrentSession: boolean;
        createdAt: string;
        lastActivityAt: string;
    };
}
export { security };
