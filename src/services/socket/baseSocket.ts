import { env } from "@/config/env";
import { io, Socket } from "socket.io-client";

export class BaseSocketService {
    protected socket: Socket | null = null;
    protected namespace: string;
    protected token: string;

    constructor(namespace: string) {
        this.namespace = namespace;
        this.token = "";
    }

    connect() {
        if (!this.token) return;

        this.socket = io(`${env.wsUrl}/${this.namespace}`, {
            auth: {
                token: this.token,
            },
            transports: ["websocket"],
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}
