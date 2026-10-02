import {
    convertHTMLToLexical,
    editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import type { PayloadRequest } from "payload";

export async function convertHtmlToLexical(html: string, req: PayloadRequest) {
    const dom = new JSDOM(html);
    const images = Array.from(dom.window.document.querySelectorAll("img"));
    const unlinkedImage = images.find(
        (image) =>
            !image.hasAttribute("data-lexical-upload-id") ||
            !image.hasAttribute("data-lexical-upload-relation-to")
    );

    if (unlinkedImage) {
        throw new Error(
            "HTML images must reference an uploaded Payload Media document using data-lexical-upload-id and data-lexical-upload-relation-to."
        );
    }

    const editorConfig = await editorConfigFactory.default({
        config: req.payload.config,
    });

    return convertHTMLToLexical({
        editorConfig,
        html,
        JSDOM,
    });
}

export function isHtmlString(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}
