"use client";

import {
    createClientFeature,
    toolbarFeatureButtonsGroupWithItems,
} from "@payloadcms/richtext-lexical/client";
import {
    $getRoot,
    $getSelection,
    COMMAND_PRIORITY_EDITOR,
    createCommand,
} from "@payloadcms/richtext-lexical/lexical";
import { $generateNodesFromDOM } from "@payloadcms/richtext-lexical/lexical/html";
import { useLexicalComposerContext } from "@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext";
import {
    ConfirmationModal,
    TextareaInput,
    toast,
    useModal,
} from "@payloadcms/ui";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import styles from "./html-import.module.css";

const OPEN_HTML_IMPORT_COMMAND = createCommand<void>(
    "OPEN_HTML_IMPORT_COMMAND"
);

function HTMLImportIcon() {
    return (
        <span title="Import HTML">
            <svg
                aria-hidden="true"
                fill="none"
                height="20"
                viewBox="0 0 20 20"
                width="20"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M7 5 3 10l4 5M13 5l4 5-4 5M11.5 3 8.5 17"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                />
            </svg>
            <span className="sr-only">Import HTML</span>
        </span>
    );
}

function HTMLImportPlugin() {
    const [editor] = useLexicalComposerContext();
    const { openModal } = useModal();
    const instanceID = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const modalSlug = `lexical-html-import-${instanceID}`;
    const [html, setHTML] = useState("");
    const [replaceContent, setReplaceContent] = useState(true);

    useEffect(
        () =>
            editor.registerCommand(
                OPEN_HTML_IMPORT_COMMAND,
                () => {
                    setHTML("");
                    setReplaceContent(true);
                    openModal(modalSlug);
                    return true;
                },
                COMMAND_PRIORITY_EDITOR
            ),
        [editor, modalSlug, openModal]
    );

    const handleImport = useCallback(() => {
        const source = html.trim();

        if (!source) {
            toast.error("Paste HTML before importing.");
            return;
        }

        const dom = new DOMParser().parseFromString(source, "text/html");
        let importedNodeCount = 0;

        editor.update(
            () => {
                const nodes = $generateNodesFromDOM(editor, dom);
                importedNodeCount = nodes.length;

                if (!nodes.length) return;

                if (replaceContent) {
                    const root = $getRoot();
                    root.clear();
                    root.select();
                }

                let selection = $getSelection();

                if (!selection) {
                    $getRoot().selectEnd();
                    selection = $getSelection();
                }

                selection?.insertNodes(nodes);
            },
            {
                discrete: true,
                tag: "html-import",
            }
        );

        if (!importedNodeCount) {
            toast.error("The HTML did not contain importable content.");
            return;
        }

        setHTML("");
        toast.success("HTML imported into the rich text editor.");
    }, [editor, html, replaceContent]);

    const modalBody = useMemo(
        () => (
            <div className={styles.body}>
                <p className={styles.description}>
                    Paste HTML to convert headings, paragraphs, lists, links,
                    formatting, and supported images into Lexical content.
                </p>
                <TextareaInput
                    label="HTML"
                    onChange={(event) => setHTML(event.target.value)}
                    path={`${modalSlug}-source`}
                    placeholder="<h2>Heading</h2><p>Content...</p>"
                    rows={14}
                    value={html}
                />
                <label className={styles.mode}>
                    <input
                        checked={replaceContent}
                        onChange={(event) =>
                            setReplaceContent(event.target.checked)
                        }
                        type="checkbox"
                    />
                    <span>Replace the current editor content</span>
                </label>
                <p className={styles.hint}>
                    Images are imported through Payload Media and use the
                    configured S3 storage.
                </p>
            </div>
        ),
        [html, modalSlug, replaceContent]
    );

    return (
        <ConfirmationModal
            body={modalBody}
            cancelLabel="Cancel"
            confirmLabel="Import HTML"
            heading="Import HTML"
            modalSlug={modalSlug}
            onCancel={() => setHTML("")}
            onConfirm={handleImport}
        />
    );
}

const toolbarGroups = [
    toolbarFeatureButtonsGroupWithItems([
        {
            ChildComponent: HTMLImportIcon,
            key: "htmlImport",
            label: "Import HTML",
            onSelect: ({ editor }) => {
                editor.dispatchCommand(OPEN_HTML_IMPORT_COMMAND, undefined);
            },
            order: 100,
        },
    ]),
];

export const HTMLImportFeatureClient = createClientFeature({
    plugins: [
        {
            Component: HTMLImportPlugin,
            position: "normal",
        },
    ],
    toolbarFixed: {
        groups: toolbarGroups,
    },
});
