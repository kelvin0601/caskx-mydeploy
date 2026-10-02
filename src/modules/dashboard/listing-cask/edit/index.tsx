// "use client";

// import { FormImageUpload } from "@/components/shared/form-image-upload";
// import IconCalendar from "@/components/shared/icons/icon-calendar";
// import IconChevonRight from "@/components/shared/icons/icon-chevon-right";
// import IconHelp from "@/components/shared/icons/icon-help";
// import CustomTooltip from "@/components/shared/tooltips-custom";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTriggerWithForm,
//     SelectValue,
// } from "@/components/ui/select";
// import { Skeleton } from "@/components/ui/skeleton";
// import { Textarea } from "@/components/ui/textarea";
// import { VirtualizedCombobox } from "@/components/ui/virtualized-combobox";
// import { setFormErrors } from "@/helpers";
// import { useFormChangeDetector } from "@/hooks/useFormChangeDetector";
// import {
//     CASK_KEYS,
//     DISTILLERY_KEYS,
//     FILTER_KEYS,
//     PATH_CLASSIFICATION,
//     PATH_DISTILLERIES,
//     PATH_META_DATA_CASK,
//     PATH_REGIONS,
//     ROUTE_DASHBOARD,
// } from "@/lib/constants";
// import {
//     cn,
//     formatNumberToDecimal,
//     formatNumberToNumber,
//     isValidDecimal,
// } from "@/lib/utils";
// import { caskFormSchema } from "@/lib/validators";
// import caskServices from "@/services/cask";
// import classificationsServices from "@/services/classifications";
// import distilleriesServices from "@/services/distilleries";
// import regionsServices from "@/services/region";
// import { cask } from "@/types";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useEffect, useRef, useState } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { z } from "zod";

// type FormValues = z.infer<typeof caskFormSchema>;
// const initialValues: Partial<FormValues> = {
//     name: "",
//     distilleryId: "",
//     caskTypeId: "",
//     description: "",
//     tastingNotes: "",
//     regionId: "",
//     classification: "",
//     distillationDate: "",
//     // expectedMaturityDate: "",
//     estimatedBottleCount: undefined,
//     vintageYear: undefined,
//     bottleVolume: undefined,
//     abv: "",
//     rla: "",
//     isListed: true,
//     readyToSell: false,
//     ola: "",
//     priceReference: [],
//     image: "",
// };
// export default function CaskEditModule({ id }: { id: string }) {
//     const [openDistillation, setOpenDistillation] = useState(false);
//     const [openMaturity, setOpenMaturity] = useState(false);
//     const queryClient = useQueryClient();
//     const router = useRouter();
//     const imageFileRef = useRef<File | null | string>(null);

//     const formatDateYYYYMMDD = (date?: Date) => {
//         if (!date || !(date instanceof Date) || isNaN(date.getTime()))
//             return "";
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };
//     const detailQuery = useQuery({
//         queryKey: [CASK_KEYS.CASK_DETAIL, id],
//         queryFn: () => caskServices.getDetailCask(id),
//     });

//     const distilleriesQuery = useQuery({
//         queryKey: [PATH_DISTILLERIES, DISTILLERY_KEYS.LISTING, id],
//         queryFn: () => distilleriesServices.getDistillery("page=1&limit=1000"),
//     });

//     const caskTypesQuery = useQuery({
//         queryKey: [FILTER_KEYS.CASK_TYPE, id],
//         queryFn: () => caskServices.getCaskTypes("page=1&size=1000"),
//     });
//     const classificationsQuery = useQuery({
//         queryKey: [PATH_META_DATA_CASK, PATH_CLASSIFICATION, id],
//         queryFn: () => classificationsServices.getClassification(),
//     });
//     const regionsQuery = useQuery({
//         queryKey: [PATH_REGIONS, id],
//         queryFn: () => regionsServices.getRegions(),
//     });
//     const updateMutation = useMutation({
//         mutationFn: (values: Record<string, unknown>) =>
//             caskServices.updateDetailCask(id, values),
//     });

//     const form = useForm<FormValues>({
//         resolver: zodResolver(caskFormSchema),
//         defaultValues: initialValues,
//     });

//     const {
//         hasFormChanged,
//         setInitialSnapshot,
//         computeHasChanges,
//         getChangedValues,
//     } = useFormChangeDetector<FormValues>({
//         form,
//         compareFields: [
//             "name",
//             "description",
//             "tastingNotes",
//             "distilleryId",
//             "caskTypeId",
//             "regionId",
//             "classification",
//             "distillationDate",
//             // "expectedMaturityDate",
//             "estimatedBottleCount",
//             "vintageYear",
//             "bottleVolume",
//             "abv",
//             "rla",
//             "ola",
//             "priceReference",
//             "isListed",
//             "readyToSell",
//         ],
//         fileFields: ["image"],
//     });

//     useEffect(() => {
//         const d = detailQuery.data as cask.TCask | undefined;
//         // Wait for both detail data and options to be loaded
//         if (
//             !d ||
//             !distilleriesQuery.data ||
//             !caskTypesQuery.data ||
//             !classificationsQuery.data ||
//             !regionsQuery.data
//         )
//             return;

//         const formattedDistillationDate = d.distillationDate
//             ? formatDateYYYYMMDD(new Date(d.distillationDate as string))
//             : "";
//         const formattedExpectedMaturityDate = d.expectedMaturityDate
//             ? formatDateYYYYMMDD(new Date(d.expectedMaturityDate as string))
//             : "";

//         // Convert priceReference to array format
//         // Priority: use referencePriceMin/Max if available, otherwise parse priceReference string
//         let priceReferenceArray: number[] = [];
//         if (
//             d.referencePriceMin !== undefined &&
//             d.referencePriceMax !== undefined
//         ) {
//             priceReferenceArray = [
//                 Number(d.referencePriceMin),
//                 Number(d.referencePriceMax),
//             ];
//         } else if (d.priceReference) {
//             // Try to parse priceReference string (could be single value or range)
//             const priceRefStr = d.priceReference.toString();
//             const parts = priceRefStr
//                 .split("-")
//                 .map((p) => parseFloat(p.trim()));
//             if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
//                 priceReferenceArray = [parts[0], parts[1]];
//             } else {
//                 const singleValue = parseFloat(priceRefStr);
//                 if (!isNaN(singleValue)) {
//                     priceReferenceArray = [singleValue];
//                 }
//             }
//         }

//         const initialValues: FormValues = {
//             name: d.name || "",
//             distilleryId: d.distilleryId || d.distillery?.id || "",
//             caskTypeId: String(d.caskTypeId || d.caskType?.id || ""),
//             description: d.description || "",
//             ...(d.tastingNotes && { tastingNotes: d.tastingNotes }),
//             regionId: String(d.regionId || d.region?.id || ""),
//             classification: d.classification || "",
//             ...(formattedDistillationDate && {
//                 distillationDate: formattedDistillationDate,
//             }),
//             ...(formattedExpectedMaturityDate && {
//                 expectedMaturityDate: formattedExpectedMaturityDate,
//             }),
//             ...(d.estimatedBottleCount !== undefined && {
//                 estimatedBottleCount: Number(d.estimatedBottleCount),
//             }),
//             vintageYear: d.vintageYear,
//             ...(d.bottleVolume !== undefined && {
//                 bottleVolume: Number(d.bottleVolume),
//             }),
//             ...(d.abv && {
//                 abv: formatNumberToDecimal(d.abv.toString()),
//             }),
//             ...(d.ola && {
//                 ola: formatNumberToDecimal(d.ola.toString()),
//             }),
//             ...(d.rla && {
//                 rla: formatNumberToDecimal(d.rla.toString()),
//             }),
//             priceReference: priceReferenceArray,
//             isListed: Boolean(d.isListed),
//             readyToSell: d.readyToSell ?? false,
//             image: d.imageUrl || "",
//         };
//         console.log("initialValues", initialValues);
//         form.reset(initialValues);
//         setInitialSnapshot(initialValues);
//     }, [
//         detailQuery.data,
//         distilleriesQuery?.data,
//         caskTypesQuery?.data,
//         classificationsQuery?.data,
//         regionsQuery?.data,
//         form,
//         setInitialSnapshot,
//     ]);

//     const onSubmit = async (values: FormValues) => {
//         if (values.abv) {
//             values.abv = formatNumberToNumber(values.abv).toString();
//         }
//         if (values.rla) {
//             values.rla = formatNumberToNumber(values.rla).toString();
//         }
//         if (values.ola) {
//             values.ola = formatNumberToNumber(values.ola).toString();
//         }

//         try {
//             console.log("dataToSubmit.referencePriceMax", values);
//             if (!computeHasChanges(values)) {
//                 toast.info("No changes detected");
//                 return;
//             }
//             const dataToSubmit = getChangedValues(values) as FormValues & {
//                 referencePriceMin?: number;
//                 referencePriceMax?: number;
//                 image: File | string | null;
//             };

//             if (imageFileRef.current) {
//                 dataToSubmit.image = imageFileRef.current as unknown as string;
//             } else if (
//                 "image" in dataToSubmit &&
//                 typeof dataToSubmit.image === "string" &&
//                 dataToSubmit.image?.startsWith("blob:")
//             ) {
//                 dataToSubmit.image = "";
//             } else if ("image" in dataToSubmit && !dataToSubmit.image) {
//                 // If image was cleared, set to empty string
//                 dataToSubmit.image = "";
//             }
//             if (dataToSubmit?.priceReference) {
//                 dataToSubmit.referencePriceMin =
//                     dataToSubmit?.priceReference?.[0];
//                 dataToSubmit.referencePriceMax =
//                     dataToSubmit?.priceReference?.[1];
//                 delete (dataToSubmit as Record<string, unknown>).priceReference;
//             }
//             await updateMutation.mutateAsync(dataToSubmit);
//             toast.success("Cask updated successfully");

//             // Clear image file ref after successful update
//             imageFileRef.current = null;

//             queryClient.invalidateQueries({
//                 queryKey: [CASK_KEYS.CASK_DETAIL, id],
//             });
//             queryClient.invalidateQueries({
//                 queryKey: [CASK_KEYS.LISTING_PAGE],
//             });
//         } catch (error) {
//             setFormErrors(error, form, { capitalizeFirstLetter: true });
//         }
//     };

//     const detailImage = detailQuery.data?.imageUrl;
//     console.log("formerrors", form.formState.errors);
//     return (
//         <div className="mx-auto w-full">
//             <div className="mb-6 flex items-center justify-between">
//                 <h1 className="m-0 text-xl font-semibold text-typo-primary">
//                     Edit Cask
//                 </h1>
//                 <div className="flex items-center gap-1.5 text-sm text-typo-note">
//                     <Button
//                         variant={"link-df"}
//                         className="hover:text-typo-primary"
//                         onClick={() => router.push(ROUTE_DASHBOARD.CASK)}
//                     >
//                         All casks
//                     </Button>
//                     <div className="size-4 text-icon-main">
//                         <IconChevonRight />
//                     </div>
//                     <span className="text-typo-primary">Edit cask</span>
//                 </div>
//             </div>

//             {detailQuery.isLoading ? (
//                 <CaskEditSkeleton />
//             ) : detailQuery.isError ? (
//                 <div className="rounded border border-error bg-error/10 p-4 text-error">
//                     Failed to load cask
//                 </div>
//             ) : (
//                 <Form {...form}>
//                     <form
//                         onSubmit={form.handleSubmit(onSubmit)}
//                         className="space-y-6"
//                     >
//                         {/* Basic Information */}
//                         <div className="rounded-lg border border-border bg-bg-main">
//                             <div className="border-b border-bd-brown p-6 font-medium">
//                                 Basic Information
//                             </div>
//                             <div className="space-y-6 p-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="name"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Name </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     required
//                                                     placeholder="e.g., Cask Exchange Whisky"
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="description"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Description</FormLabel>
//                                             <FormControl>
//                                                 <Textarea
//                                                     required
//                                                     className="max-h-40 min-h-32 w-full"
//                                                     placeholder="e.g,. This cask boasts warm, intensely balanced flavors of zesty dried orange peel, vanilla pods and rich peat smoke..."
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="tastingNotes"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="flex flex-row items-center gap-2">
//                                                 Special notes
//                                                 <CustomTooltip
//                                                     childClass="bottom-[calc(100%+0.5rem)] "
//                                                     content="Each bullet point creates a separate note"
//                                                 >
//                                                     <div className="size-4">
//                                                         <IconHelp />
//                                                     </div>
//                                                 </CustomTooltip>
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Textarea
//                                                     className="max-h-40 min-h-32 w-full"
//                                                     placeholder="e.g., The high ABV of 68.35% of this cask means you get 344 extra bottles, an advantage compared to the average cask..."
//                                                     {...field}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="image"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormImageUpload
//                                                 label="Image"
//                                                 required
//                                                 form={form}
//                                                 fieldName="image"
//                                                 helperText="800 x 800px"
//                                                 placeholder="Click to upload"
//                                                 accept={{
//                                                     "image/*": [".png", ".jpg"],
//                                                 }}
//                                                 defaultValue={
//                                                     detailImage
//                                                         ? [detailImage]
//                                                         : undefined
//                                                 }
//                                                 onValueChange={(files) => {
//                                                     if (files?.length) {
//                                                         imageFileRef.current =
//                                                             files[0];
//                                                         field.onChange(
//                                                             files[0]
//                                                         );
//                                                     } else {
//                                                         imageFileRef.current =
//                                                             null;
//                                                         field.onChange("");
//                                                     }
//                                                 }}
//                                             />
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                         {/* Specifications */}
//                         <div className="rounded-lg border border-border bg-bg-main">
//                             <div className="border-b border-bd-brown p-6 font-medium">
//                                 Specifications
//                             </div>
//                             <div className="grid grid-cols-6 gap-6 p-6 [&>div]:col-span-3">
//                                 <FormField
//                                     control={form.control}
//                                     name="distilleryId"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Distillery</FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     className="font-normal"
//                                                     required
//                                                     options={
//                                                         distilleriesQuery?.data?.map(
//                                                             (distillery) => ({
//                                                                 value: distillery.id,
//                                                                 label: distillery.name,
//                                                             })
//                                                         ) || []
//                                                     }
//                                                     searchPlaceholder="Select a distillery"
//                                                     value={field.value}
//                                                     onValueChange={
//                                                         field.onChange
//                                                     }
//                                                     disabled={
//                                                         distilleriesQuery?.isLoading
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="caskTypeId"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Cask Type</FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     required
//                                                     className="font-normal"
//                                                     options={
//                                                         caskTypesQuery.data?.caskTypes?.map(
//                                                             (ct) => ({
//                                                                 value: ct.id,
//                                                                 label: ct.name,
//                                                             })
//                                                         ) || []
//                                                     }
//                                                     searchPlaceholder="Select a cask type"
//                                                     value={field.value}
//                                                     onValueChange={
//                                                         field.onChange
//                                                     }
//                                                     disabled={
//                                                         caskTypesQuery.isLoading
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="regionId"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Region</FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     className="font-normal"
//                                                     required
//                                                     options={
//                                                         regionsQuery.data?.map(
//                                                             (region) => ({
//                                                                 value: String(
//                                                                     region.id
//                                                                 ),
//                                                                 label: region.name,
//                                                             })
//                                                         ) || []
//                                                     }
//                                                     searchPlaceholder="Select a region"
//                                                     value={field.value}
//                                                     onValueChange={
//                                                         field.onChange
//                                                     }
//                                                     disabled={
//                                                         regionsQuery.isLoading
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="classification"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Category</FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     required
//                                                     className="font-normal"
//                                                     options={
//                                                         classificationsQuery.data?.classifications?.map(
//                                                             (
//                                                                 classification
//                                                             ) => ({
//                                                                 value: String(
//                                                                     classification.value
//                                                                 ),
//                                                                 label: classification.label,
//                                                             })
//                                                         ) || []
//                                                     }
//                                                     searchPlaceholder="Select a category"
//                                                     value={field.value}
//                                                     onValueChange={
//                                                         field.onChange
//                                                     }
//                                                     disabled={
//                                                         classificationsQuery.isLoading
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="distillationDate"
//                                     render={({ field }) => {
//                                         // Parse date string (YYYY-MM-DD) to Date object
//                                         const parseDate = (
//                                             dateString?: string
//                                         ): Date | undefined => {
//                                             if (!dateString) return undefined;
//                                             const [year, month, day] =
//                                                 dateString
//                                                     .split("-")
//                                                     .map(Number);
//                                             if (
//                                                 isNaN(year) ||
//                                                 isNaN(month) ||
//                                                 isNaN(day)
//                                             )
//                                                 return undefined;
//                                             return new Date(
//                                                 year,
//                                                 month - 1,
//                                                 day
//                                             );
//                                         };

//                                         const selectedDate = parseDate(
//                                             field.value
//                                         );

//                                         return (
//                                             <FormItem>
//                                                 <FormLabel>
//                                                     Distillation Date{" "}
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <Popover
//                                                         open={openDistillation}
//                                                         onOpenChange={
//                                                             setOpenDistillation
//                                                         }
//                                                     >
//                                                         <PopoverTrigger asChild>
//                                                             <Button
//                                                                 variant="outline"
//                                                                 className="h-10 w-full justify-between px-2 text-base hover:border-bd-sf2 hover:bg-transparent"
//                                                             >
//                                                                 {field.value
//                                                                     ? field.value
//                                                                     : "Select date"}
//                                                                 <div className="size-4 text-typo-dark-disable">
//                                                                     <IconCalendar />
//                                                                 </div>
//                                                             </Button>
//                                                         </PopoverTrigger>
//                                                         <PopoverContent
//                                                             className="w-auto overflow-hidden p-0"
//                                                             align="start"
//                                                         >
//                                                             <Calendar
//                                                                 mode="single"
//                                                                 captionLayout="dropdown"
//                                                                 fromYear={1900}
//                                                                 toYear={
//                                                                     new Date().getFullYear() +
//                                                                     30
//                                                                 }
//                                                                 selected={
//                                                                     selectedDate
//                                                                 }
//                                                                 defaultMonth={
//                                                                     selectedDate ||
//                                                                     new Date()
//                                                                 }
//                                                                 onSelect={(
//                                                                     selected
//                                                                 ) => {
//                                                                     const formatted =
//                                                                         formatDateYYYYMMDD(
//                                                                             selected as Date
//                                                                         );
//                                                                     if (
//                                                                         formatted
//                                                                     ) {
//                                                                         field.onChange(
//                                                                             formatted
//                                                                         );
//                                                                         setOpenDistillation(
//                                                                             false
//                                                                         );
//                                                                     }
//                                                                 }}
//                                                             />
//                                                         </PopoverContent>
//                                                     </Popover>
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         );
//                                     }}
//                                 />
//                                 {/*
//                                 <FormField
//                                     control={form.control}
//                                     name="expectedMaturityDate"
//                                     render={({ field }) => {
//                                         // Parse date string (YYYY-MM-DD) to Date object
//                                         const parseDate = (
//                                             dateString?: string
//                                         ): Date | undefined => {
//                                             if (!dateString) return undefined;
//                                             const [year, month, day] =
//                                                 dateString
//                                                     .split("-")
//                                                     .map(Number);
//                                             if (
//                                                 isNaN(year) ||
//                                                 isNaN(month) ||
//                                                 isNaN(day)
//                                             )
//                                                 return undefined;
//                                             return new Date(
//                                                 year,
//                                                 month - 1,
//                                                 day
//                                             );
//                                         };

//                                         const selectedDate = parseDate(
//                                             field.value
//                                         );

//                                         return (
//                                             <FormItem>
//                                                 <FormLabel>
//                                                     Expected Maturity Date
//                                                 </FormLabel>
//                                                 <FormControl>
//                                                     <Popover
//                                                         open={openMaturity}
//                                                         onOpenChange={
//                                                             setOpenMaturity
//                                                         }
//                                                     >
//                                                         <PopoverTrigger asChild>
//                                                             <Button
//                                                                 variant="outline"
//                                                                 className="required h-10 w-full justify-between px-2 text-base font-normal hover:border-bd-sf2 hover:bg-transparent"
//                                                             >
//                                                                 {field.value
//                                                                     ? field.value
//                                                                     : "Select date"}
//                                                                 <div className="size-4 text-typo-dark-disable">
//                                                                     <IconCalendar />
//                                                                 </div>
//                                                             </Button>
//                                                         </PopoverTrigger>
//                                                         <PopoverContent
//                                                             className="w-auto overflow-hidden p-0"
//                                                             align="start"
//                                                         >
//                                                             <Calendar
//                                                                 mode="single"
//                                                                 captionLayout="dropdown"
//                                                                 fromYear={1900}
//                                                                 toYear={
//                                                                     new Date().getFullYear() +
//                                                                     10
//                                                                 }
//                                                                 selected={
//                                                                     selectedDate
//                                                                 }
//                                                                 defaultMonth={
//                                                                     selectedDate ||
//                                                                     new Date()
//                                                                 }
//                                                                 onSelect={(
//                                                                     selected
//                                                                 ) => {
//                                                                     const formatted =
//                                                                         formatDateYYYYMMDD(
//                                                                             selected as Date
//                                                                         );
//                                                                     if (
//                                                                         formatted
//                                                                     ) {
//                                                                         field.onChange(
//                                                                             formatted
//                                                                         );
//                                                                         setOpenMaturity(
//                                                                             false
//                                                                         );
//                                                                     }
//                                                                 }}
//                                                             />
//                                                         </PopoverContent>
//                                                     </Popover>
//                                                 </FormControl>
//                                                 <FormMessage />
//                                             </FormItem>
//                                         );
//                                     }}
//                                 /> */}

//                                 <FormField
//                                     control={form.control}
//                                     name="vintageYear"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>Vintage Year </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     type="number"
//                                                     required
//                                                     placeholder="e.g., 1995"
//                                                     value={field.value ?? ""}
//                                                     onChange={(e) =>
//                                                         field.onChange(
//                                                             e.target.value ===
//                                                                 ""
//                                                                 ? undefined
//                                                                 : Number(
//                                                                     e.target
//                                                                         .value
//                                                                 )
//                                                         )
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="estimatedBottleCount"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>
//                                                 Estimated Bottle Count{" "}
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     type="number"
//                                                     placeholder="e.g., 120"
//                                                     value={field.value ?? ""}
//                                                     onChange={(e) =>
//                                                         field.onChange(
//                                                             e.target.value ===
//                                                                 ""
//                                                                 ? undefined
//                                                                 : Number(
//                                                                     e.target
//                                                                         .value
//                                                                 )
//                                                         )
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="bottleVolume"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>
//                                                 Bottle Volume (ml)
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     type="number"
//                                                     placeholder="e.g., 700"
//                                                     value={field.value ?? ""}
//                                                     onChange={(e) =>
//                                                         field.onChange(
//                                                             e.target.value ===
//                                                                 ""
//                                                                 ? undefined
//                                                                 : Number(
//                                                                     e.target
//                                                                         .value
//                                                                 )
//                                                         )
//                                                     }
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="abv"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>ABV </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     type="text"
//                                                     placeholder="e.g., 43.5"
//                                                     {...field}
//                                                     value={formatNumberToDecimal(
//                                                         field.value?.toString()
//                                                     )}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />

//                                 <FormField
//                                     control={form.control}
//                                     name="rla"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>RLA </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     type="text"
//                                                     placeholder="e.g., 170"
//                                                     {...field}
//                                                     value={formatNumberToDecimal(
//                                                         field.value?.toString()
//                                                     )}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="ola"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel>OLA </FormLabel>
//                                             <FormControl>
//                                                 <Input
//                                                     type="text"
//                                                     placeholder="e.g., 170"
//                                                     {...field}
//                                                     value={formatNumberToDecimal(
//                                                         field.value?.toString()
//                                                     )}
//                                                 />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                                 <FormField
//                                     control={form.control}
//                                     name="priceReference"
//                                     render={({ field }) => (
//                                         <FormItem className="col-span-3">
//                                             <FormLabel>
//                                                 Reference Price{" "}
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <div className="flex items-center gap-2 [&_div]:flex-1">
//                                                     <Input
//                                                         required
//                                                         type="text"
//                                                         prefix="£"
//                                                         placeholder="e.g., 100000"
//                                                         value={
//                                                             Array.isArray(
//                                                                 field.value
//                                                             ) && field.value[0]
//                                                                 ? formatNumberToDecimal(
//                                                                     field.value[0]?.toString()
//                                                                 )
//                                                                 : ""
//                                                         }
//                                                         onChange={(e) => {
//                                                             const value =
//                                                                 e.target.value;

//                                                             const isHaveDot =
//                                                                 value.includes(
//                                                                     "."
//                                                                 );
//                                                             const maxLength =
//                                                                 isHaveDot
//                                                                     ? 13 + 3
//                                                                     : 13;
//                                                             const limitValue =
//                                                                 value.slice(
//                                                                     0,
//                                                                     maxLength
//                                                                 );

//                                                             if (
//                                                                 !isValidDecimal(
//                                                                     value
//                                                                 )
//                                                             ) {
//                                                                 field.onChange([
//                                                                     limitValue,
//                                                                     field
//                                                                         .value?.[1],
//                                                                 ]);
//                                                             }
//                                                         }}
//                                                     />

//                                                     <span className="text-typo-note">
//                                                         -
//                                                     </span>
//                                                     <Input
//                                                         type="text"
//                                                         prefix="£"
//                                                         placeholder="e.g., 120000"
//                                                         value={
//                                                             Array.isArray(
//                                                                 field.value
//                                                             ) && field.value[1]
//                                                                 ? formatNumberToDecimal(
//                                                                     field.value[1]?.toString()
//                                                                 )
//                                                                 : ""
//                                                         }
//                                                         onChange={(e) => {
//                                                             const value =
//                                                                 e.target.value;

//                                                             const isHaveDot =
//                                                                 value.includes(
//                                                                     "."
//                                                                 );
//                                                             const maxLength =
//                                                                 isHaveDot
//                                                                     ? 13 + 3
//                                                                     : 13;
//                                                             const limitValue =
//                                                                 value.slice(
//                                                                     0,
//                                                                     maxLength
//                                                                 );

//                                                             if (
//                                                                 !isValidDecimal(
//                                                                     value
//                                                                 )
//                                                             ) {
//                                                                 field.onChange([
//                                                                     field
//                                                                         .value?.[0],
//                                                                     limitValue,
//                                                                 ]);
//                                                             }
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                         {/* Status */}
//                         <div className="rounded-lg border border-border bg-bg-main">
//                             <div className="border-b border-bd-brown p-6 font-medium">
//                                 Status
//                             </div>
//                             <div className="p-4">
//                                 <FormField
//                                     control={form.control}
//                                     name="isListed"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <RadioGroup
//                                                 className="flex gap-6"
//                                                 value={String(field.value)}
//                                                 onValueChange={(v) =>
//                                                     field.onChange(v === "true")
//                                                 }
//                                             >
//                                                 <div className="flex items-center gap-2">
//                                                     <RadioGroupItem
//                                                         id="status-active"
//                                                         value="true"
//                                                     />
//                                                     <label
//                                                         htmlFor="status-active"
//                                                         className="text-sm"
//                                                     >
//                                                         Active
//                                                     </label>
//                                                 </div>
//                                                 <div className="flex items-center gap-2">
//                                                     <RadioGroupItem
//                                                         id="status-inactive"
//                                                         value="false"
//                                                     />
//                                                     <label
//                                                         htmlFor="status-inactive"
//                                                         className="text-sm"
//                                                     >
//                                                         Inactive
//                                                     </label>
//                                                 </div>
//                                             </RadioGroup>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         {/* Ready To Sell */}
//                         <div className="rounded-lg border border-border bg-bg-main">
//                             <div className="border-b border-bd-brown p-6 font-medium">
//                                 Ready To Sell
//                             </div>
//                             <div className="p-4">
//                                 <FormField
//                                     control={form.control}
//                                     name="readyToSell"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <RadioGroup
//                                                 className="flex gap-6"
//                                                 value={String(field.value)}
//                                                 onValueChange={(v) =>
//                                                     field.onChange(v === "true")
//                                                 }
//                                             >
//                                                 <div className="flex items-center gap-2">
//                                                     <RadioGroupItem
//                                                         id="ready-yes"
//                                                         value="true"
//                                                     />
//                                                     <label
//                                                         htmlFor="ready-yes"
//                                                         className="text-sm"
//                                                     >
//                                                         Yes
//                                                     </label>
//                                                 </div>
//                                                 <div className="flex items-center gap-2">
//                                                     <RadioGroupItem
//                                                         id="ready-no"
//                                                         value="false"
//                                                     />
//                                                     <label
//                                                         htmlFor="ready-no"
//                                                         className="text-sm"
//                                                     >
//                                                         No
//                                                     </label>
//                                                 </div>
//                                             </RadioGroup>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex items-center justify-end gap-3">
//                             <Link href={ROUTE_DASHBOARD.CASK}>
//                                 <Button variant="ghost" type="button">
//                                     Cancel
//                                 </Button>
//                             </Link>
//                             <Button
//                                 type="submit"
//                                 variant="secondary"
//                                 disabled={
//                                     !hasFormChanged || updateMutation.isPending
//                                 }
//                             >
//                                 {updateMutation.isPending
//                                     ? "Saving..."
//                                     : "Save"}
//                             </Button>
//                         </div>
//                     </form>
//                 </Form>
//             )}
//         </div>
//     );
// }

// const CaskEditSkeleton = () => {
//     return (
//         <div className="space-y-6">
//             {/* Basic Information */}
//             <div className="rounded-lg border border-border bg-bg-main">
//                 <div className="border-b border-bd-brown p-4">
//                     <Skeleton className="h-5 w-40" />
//                 </div>
//                 <div className="space-y-6 p-6">
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-24" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-28" />
//                         <Skeleton className="h-32 w-full" />
//                     </div>
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-32" />
//                         <Skeleton className="h-32 w-full" />
//                     </div>
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-28" />
//                         <Skeleton className="h-[18.75rem] w-[18.75rem]" />
//                     </div>
//                 </div>
//             </div>

//             {/* Specifications */}
//             <div className="rounded-lg border border-border bg-bg-main">
//                 <div className="border-b border-bd-brown p-4">
//                     <Skeleton className="h-5 w-32" />
//                 </div>
//                 <div className="grid grid-cols-6 gap-6 p-6 [&>div]:col-span-3">
//                     {/* Distillery */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-28" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Cask Type */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-28" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Region */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-32" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Classification */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-32" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Distillation Date */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-40" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Expected Maturity Date */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-48" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Estimated Bottle Count */}
//                     <div className="space-y-2">
//                         <Skeleton className="h-4 w-44" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* ABV */}
//                     <div className="!col-span-2 space-y-2">
//                         <Skeleton className="h-4 w-20" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* RLA */}
//                     <div className="!col-span-2 space-y-2">
//                         <Skeleton className="h-4 w-16" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* OLA */}
//                     <div className="!col-span-2 space-y-2">
//                         <Skeleton className="h-4 w-20" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                     {/* Cask Reference */}
//                     <div className="!col-span-2 space-y-2">
//                         <Skeleton className="h-4 w-36" />
//                         <Skeleton className="h-10 w-full" />
//                     </div>
//                 </div>
//             </div>

//             {/* Status */}
//             <div className="rounded-lg border border-border bg-bg-main">
//                 <div className="border-b border-bd-brown p-4">
//                     <Skeleton className="h-5 w-24" />
//                 </div>
//                 <div className="p-4">
//                     <div className="flex items-center gap-6">
//                         <div className="flex items-center gap-2">
//                             <Skeleton className="h-4 w-4 rounded-full" />
//                             <Skeleton className="h-4 w-14" />
//                         </div>
//                         <div className="flex items-center gap-2">
//                             <Skeleton className="h-4 w-4 rounded-full" />
//                             <Skeleton className="h-4 w-16" />
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center justify-end gap-3">
//                 <Skeleton className="h-10 w-20" />
//                 <Skeleton className="h-10 w-24" />
//             </div>
//         </div>
//     );
// };
