import {
    REST_DELETE,
    REST_GET,
    REST_OPTIONS,
    REST_PATCH,
    REST_POST,
    REST_PUT,
} from "@payloadcms/next/routes";
import config from "@payload-config";
import { env } from "@/config/env";
import { PayloadCmsApi } from "@/payload/services/PayloadCmsApi";

const payloadCmsApi = new PayloadCmsApi(env.payloadCmsEnabled);

export const GET = payloadCmsApi.withCmsEnabled(REST_GET(config));
export const POST = payloadCmsApi.withCmsEnabled(REST_POST(config));
export const PUT = payloadCmsApi.withCmsEnabled(REST_PUT(config));
export const PATCH = payloadCmsApi.withCmsEnabled(REST_PATCH(config));
export const DELETE = payloadCmsApi.withCmsEnabled(REST_DELETE(config));
export const OPTIONS = payloadCmsApi.withCmsEnabled(REST_OPTIONS(config));
