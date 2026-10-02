import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import config from "@payload-config";
import "@payloadcms/next/css";
import { importMap } from "./cms-admin/importMap";

async function payloadServerFunction(args: {
    args: Record<string, unknown>;
    name: string;
}) {
    "use server";

    return handleServerFunctions({ ...args, config, importMap });
}

export default function PayloadLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return RootLayout({
        children,
        config,
        importMap,
        serverFunction: payloadServerFunction,
    });
}
