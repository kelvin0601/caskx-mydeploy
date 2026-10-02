"use client";

import IconDownload from "@/components/shared/icons/icon-download";
import StepRowAccordion from "@/components/shared/step-row-accordion";
import { FileUploadDropzone } from "@/components/shared/upload-zone";
import { Card } from "@/components/ui/card";
import {
    cn,
    downloadFile,
    formatDateTime,
    handleRenderFallbackText,
} from "@/lib/utils";

import { useState } from "react";
import { Loader } from "lucide-react";
import { global } from "@/types/global/global";

export default function StepOwnershipTransfer({
    status,
    isCompleted,
    isDisabled = false,
    onOpenAlert,
    onFileUploaded,
    id,
    ownership: { documentUrl, documentUploadedAt },
}: {
    status: global.TParticipantStatus;
    isCompleted: boolean;
    isDisabled?: boolean;
    onOpenAlert: () => void;
    onFileUploaded?: (file: File) => void;
    id: string;
    ownership: {
        documentUrl: string;
        documentUploadedAt: string;
    };
}) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDownload = async () => {
        setIsLoading(true);
        await downloadFile(documentUrl, "Ownership Transfer Document.pdf");
        setIsLoading(false);
    };
    return (
        <StepRowAccordion
            title="Step 4: Ownership Transfer"
            value="step-4"
            status={status}
            isActive={!isDisabled}
            isDisabled={isDisabled}
        >
            <div className="mb-1.5 border-bd-brown pt-6 text-sm">
                Ownership Documents
            </div>
            {isCompleted && documentUrl ? (
                <div className="flex flex-col gap-4">
                    <Card className="relative bg-bg-main p-4">
                        <div className="text-sm font-medium text-typo-primary">
                            Ownership Transfer Document.pdf
                        </div>
                        <div className="text-sm text-typo-note">
                            {handleRenderFallbackText(
                                formatDateTime(documentUploadedAt)
                                    .dataOnlyNumber
                            )}
                        </div>

                        <button
                            onClick={handleDownload}
                            className="absolute right-0 top-1/2 -translate-y-1/2 p-4 text-typo-note transition-colors hover:text-typo-primary"
                            aria-label="Download document"
                        >
                            <div className={cn("size-4 text-typo-note")}>
                                {isLoading ? (
                                    <Loader className="size-4 animate-spin" />
                                ) : (
                                    <IconDownload />
                                )}
                            </div>
                        </button>
                    </Card>
                </div>
            ) : (
                <FileUploadDropzone
                    maxFiles={1}
                    onCompleted={(file) => {
                        if (file && onFileUploaded) {
                            onFileUploaded(file);
                        }
                        onOpenAlert();
                    }}
                    maxSize={100 * 1024 * 1024}
                    accept={{
                        "application/pdf": [".pdf"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                            [".docx"],
                        "application/vnd.ms-excel": [".xlsx"],
                        "application/vnd.ms-powerpoint": [".pptx", ".ppt"],
                    }}
                    multiple={true}
                    subTitle="Max 5 MB in .pdf format"
                    field={undefined}
                />
            )}
        </StepRowAccordion>
    );
}
