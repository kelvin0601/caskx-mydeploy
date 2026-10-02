"use client";

import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import {
    FileInput,
    FileUploader,
    FileUploaderContent,
    FileUploaderItem,
    useFileUpload,
} from "@/components/ui/dropzone";
import { useFormField } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { cn, isEmpty } from "@/lib/utils";
import Image from "next/image";
import React, {
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
} from "react";
import {
    FieldValue,
    FieldValues,
    Path,
    UseFormSetValue,
} from "react-hook-form";
import IconSwitchHrz from "../icons/icon-switch";
import IconTrash from "../icons/icon-trash";
import IconUpload from "../icons/icon-upload";

type FormImageUploadProps<T extends FieldValues> = {
    label?: string;
    defaultValue?: string[] | null;
    required?: boolean;
    placeholder?: string;
    helperText?: string;
    size?: "default" | "small";
    form: {
        setValue: UseFormSetValue<T>;
    };
    fieldName: Path<T>;
    name?: string;
    accept?: {
        "image/*": string[];
    };
    maxFiles?: number;
    className?: string;
    ref?: React.RefObject<{
        files: File[] | null;
        setFiles: (files: File[] | null) => void;
    }>;
    value?: File[] | null;
    classNameImageUpload?: string;
    onValueChange?: (files: File[] | null) => void;
    isLoading?: boolean;
    trashOnly?: boolean;
    isCustomHelperText?: boolean;
    classNameUploadContainer?: string;
    appearance?: "default" | "general-information";
};

export function FormImageUpload<T extends FieldValues>({
    label,
    required = false,
    placeholder = "Click to upload",
    helperText = "(min. 800x400px)",
    size = "default",
    form,
    fieldName,
    defaultValue = null,
    name,
    accept = {
        "image/*": [".png", ".jpg", ".jpeg"],
    },
    ref,
    maxFiles = 1,
    onValueChange: externalOnValueChange,
    className = "",
    value: controlledValue,
    classNameImageUpload,
    isLoading = false,
    trashOnly = false,
    isCustomHelperText = false,
    classNameUploadContainer,
    appearance = "default",
}: FormImageUploadProps<T>) {
    const [imageFiles, setImageFiles] = useState<File[] | string[] | null>(
        isEmpty(defaultValue) ? [] : defaultValue
    );
    const { error } = useFormField();
    const isControlled = controlledValue !== undefined;
    const isGeneralInformation = appearance === "general-information";
    const files = isControlled ? controlledValue : imageFiles;
    const hasFiles = useMemo(() => Boolean(files && files.length > 0), [files]);
    const prevDefaultValueRef = React.useRef(defaultValue);

    // Keep internal state in sync when `defaultValue` changes (e.g. after form.reset)
    useEffect(() => {
        if (isControlled) return;

        const prev = prevDefaultValueRef.current;
        const prevSerialized = Array.isArray(prev)
            ? prev.join(",")
            : (prev ?? "");
        const currentSerialized = Array.isArray(defaultValue)
            ? defaultValue.join(",")
            : (defaultValue ?? "");

        if (prevSerialized !== currentSerialized) {
            prevDefaultValueRef.current = defaultValue;
            setImageFiles(isEmpty(defaultValue) ? [] : defaultValue);
        }
    }, [defaultValue, isControlled]);

    const setFiles = useCallback(
        (newFiles: File[] | string[] | null) => {
            if (!isControlled) {
                setImageFiles(newFiles);
            }
            if (newFiles && newFiles.length > 0) {
                const first = newFiles[0];
                const url =
                    typeof first === "string"
                        ? first
                        : URL.createObjectURL(first);
                form.setValue(fieldName, url as FieldValue<T>);
            } else {
                form.setValue(fieldName, "" as FieldValue<T>);
            }
            externalOnValueChange?.(newFiles as File[] | null);
        },
        [externalOnValueChange, fieldName, form, isControlled]
    );

    const previewUrls = useMemo(() => {
        return (
            files?.map((file) => {
                if (typeof file === "string") {
                    return file;
                } else {
                    return URL.createObjectURL(file);
                }
            }) ?? []
        );
    }, [files]);

    const handleValueChange = useCallback(
        (newFiles: File[] | null) => {
            if (!newFiles || newFiles.length === 0) {
                setFiles(null);
                return;
            }

            const isLarger = newFiles.length > maxFiles;
            const trimmedFiles = isLarger
                ? newFiles.slice(newFiles.length - maxFiles, newFiles.length)
                : newFiles;
            setFiles(trimmedFiles);
        },
        [maxFiles, setFiles]
    );

    const currentFileIndex = useMemo(
        () => (files ? files.length - 1 : -1),
        [files]
    );
    const handleRemove = useCallback(() => {
        if (!files || currentFileIndex < 0) return;

        const updatedFiles = files.slice(0, -1);
        setFiles(updatedFiles.length > 0 ? (updatedFiles as File[]) : null);
    }, [currentFileIndex, files, setFiles]);

    const imperativeHandleValue = useMemo(
        () => ({
            files: files as File[] | null,
            setFiles: (files: File[] | null) => setFiles(files),
        }),
        [files, setFiles]
    );

    useImperativeHandle(ref, () => imperativeHandleValue, [
        imperativeHandleValue,
    ]);
    return (
        <div className={cn("", className)}>
            {label && (
                <Label
                    className={cn(
                        "text-sm text-typo-primary",
                        isGeneralInformation ? "mb-1.5" : "mb-2",
                        !isGeneralInformation && "font-medium",
                        error && "text-error"
                    )}
                >
                    {label}{" "}
                    {required && (
                        <span
                            className={cn("text-brand", error && "text-error")}
                        >
                            *
                        </span>
                    )}
                </Label>
            )}
            <FileUploader
                value={files as File[]}
                onValueChange={handleValueChange}
                dropzoneOptions={useMemo(
                    () => ({
                        accept,
                        maxFiles: maxFiles + 1,
                    }),
                    [accept, maxFiles]
                )}
                data-name="file-upload"
                className={cn(
                    "relative",
                    size === "small"
                        ? "aspect-[78/60] w-32"
                        : "h-[11.25rem] w-[11.25rem]",
                    classNameImageUpload
                )}
            >
                <FileInput name={name} className="h-full w-full">
                    <div
                        className={
                            classNameUploadContainer
                                ? cn(
                                      "group relative flex h-full w-full flex-col items-center justify-center text-center transition-all duration-200 hover:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40",
                                      error &&
                                          "border-error hover:border-error-darker focus-visible:border-error",
                                      hasFiles &&
                                          !isLoading &&
                                          "border-transparent bg-transparent",
                                      classNameUploadContainer,
                                      isLoading && "!border-none bg-bg-sf4"
                                  )
                                : cn(
                                      isGeneralInformation
                                          ? "group relative flex h-full w-full flex-col items-center justify-center gap-5 border border-bd-main p-6 text-center transition-all duration-200 hover:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40"
                                          : "group relative flex h-full w-full flex-col items-center justify-center gap-4 border border-bd-main px-6 py-8 text-center transition-all duration-200 hover:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/40",
                                      error &&
                                          "border-error hover:border-error-darker focus-visible:border-error",
                                      hasFiles &&
                                          !isLoading &&
                                          "border-transparent bg-transparent",
                                      size === "small" && "p-0",
                                      isLoading && "!border-none bg-bg-sf4"
                                  )
                        }
                    >
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center gap-5 text-center">
                                <div
                                    className={cn(
                                        isGeneralInformation
                                            ? "size-6"
                                            : "size-8",
                                        "text-typo-soft"
                                    )}
                                >
                                    {isGeneralInformation ? (
                                        <Image
                                            src="/icons/icon-loading-01-line.svg"
                                            alt=""
                                            aria-hidden="true"
                                            width={24}
                                            height={24}
                                        />
                                    ) : (
                                        <IconSwitchHrz />
                                    )}
                                </div>
                                <span className="text-sm font-medium leading-[1.5] text-typo-soft">
                                    Uploading...
                                </span>
                            </div>
                        ) : !hasFiles ? (
                            <>
                                {trashOnly ? (
                                    <div className="h-6 w-6 text-icon">
                                        <IconUpload />
                                    </div>
                                ) : isGeneralInformation ? (
                                    <div className="size-6">
                                        <Image
                                            src="/icons/icon-upload-01-line.svg"
                                            alt=""
                                            aria-hidden="true"
                                            width={24}
                                            height={24}
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className={cn(
                                            "flex h-12 w-12 items-center justify-center border border-border",
                                            size === "small" &&
                                                "size-10 border-none"
                                        )}
                                    >
                                        <div className="h-6 w-6 text-icon">
                                            <IconUpload />
                                        </div>
                                    </div>
                                )}
                                <div
                                    className={cn(
                                        "flex flex-col items-center gap-1 text-sm",
                                        size === "small" && "hidden"
                                    )}
                                >
                                    <span className="text-sm font-medium leading-[1.5] text-typo-primary">
                                        {placeholder}
                                    </span>
                                    <span className="whitespace-pre-line text-xs font-normal leading-[1.2] text-typo-soft">
                                        {isGeneralInformation
                                            ? ".png or .jpg only\n(max 5MB)"
                                            : helperText}
                                    </span>
                                </div>
                            </>
                        ) : null}
                    </div>
                </FileInput>
                {hasFiles && !isLoading && currentFileIndex >= 0 && (
                    <FileUploaderContent className="absolute inset-0 h-full w-full">
                        <FileUploaderItem
                            key={currentFileIndex}
                            index={currentFileIndex}
                            isHideRemoveButton
                            className={cn(
                                "group/item relative h-full w-full !items-stretch !justify-start overflow-hidden p-0 [&>button]:hidden [&>div]:h-full [&>div]:w-full [&>div]:items-stretch",
                                classNameUploadContainer,
                                "!border-none !p-0"
                            )}
                        >
                            {previewUrls?.[currentFileIndex] && (
                                <UploadedImagePreview
                                    src={previewUrls[currentFileIndex]}
                                    alt={
                                        typeof files![currentFileIndex] ===
                                        "string"
                                            ? files![currentFileIndex]
                                            : files![currentFileIndex].name
                                    }
                                    onRemove={handleRemove}
                                    size={size}
                                    trashOnly={trashOnly}
                                    appearance={appearance}
                                />
                            )}
                        </FileUploaderItem>
                    </FileUploaderContent>
                )}
            </FileUploader>
        </div>
    );
}

type UploadedImagePreviewProps = {
    src: string;
    alt: string;
    onRemove: () => void;
    size: "default" | "small";
    trashOnly?: boolean;
    appearance?: "default" | "general-information";
};

function UploadedImagePreview({
    src,
    alt,
    onRemove,
    size,
    trashOnly = false,
    appearance = "default",
}: UploadedImagePreviewProps) {
    const { dropzoneState } = useFileUpload();
    const isGeneralInformation = appearance === "general-information";

    const handleEdit = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (dropzoneState.inputRef.current) {
            dropzoneState.inputRef.current.value = "";
            dropzoneState.inputRef.current.click();
        }
    };

    const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (dropzoneState.inputRef.current) {
            dropzoneState.inputRef.current.value = "";
        }
        onRemove();
    };

    if (trashOnly) {
        return (
            <div className="relative h-full w-full bg-bg-sf3">
                <ImagePreload
                    src={src}
                    alt={alt}
                    priority
                    fetchPriority="high"
                    height={100}
                    width={100}
                    className="h-full w-full object-cover"
                    loading="eager"
                />
                <Button
                    variant={"empty"}
                    onClick={handleRemove}
                    className="absolute right-1 top-1 z-10 size-10 min-w-0 bg-bg-dark-main"
                >
                    <span className="sr-only">Remove image</span>
                    <div className="size-5 flex-shrink-0 text-typo-dark-soft transition-all hover:text-typo-dark-primary">
                        <IconTrash />
                    </div>
                </Button>
            </div>
        );
    }

    return (
        <div
            className="relative h-full w-full cursor-pointer"
            onClick={handleEdit}
        >
            <div className="absolute inset-0 overflow-hidden">
                <ImagePreload
                    src={src}
                    alt={alt}
                    priority
                    fetchPriority="high"
                    height={180}
                    width={180}
                    sizes="180px"
                    className="h-full w-full object-cover"
                    loading="eager"
                />
            </div>
            {isGeneralInformation ? (
                <Button
                    variant="empty"
                    onClick={handleRemove}
                    className="absolute right-1 top-1 z-10 size-10 min-w-0 bg-bg-dark-main !p-0 text-typo-dark-soft shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)] transition-colors hover:bg-bg-dark-main hover:text-typo-dark-primary focus-visible:bg-bg-dark-main"
                >
                    <span className="sr-only">Remove image</span>
                    <span className="size-4 text-typo-dark-primary">
                        <IconTrash />
                    </span>
                </Button>
            ) : (
                <div
                    className={cn(
                        "absolute right-1 top-1 flex items-center gap-3 bg-bg-dark-main p-3 text-white-main",
                        size === "small"
                            ? "inset-0 h-full w-full min-w-0 opacity-0 [&_*]:!h-full [&_*]:!w-full"
                            : ""
                    )}
                >
                    <Button
                        variant="empty"
                        onClick={handleRemove}
                        className={cn(
                            "pointer-events-auto !w-max !min-w-0 !p-0 text-typo-dark-soft transition-colors hover:text-typo-dark-primary",
                            size === "small" ? "hidden" : ""
                        )}
                    >
                        <span className="sr-only">Remove image</span>
                        <div className="size-4">
                            <IconTrash />
                        </div>
                    </Button>
                </div>
            )}
        </div>
    );
}
