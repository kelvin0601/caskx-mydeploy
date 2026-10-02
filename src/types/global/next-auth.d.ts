import { auth } from "../auth";

declare module "next-auth/jwt" {
    export interface JWT {
        id?: string;
        role?: auth.TRole;
        name?: string;
        accessToken?: string;
        refreshToken?: string;
        tempToken?: string;
        availableMethods?: string[];
        autoInitiatedMethod?: string;
    }
}
export type CombineRequest = Request & NextApiRequest;
export type CombineResponse = Response & NextApiResponse;
declare module "next-auth" {
    interface Session {
        user: {
            role: auth.TRole;
            id?: string;
            name?: string;
            image?: string;
            accessToken?: string;
            refreshToken?: string;
            email?: string;
            tempToken?: string;
            availableMethods?: string[];
            autoInitiatedMethod?: string;
            phoneNumber?: string;
        };
    }

    interface User {
        id: string;
        role: auth.TRole;
        name?: string;
        accessToken?: string;
        refreshToken?: string;
        tempToken?: string;
        availableMethods?: string[];
        autoInitiatedMethod?: string;
        phoneNumber?: string;
    }
}
