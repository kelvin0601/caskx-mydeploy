import { OptionNextAuth } from "@/config/auth";
import { CombineRequest, CombineResponse } from "@/types/global/next-auth";
import NextAuth from "next-auth";

const handler = (req: CombineRequest, res: CombineResponse) => {
    return NextAuth(req, res, OptionNextAuth(req));
};

export { handler as GET, handler as POST };
