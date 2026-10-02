import { Button } from "@/components/ui/button";
import {
    FileInput,
    FileUploader,
    FileUploaderContent,
    FileUploaderItem,
} from "@/components/ui/dropzone";
import { formatBytes } from "@/lib/utils";
import { TFileUploadDropzoneProps } from "@/modules/kyc/step/form-upload-document";
import { useCallback, useRef, useState } from "react";
import { DropzoneOptions } from "react-dropzone";
import { FieldValues } from "react-hook-form";
import IconClose from "../icons/icon-close";
import IconUpload from "../icons/icon-upload";

export const FileUploadDropzone = <T extends FieldValues>({
    maxFiles,
    maxSize,
    accept,
    multiple,
    subTitle,
    field,
    onCompleted,
}: TFileUploadDropzoneProps<T> & {
    onCompleted?: (file: File | null) => void;
}) => {
    const [files, setFiles] = useState<File[]>([]);
    const wrapInputRef = useRef<HTMLInputElement>(null);

    const dropzone = {
        accept,
        multiple,
        maxFiles: maxFiles + 1,
        maxSize,
    } satisfies DropzoneOptions;

    const renderMidContent = useCallback(() => {
        return (
            <div className="absolute left-1/2 top-1/2 z-30 flex w-[62.5%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3">
                <Button
                    size={"icon"}
                    className="[&_path]:stroke-current"
                    onClick={() => {
                        wrapInputRef.current
                            ?.querySelector<HTMLInputElement>("input")
                            ?.click();
                    }}
                    variant="outline"
                >
                    <div className="h-5 w-5 flex-shrink-0">
                        <IconUpload />
                    </div>
                </Button>

                {!files?.length && (
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-sm font-semibold text-typo-primary">
                            Click to upload
                        </div>
                        <div className="text-center text-base text-typo-note">
                            {subTitle}
                        </div>
                    </div>
                )}
            </div>
        );
    }, [files?.length, subTitle]);
    console.log("files", files);
    return (
        <FileUploader
            value={files}
            onValueChange={(value) => {
                setFiles(value || []);
                field?.onChange?.(value?.[0]);
            }}
            dropzoneOptions={dropzone}
            className="overflow-hidden rounded-lg [&_*]:col-start-1 [&_*]:row-start-1"
        >
            <div className="relative">
                <FileInput className="h-[10.875rem]" ref={wrapInputRef}>
                    <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed bg-bg-main" />
                </FileInput>
                {renderMidContent()}
            </div>
            <FileUploaderContent className="z-10 !row-start-2 flex w-full flex-col items-center overflow-hidden rounded-e-lg p-[1px]">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        {files?.map((file, i) => (
                            <FileUploaderItem
                                key={i}
                                index={i}
                                isHideRemoveButton={true}
                                className="h-auto w-full overflow-hidden rounded-md border bg-bg-main p-4 hover:bg-bg-main"
                                aria-roledescription={`file ${i + 1} containing ${file.name}`}
                            >
                                <div className="flex flex-col">
                                    <div className="text-sm font-medium !text-typo-primary">
                                        {file.name}
                                    </div>
                                    <div className="text-sm text-typo-note">
                                        {formatBytes(file.size)}
                                    </div>
                                    <div
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-typo-note"
                                        onClick={() => {
                                            setFiles((prev) =>
                                                prev.filter(
                                                    (_, index) => index !== i
                                                )
                                            );
                                        }}
                                    >
                                        <div className="h-4 w-4">
                                            <IconClose />
                                        </div>
                                    </div>
                                </div>
                            </FileUploaderItem>
                        ))}
                    </div>
                    {!!files?.length && (
                        <div>
                            <Button
                                variant={"secondary"}
                                disabled={!files?.length}
                                onClick={() => {
                                    onCompleted?.(files?.[0] || null);
                                }}
                            >
                                Mark as Complete
                            </Button>
                        </div>
                    )}
                </div>
            </FileUploaderContent>
        </FileUploader>
    );
};
