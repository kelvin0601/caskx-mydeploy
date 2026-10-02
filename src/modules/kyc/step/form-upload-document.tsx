import IconUpload from "@/components/shared/icons/icon-upload";
import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import {
    FileInput,
    FileUploader,
    FileUploaderContent,
    FileUploaderItem,
} from "@/components/ui/dropzone";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form";
import { useDisableButtonForm } from "@/hooks/useDisableButtonForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { Accept, DropzoneOptions } from "react-dropzone";
import { ControllerRenderProps, FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import HeadingKyc from "../heading";
import { useKycStep } from "../provider/kyc-step-provider";

const UploadField = <T extends FieldValues>({
    title,
    field,
}: {
    title: string;
    field: ControllerRenderProps<T>;
}) => {
    return (
        <FormItem>
            <FormControl>
                <div className="flex w-full flex-col gap-4">
                    <div className="text-base font-medium capitalize text-typo-primary">
                        {title}
                    </div>

                    <FileUploadDropzone<T>
                        subTitle="Max 50 MB in jpg/.jpeg/.png format"
                        maxFiles={1}
                        maxSize={50 * 1024 * 1024}
                        accept={{
                            "image/*": [".jpg", ".jpeg", ".png"],
                        }}
                        multiple={true}
                        field={field}
                    />
                </div>
            </FormControl>
            <FormMessage />
        </FormItem>
    );
};

export default function FormUploadDocument() {
    const { nextStep, formData, setFormData } = useKycStep();
    const isIdCard = formData.identificationType === "id-card";
    const dataUpload: Record<
        string,
        {
            heading: string;
            front: () => React.ReactNode;
            back?: () => React.ReactNode;
        }
    > = {
        "id-card": {
            heading: "Upload Your ID Card",
            front: () => (
                <FormField
                    control={form.control}
                    name="front"
                    render={({ field }) => (
                        <UploadField title="Front side" field={field} />
                    )}
                />
            ),
            back: () => (
                <FormField
                    control={form.control}
                    name="back"
                    render={({ field }) => (
                        <UploadField title="Back side" field={field} />
                    )}
                />
            ),
        },
        passport: {
            heading: "Upload Your Passport",
            front: () => (
                <FormField
                    control={form.control}
                    name="front"
                    render={({ field }) => (
                        <UploadField title="Front side" field={field} />
                    )}
                />
            ),
        },
        "driver-license": {
            heading: "Upload Your Driver's License",
            front: () => (
                <FormField
                    control={form.control}
                    name="front"
                    render={({ field }) => (
                        <UploadField title="Front side" field={field} />
                    )}
                />
            ),
        },
    } as const;

    const formSchema = z
        .object({
            front: z.instanceof(File).refine((file) => file.size > 0, {
                message: "File is required",
            }),
            back: z.instanceof(File).optional(),
        })
        .superRefine((data, ctx) => {
            if (isIdCard && !data.back) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "File is required",
                    path: ["back"],
                });
            }
            return true;
        });

    type FormValues = z.infer<typeof formSchema>;

    const form = useForm<FormValues>({
        defaultValues: {
            front: undefined,
            back: undefined,
        },
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormValues) => {
        console.log(data);
        // const res = await ocrServices.getOcrData(data.front);
        // console.log("res", res);
        nextStep();
        setFormData({
            identificationImages: {
                front: data.front,
                back: data.back,
            },
        });
    };
    const isDisabled = useDisableButtonForm(
        form,
        isIdCard ? undefined : ["back"]
    );

    return (
        <div className="flex flex-col gap-4">
            <HeadingKyc
                title={dataUpload[formData.identificationType].heading}
            />
            <Form {...form}>
                <form
                    className="flex flex-col gap-4"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    {dataUpload[formData.identificationType].front()}
                    {dataUpload[formData.identificationType]?.back?.()}
                    <Button
                        disabled={isDisabled}
                        type="submit"
                        className="mx-auto max-w-max"
                        variant="secondary"
                    >
                        Continue
                    </Button>
                </form>
            </Form>
        </div>
    );
}

export type TFileUploadDropzoneProps<T extends FieldValues> = {
    maxFiles: number;
    maxSize: number;
    accept: Accept;
    multiple: boolean;
    subTitle: string;
    field?: ControllerRenderProps<T>;
};

const FileUploadDropzone = <T extends FieldValues>({
    maxFiles,
    maxSize,
    accept,
    multiple,
    subTitle,
    field,
}: TFileUploadDropzoneProps<T>) => {
    const [files, setFiles] = useState<File[]>([]);
    const wrapInputRef = useRef<HTMLInputElement>(null);

    const dropzone = {
        accept,
        multiple,
        maxFiles: maxFiles + 1,
        maxSize,
    } satisfies DropzoneOptions;

    useEffect(() => {
        if (files?.length > 1) {
            setFiles(files.slice(1));
        }
    }, [files?.length]);

    const renderMidContent = useCallback(() => {
        const titleBtn = files?.length ? "Reupload" : "Upload";

        return (
            <div className="absolute left-1/2 top-1/2 z-30 flex w-[62.5%] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-4">
                <Button
                    className="!min-w-28 [&_path]:stroke-current"
                    onClick={() => {
                        wrapInputRef.current
                            ?.querySelector<HTMLInputElement>("input")
                            ?.click();
                    }}
                    variant="secondary"
                >
                    <div className="h-4 w-4">
                        <IconUpload />
                    </div>
                    {titleBtn}
                </Button>
                {!files?.length && (
                    <div className="text-center text-base text-typo-note">
                        {subTitle}
                    </div>
                )}
            </div>
        );
    }, [files?.length, subTitle]);

    return (
        <FileUploader
            value={files}
            onValueChange={(value) => {
                setFiles(value || []);
                field?.onChange?.(value?.[0]);
            }}
            dropzoneOptions={dropzone}
            className="relative aspect-[480/315] h-full overflow-hidden rounded-lg [&_*]:col-start-1 [&_*]:row-start-1"
        >
            <FileInput className="h-full" ref={wrapInputRef}>
                <div className="flex h-full w-full items-center justify-center rounded-md border border-dashed bg-bg-sf1" />
            </FileInput>
            {renderMidContent()}
            <FileUploaderContent className="pointer-events-none absolute inset-0 left-1/2 top-1/2 z-10 flex h-full w-full -translate-x-1/2 -translate-y-1/2 flex-row items-center gap-2 overflow-hidden rounded-e-lg p-[1px]">
                {files?.map((file, i) => (
                    <FileUploaderItem
                        key={i}
                        index={i}
                        isHideRemoveButton={true}
                        className="size-full overflow-hidden rounded-md p-0"
                        aria-roledescription={`file ${i + 1} containing ${file.name}`}
                    >
                        <ImagePreload
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            height={400}
                            width={400}
                            className="size-full p-0"
                        />
                    </FileUploaderItem>
                ))}
            </FileUploaderContent>
        </FileUploader>
    );
};
