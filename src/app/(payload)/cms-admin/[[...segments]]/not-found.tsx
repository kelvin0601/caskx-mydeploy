import type { Metadata } from "next";
import config from "@payload-config";
import { generatePageMetadata, NotFoundPage } from "@payloadcms/next/views";
import { importMap } from "../importMap";

type Args = {
    params: Promise<{
        segments: string[];
    }>;
    searchParams: Promise<{
        [key: string]: string | string[];
    }>;
};

export const generateMetadata = ({ params }: Args): Promise<Metadata> =>
    generatePageMetadata({ config, params, searchParams: Promise.resolve({}) });

const NotFound = ({ params, searchParams }: Args) =>
    NotFoundPage({ config, params, searchParams, importMap });

export default NotFound;
