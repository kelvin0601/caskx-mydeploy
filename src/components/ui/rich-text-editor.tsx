"use client";

import {
    ComponentType,
    FunctionComponent,
    useEffect,
    useRef,
    useState,
} from "react";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Editor, Node } from "@tiptap/core";
import {
    EditorContent,
    useEditor,
    ReactNodeViewRenderer,
    NodeViewWrapper,
    ReactNodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    Bold,
    Italic,
    Strikethrough,
    List,
    ListOrdered,
    Underline as UnderlineIcon,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type RichTextEditorProps = {
    value?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean;
    onImageUpload?: (files: File[]) => Promise<string[] | void>;
    maxHeight?: string;
    imageMaxWidth?: number;
    imageMaxHeight?: number;
    imageQuality?: number;
};

const EMPTY_PARAGRAPH = "<p></p>";

const normalizeHtml = (html: string) => (html === EMPTY_PARAGRAPH ? "" : html);

// Figure and Figcaption extensions
const Figure = Node.create({
    name: "figure",
    group: "block",
    content: "image figcaption{0,1}",
    parseHTML() {
        return [{ tag: "figure" }];
    },
    renderHTML({ HTMLAttributes }) {
        return ["figure", HTMLAttributes, 0];
    },
});

const Figcaption = Node.create({
    name: "figcaption",
    group: "block",
    content: "text*",
    parseHTML() {
        return [{ tag: "figcaption" }];
    },
    renderHTML({ node, HTMLAttributes }) {
        const attrs = {
            ...(HTMLAttributes || {}),
            class: [HTMLAttributes?.class, "rich-text-editor__figcaption"]
                .filter(Boolean)
                .join(" ")
                .trim(),
            "data-placeholder": "Add caption...",
        };

        return ["figcaption", attrs, 0];
    },
});

// Custom Image extension with delete button
const ImageWithDelete = Image.extend({
    addNodeView() {
        return ReactNodeViewRenderer<ReactNodeViewProps<HTMLElement>>(
            ImageComponent as unknown as ComponentType<
                ReactNodeViewProps<ReactNodeViewProps<HTMLElement>>
            >
        );
    },
    addAttributes() {
        return {
            ...this.parent?.(),
            draggable: {
                default: false,
            },
        };
    },
});

// React component for image with delete button
function ImageComponent({
    node,
    editor,
    getPos,
}: {
    node: Node;
    editor: Editor;
    getPos: () => number;
}) {
    const getFigureInfo = () => {
        if (typeof getPos !== "function") return null;
        const pos = getPos();
        if (pos === undefined || pos === null) return null;

        const doc = editor.state.doc;
        const resolvedPos = doc.resolve(pos);

        for (let depth = resolvedPos.depth; depth > 0; depth--) {
            const nodeAtDepth = resolvedPos.node(depth);
            if (nodeAtDepth.type.name === "figure") {
                const figurePos = resolvedPos.before(depth);
                const figureNode = doc.nodeAt(figurePos);
                if (figureNode) {
                    return { figureNode, figurePos };
                }
                break;
            }
        }

        return null;
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const figureInfo = getFigureInfo();
        if (!figureInfo) return;

        editor.commands.deleteRange({
            from: figureInfo.figurePos,
            to: figureInfo.figurePos + figureInfo.figureNode.nodeSize,
        });
    };

    const handleDragStart = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    return (
        <NodeViewWrapper
            className="group relative block w-full"
            draggable={false}
            onDragStart={handleDragStart}
        >
            <div className="relative">
                <img
                    src={
                        (node as unknown as { attrs: { src: string } }).attrs
                            .src
                    }
                    alt={
                        (node as unknown as { attrs: { alt: string } }).attrs
                            .alt || ""
                    }
                    className="h-auto max-w-full rounded"
                    draggable={false}
                    onDragStart={handleDragStart}
                />
                <button
                    type="button"
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600 text-white absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                    aria-label="Delete image"
                >
                    <X size={14} strokeWidth={2.5} />
                </button>
            </div>
        </NodeViewWrapper>
    );
}

export function RichTextEditor({
    value = "",
    onChange,
    onBlur,
    placeholder,
    disabled = false,
    className,
    error,
    onImageUpload,
    maxHeight = "24rem",
    imageMaxWidth = 1920,
    imageMaxHeight = 1080,
    imageQuality = 0.8,
}: RichTextEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectionUpdate, setSelectionUpdate] = useState(0);
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [htmlValue, setHtmlValue] = useState("");
    const editor = useEditor({
        content: value || EMPTY_PARAGRAPH,
        immediatelyRender: false,
        editable: !disabled,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5],
                },
            }),
            Underline,
            ImageWithDelete.configure({
                inline: false,
                allowBase64: true,
            }),
            Figure,
            Figcaption,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-primary underline",
                },
            }),
            Placeholder.configure({
                includeChildren: true,
                placeholder: ({ node }) => {
                    if (node.type.name === "figcaption") {
                        return "Add caption...";
                    }
                    return placeholder ?? "Start typing to add more details...";
                },
            }),
        ],
        editorProps: {
            attributes: {
                class: "focus:outline-none",
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(normalizeHtml(html));
        },
    });

    useEffect(() => {
        if (!editor) {
            return;
        }

        const handleBlur = () => {
            onBlur?.();
        };

        const handleSelectionUpdate = () => {
            // Force re-render to update toolbar button states
            setSelectionUpdate((prev) => prev + 1);
        };

        editor.on("blur", handleBlur);
        editor.on("selectionUpdate", handleSelectionUpdate);
        editor.on("update", handleSelectionUpdate);

        return () => {
            editor.off("blur", handleBlur);
            editor.off("selectionUpdate", handleSelectionUpdate);
            editor.off("update", handleSelectionUpdate);
        };
    }, [editor, onBlur]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        const normalizedValue = normalizeHtml(value || "");
        const normalizedEditorValue = normalizeHtml(editor.getHTML());

        if (normalizedValue !== normalizedEditorValue) {
            editor.commands.setContent(normalizedValue || EMPTY_PARAGRAPH, {
                emitUpdate: false,
            });
        }
    }, [editor, value]);

    useEffect(() => {
        if (!editor) {
            return;
        }

        editor.setEditable(!disabled && !isHtmlMode);
    }, [editor, disabled, isHtmlMode]);

    if (!editor) {
        return (
            <div
                className={cn(
                    "rich-text-editor min-h-40 animate-pulse bg-bg-sf1",
                    className
                )}
            />
        );
    }

    // Optimize and resize image
    const optimizeImage = (
        file: File,
        maxWidth: number,
        maxHeight: number,
        quality: number
    ): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject(new Error("Canvas context not available"));
                return;
            }

            img.onload = () => {
                // Calculate new dimensions
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height
                    );
                    width = width * ratio;
                    height = height * ratio;
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("Failed to compress image"));
                            return;
                        }
                        const optimizedFile = new File([blob], file.name, {
                            type: "image/jpeg",
                        });
                        // Clean up object URL
                        URL.revokeObjectURL(img.src);
                        resolve(optimizedFile);
                    },
                    "image/jpeg",
                    quality
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(img.src);
                reject(new Error("Failed to load image"));
            };

            const objectUrl = URL.createObjectURL(file);
            img.src = objectUrl;
        });
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert file to base64"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleImageUpload = async (files: FileList | null) => {
        if (!files || files.length === 0 || !editor) return;

        const fileArray = Array.from(files);
        const imageFiles = fileArray.filter((file) =>
            file.type?.startsWith("image/")
        );

        if (imageFiles.length === 0) return;

        try {
            let imageUrls: string[] = [];

            if (onImageUpload) {
                // Optimize images before upload
                const optimizedFiles = await Promise.all(
                    imageFiles.map((file) =>
                        optimizeImage(
                            file,
                            imageMaxWidth,
                            imageMaxHeight,
                            imageQuality
                        )
                    )
                );
                // Use custom upload handler if provided
                const uploadedUrls = await onImageUpload(optimizedFiles);
                if (uploadedUrls && uploadedUrls.length > 0) {
                    imageUrls = uploadedUrls;
                } else {
                    // Fallback to base64 if upload handler doesn't return URLs
                    imageUrls = await Promise.all(
                        optimizedFiles.map((file) => convertFileToBase64(file))
                    );
                }
            } else {
                // Default: optimize and convert to base64
                const optimizedFiles = await Promise.all(
                    imageFiles.map((file) =>
                        optimizeImage(
                            file,
                            imageMaxWidth,
                            imageMaxHeight,
                            imageQuality
                        )
                    )
                );
                imageUrls = await Promise.all(
                    optimizedFiles.map((file) => convertFileToBase64(file))
                );
            }

            // Insert images into editor wrapped in figure with editable figcaption
            imageUrls.forEach((url) => {
                const { schema } = editor;
                const figureType = schema.nodes.figure;
                const imageType = schema.nodes.image;
                const figcaptionType = schema.nodes.figcaption;

                if (!figureType || !imageType || !figcaptionType) {
                    console.error("Figure schema nodes are missing");
                    return;
                }

                try {
                    const figureNode = figureType.create({}, [
                        imageType.create({ src: url, alt: "" }),
                        figcaptionType.create(),
                    ]);

                    editor.chain().focus().insertContent(figureNode).run();
                } catch (error) {
                    console.error("Failed to insert image figure:", error);
                }
            });
        } catch (error) {
            console.error("Error uploading images:", error);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const toolbarGroups = [
        [
            {
                icon: List,
                label: "Bullet list",
                action: () => editor.chain().focus().toggleBulletList().run(),
                isActive: editor.isActive("bulletList"),
                disabled: !editor
                    .can()
                    .chain()
                    .focus()
                    .toggleBulletList()
                    .run(),
            },
            {
                icon: ListOrdered,
                label: "Numbered list",
                action: () => editor.chain().focus().toggleOrderedList().run(),
                isActive: editor.isActive("orderedList"),
                disabled: !editor
                    .can()
                    .chain()
                    .focus()
                    .toggleOrderedList()
                    .run(),
            },
        ],
        [
            {
                icon: Bold,
                label: "Bold",
                action: () => editor.chain().focus().toggleBold().run(),
                isActive: editor.isActive("bold"),
                disabled: !editor.can().chain().focus().toggleBold().run(),
            },
            {
                icon: Italic,
                label: "Italic",
                action: () => editor.chain().focus().toggleItalic().run(),
                isActive: editor.isActive("italic"),
                disabled: !editor.can().chain().focus().toggleItalic().run(),
            },
            {
                icon: Strikethrough,
                label: "Strikethrough",
                action: () => editor.chain().focus().toggleStrike().run(),
                isActive: editor.isActive("strike"),
                disabled: !editor.can().chain().focus().toggleStrike().run(),
            },
            {
                icon: UnderlineIcon,
                label: "Underline",
                action: () => editor.chain().focus().toggleUnderline().run(),
                isActive: editor.isActive("underline"),
                disabled: !editor.can().chain().focus().toggleUnderline().run(),
            },
        ],

        [
            {
                icon: LinkIcon,
                label: "Link",
                action: () => {
                    if (editor.isActive("link")) {
                        editor.chain().focus().unsetLink().run();
                    } else {
                        const url = window.prompt("Enter URL:");
                        if (url) {
                            editor.chain().focus().setLink({ href: url }).run();
                        }
                    }
                },
                isActive: editor.isActive("link"),
                disabled: false,
            },
            {
                icon: ImageIcon,
                label: "Image",
                action: () => {
                    if (editor.isActive("image")) {
                        // Delete selected image
                        editor.chain().focus().deleteSelection().run();
                    } else {
                        // Open file picker
                        fileInputRef.current?.click();
                    }
                },
                isActive: editor.isActive("image"),
                disabled: false,
            },
        ],
    ];

    const currentBlockType = editor
        ? editor.isActive("heading", { level: 2 })
            ? "heading-2"
            : editor.isActive("heading", { level: 3 })
              ? "heading-3"
              : editor.isActive("heading", { level: 4 })
                ? "heading-4"
                : editor.isActive("heading", { level: 5 })
                  ? "heading-5"
                  : "paragraph"
        : "paragraph";

    const handleBlockTypeChange = (value: string) => {
        if (!editor) {
            return;
        }

        switch (value) {
            case "heading-2":
                editor.chain().focus().setHeading({ level: 2 }).run();
                break;
            case "heading-3":
                editor.chain().focus().setHeading({ level: 3 }).run();
                break;
            case "heading-4":
                editor.chain().focus().setHeading({ level: 4 }).run();
                break;
            case "heading-5":
                editor.chain().focus().setHeading({ level: 5 }).run();
                break;
            default:
                editor.chain().focus().setParagraph().run();
        }
    };

    const handleToggleHtmlMode = () => {
        if (!editor) return;

        if (!isHtmlMode) {
            setHtmlValue(editor.getHTML());
            setIsHtmlMode(true);
        } else {
            const content = (htmlValue || "").trim() || EMPTY_PARAGRAPH;
            editor.commands.setContent(content, { emitUpdate: true });
            setIsHtmlMode(false);
        }
    };

    return (
        <div
            className={cn(
                "rich-text-editor",
                error && "is-error",
                disabled && "is-disabled",
                className
            )}
        >
            <div className="rich-text-editor-toolbar">
                <span>
                    <Select
                        value={currentBlockType}
                        onValueChange={handleBlockTypeChange}
                        disabled={disabled || !editor || isHtmlMode}
                    >
                        <SelectTrigger className="rich-text-editor-toolbar__block-trigger">
                            <SelectValue placeholder="Paragraph" />
                        </SelectTrigger>
                        <SelectContent className="rich-text-editor-toolbar__block-content">
                            <SelectItem value="paragraph">Paragraph</SelectItem>
                            <SelectItem value="heading-2">Heading 2</SelectItem>
                            <SelectItem value="heading-3">Heading 3</SelectItem>
                            <SelectItem value="heading-4">Heading 4</SelectItem>
                            <SelectItem value="heading-5">Heading 5</SelectItem>
                        </SelectContent>
                    </Select>
                </span>
                <span className="rich-text-editor-toolbar__divider" />
                {toolbarGroups.map((group, groupIndex) => (
                    <div
                        key={`group-${groupIndex}`}
                        className="rich-text-editor-toolbar__group"
                    >
                        {group.map(
                            (
                                {
                                    icon: Icon,
                                    label,
                                    action,
                                    isActive,
                                    disabled: isDisabled,
                                },
                                index
                            ) => (
                                <button
                                    key={`${label}-${index}`}
                                    type="button"
                                    className={cn(
                                        "rich-text-editor-toolbar__button",
                                        isActive && "is-active"
                                    )}
                                    onClick={action}
                                    aria-label={label}
                                    disabled={
                                        isDisabled || disabled || isHtmlMode
                                    }
                                >
                                    <Icon size={16} strokeWidth={2} />
                                </button>
                            )
                        )}
                        {groupIndex < toolbarGroups.length - 1 ? (
                            <span className="rich-text-editor-toolbar__divider" />
                        ) : null}
                    </div>
                ))}
                <span className="rich-text-editor-toolbar__divider" />
                <button
                    type="button"
                    onClick={handleToggleHtmlMode}
                    className={cn(
                        "rich-text-editor-toolbar__button",
                        isHtmlMode && "is-active"
                    )}
                    aria-label={isHtmlMode ? "Switch to editor" : "Edit HTML"}
                    disabled={disabled}
                >
                    <Code size={16} strokeWidth={2} />
                </button>
            </div>
            {isHtmlMode ? (
                <textarea
                    className="font-mono min-h-40 w-full rounded-b-lg border border-t-0 border-bd-brown bg-white-main p-4 text-sm text-typo-soft outline-none focus:ring-1 focus:ring-ring/30"
                    value={htmlValue}
                    onChange={(e) => setHtmlValue(e.target.value)}
                    placeholder="Paste HTML here..."
                />
            ) : (
                <div className="rich-text-editor-content" style={{ maxHeight }}>
                    <EditorContent editor={editor} />
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
            />
        </div>
    );
}
