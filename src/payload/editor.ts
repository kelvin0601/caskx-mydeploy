import {
    FixedToolbarFeature,
    lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { FieldHook } from "payload";
import { HTMLImportFeature } from "./features/html-import/feature.server.ts";
import { convertHtmlToLexical, isHtmlString } from "./rich-text.ts";

export const convertHtmlRichText: FieldHook = async ({ value, req }) => {
    if (!isHtmlString(value)) return value;

    return convertHtmlToLexical(value, req);
};

export const createResourceRichTextEditor = (placeholder: string) =>
    lexicalEditor({
        admin: {
            placeholder,
        },
        features: ({ defaultFeatures }) => [
            ...defaultFeatures,
            FixedToolbarFeature(),
            HTMLImportFeature(),
        ],
    });
