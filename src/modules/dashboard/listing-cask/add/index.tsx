// "use client";

// import IconCalendar from "@/components/shared/icons/icon-calendar";
// import IconHelp from "@/components/shared/icons/icon-help";
// import CustomTooltip from "@/components/shared/tooltips-custom";
// import { Button } from "@/components/ui/button";
// import { Calendar } from "@/components/ui/calendar";
// import { FormImageUpload } from "@/components/shared/form-image-upload";
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
// import { Textarea } from "@/components/ui/textarea";
// import { setFormErrors } from "@/helpers";
// import {
//     CASK_KEYS,
//     DISTILLERY_KEYS,
//     FILTER_KEYS,
//     PATH_CLASSIFICATION,
//     PATH_META_DATA_CASK,
//     PATH_REGIONS,
//     ROUTE_DASHBOARD,
// } from "@/lib/constants";
// import caskServices from "@/services/cask";
// import classificationsServices from "@/services/classifications";
// import distilleriesServices from "@/services/distilleries";
// import regionsServices from "@/services/region";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import Link from "next/link";
// import React, { useMemo, useRef } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "sonner";
// import { VirtualizedCombobox } from "@/components/ui/virtualized-combobox";
// import { useRouter } from "next/navigation";
// import IconChevonRight from "@/components/shared/icons/icon-chevon-right";
// import {
//     cn,
//     formatNumberToDecimal,
//     formatNumberToNumber,
//     isValidDecimal,
// } from "@/lib/utils";
// import { caskFormSchema } from "@/lib/validators";
// import { z } from "zod";

// const initialValues: Partial<FormValues> = {
//     name: "",
//     distilleryId: undefined,
//     caskTypeId: "",
//     description: "",
//     tastingNotes: "",
//     image: "",
//     regionId: "",
//     classification: "",
//     distillationDate: undefined,
//     // expectedMaturityDate: "",
//     estimatedBottleCount: undefined,
//     vintageYear: undefined,
//     bottleVolume: undefined,
//     ola: undefined,
//     abv: undefined,
//     rla: undefined,
//     isListed: true,
//     readyToSell: false,
//     priceReference: [],
// };

// type FormValues = z.infer<typeof caskFormSchema>;

// export default function CaskAddModule() {
//     const router = useRouter();
//     const queryClient = useQueryClient();
//     const [openDistillation, setOpenDistillation] = React.useState(false);
//     const [openMaturity, setOpenMaturity] = React.useState(false);
//     const [imageUploadKey, setImageUploadKey] = React.useState(0);
//     const imageFileRef = useRef<File | null>(null);
//     const formatDateYYYYMMDD = (date?: Date) => {
//         if (!date || !(date instanceof Date) || isNaN(date.getTime()))
//             return "";
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, "0");
//         const day = String(date.getDate()).padStart(2, "0");
//         return `${year}-${month}-${day}`;
//     };
//     const form = useForm<FormValues>({
//         resolver: zodResolver(caskFormSchema),
//         defaultValues: initialValues,
//     });

//     const onSubmit = async (values: FormValues) => {
//         if (values.estimatedBottleCount !== undefined) {
//             values.estimatedBottleCount = formatNumberToNumber(
//                 values.estimatedBottleCount?.toString() || ""
//             );
//         }
//         if (values.abv) {
//             values.abv = formatNumberToNumber(
//                 values.abv?.toString() || ""
//             ).toString();
//         }
//         if (values.rla) {
//             values.rla = formatNumberToNumber(
//                 values.rla?.toString() || ""
//             ).toString();
//         }
//         if (values.ola) {
//             values.ola = formatNumberToNumber(
//                 values.ola?.toString() || ""
//             ).toString();
//         }
//         try {
//             const dataToSubmit: Record<string, unknown> = { ...values };
//             console.log("dataToSubmit", dataToSubmit);
//             // If there's a new image file, set it as File object for service to handle
//             if (imageFileRef.current) {
//                 dataToSubmit.image = imageFileRef.current;
//             } else if (
//                 typeof values.image === "string" &&
//                 values.image?.startsWith("blob:")
//             ) {
//                 // If it's a blob URL but no file ref, remove it (shouldn't happen, but handle gracefully)
//                 delete dataToSubmit.image;
//             } else if (!values.image) {
//                 dataToSubmit.image = "";
//             }
//             // Convert priceReference array to referencePriceMin and referencePriceMax
//             if (
//                 dataToSubmit?.priceReference &&
//                 Array.isArray(dataToSubmit.priceReference)
//             ) {
//                 (dataToSubmit as Record<string, unknown>).referencePriceMin =
//                     dataToSubmit.priceReference[0];
//                 (dataToSubmit as Record<string, unknown>).referencePriceMax =
//                     dataToSubmit.priceReference[1];
//                 delete (dataToSubmit as Record<string, unknown>).priceReference;
//             }
//             await caskServices.createCask(dataToSubmit);
//             toast.success("Cask created successfully");

//             // Clear the image file ref and reset form
//             imageFileRef.current = null;
//             form.reset(initialValues);
//             // Explicitly reset image field to ensure FormImageUpload clears
//             form.setValue("image", "");
//             // Force re-render FormImageUpload by changing key
//             setImageUploadKey((prev) => prev + 1);

//             // Invalidate cask listing queries to refresh the list
//             queryClient.invalidateQueries({
//                 queryKey: [CASK_KEYS.LISTING_PAGE],
//             });
//         } catch (error) {
//             setFormErrors(error, form, { capitalizeFirstLetter: false });
//         }
//     };
//     const distilleriesQuery = useQuery({
//         queryKey: [DISTILLERY_KEYS.LISTING, "add"],
//         queryFn: () => distilleriesServices.getDistillery("page=1&limit=1000"),
//     });
//     const caskTypesQuery = useQuery({
//         queryKey: [FILTER_KEYS.CASK_TYPE, "add"],
//         queryFn: () => caskServices.getCaskTypes("page=1&size=1000"),
//     });
//     const classificationsQuery = useQuery({
//         queryKey: [PATH_META_DATA_CASK, PATH_CLASSIFICATION, "add"],
//         queryFn: () => classificationsServices.getClassification(),
//     });
//     const regionsQuery = useQuery({
//         queryKey: [PATH_REGIONS, "add"],
//         queryFn: () => regionsServices.getRegions(),
//     });

//     const distilleriesOptions = useMemo(() => {
//         return (
//             distilleriesQuery.data?.map((distillery) => ({
//                 value: distillery.id,
//                 label: distillery.name,
//             })) || []
//         );
//     }, [distilleriesQuery.data]);
//     const caskTypesOptions = useMemo(() => {
//         return (
//             caskTypesQuery.data?.caskTypes?.map((caskType) => ({
//                 value: caskType.id,
//                 label: caskType.name,
//             })) || []
//         );
//     }, [caskTypesQuery.data]);
//     const regionsOptions = useMemo(() => {
//         return (
//             regionsQuery.data?.map((region) => ({
//                 value: String(region.id),
//                 label: region.name,
//             })) || []
//         );
//     }, [regionsQuery.data]);
//     const classificationsOptions = useMemo(() => {
//         return (
//             classificationsQuery.data?.classifications?.map(
//                 (classification) => ({
//                     value: String(classification.value),
//                     label: classification.label,
//                 })
//             ) || []
//         );
//     }, [classificationsQuery.data]);

//     return (
//         <div className="mx-auto w-full">
//             <div className="mb-6 flex items-center justify-between">
//                 <h1 className="m-0 text-xl font-semibold text-typo-primary">
//                     New Cask
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
//                     <span className="text-typo-primary">New cask</span>
//                 </div>
//             </div>

//             <Form {...form}>
//                 <form
//                     onSubmit={form.handleSubmit(onSubmit)}
//                     className="space-y-6"
//                 >
//                     <>
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
//                                                 key={imageUploadKey}
//                                                 label="Cask Image"
//                                                 required
//                                                 form={form}
//                                                 fieldName="image"
//                                                 accept={{
//                                                     "image/*": [".png", ".jpg"],
//                                                 }}
//                                                 helperText="800 x 800px"
//                                                 placeholder="Click to upload"
//                                                 defaultValue={
//                                                     field.value
//                                                         ? [
//                                                               field.value as string,
//                                                           ]
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
//                                             <FormLabel>
//                                                 Distillery{" "}
//                                                 <span
//                                                     className={cn(
//                                                         "text-brand",
//                                                         form.formState.errors
//                                                             .distillationDate
//                                                             ? "text-error"
//                                                             : ""
//                                                     )}
//                                                 >
//                                                     *
//                                                 </span>
//                                             </FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     options={
//                                                         distilleriesOptions
//                                                     }
//                                                     className="font-normal"
//                                                     searchPlaceholder="Select a distillery"
//                                                     value={field.value}
//                                                     onValueChange={
//                                                         field.onChange
//                                                     }
//                                                     disabled={
//                                                         distilleriesQuery.isLoading
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
//                                                     options={caskTypesOptions}
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
//                                             <FormLabel>Region </FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     className="font-normal"
//                                                     required
//                                                     options={regionsOptions}
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
//                                             <FormLabel>Category </FormLabel>
//                                             <FormControl>
//                                                 <VirtualizedCombobox
//                                                     className="font-normal"
//                                                     required
//                                                     options={
//                                                         classificationsOptions
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
//                                                                 className={cn(
//                                                                     "h-10 w-full justify-between px-2 text-base font-normal focus-within:border-2 focus-within:border-brand hover:border-bd-sf2 hover:bg-transparent focus:border-2 focus-visible:border-2",
//                                                                     field.value
//                                                                         ? "text-typo-primary"
//                                                                         : "text-typo-disable",
//                                                                     form
//                                                                         .formState
//                                                                         .errors
//                                                                         .distillationDate
//                                                                         ? "!border-error outline-error !ring-error focus-within:border-2 hover:ring-error-darker focus:border-2 focus-visible:border-2"
//                                                                         : ""
//                                                                 )}
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
//                                                                     selectedDate as unknown as Date
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
//                                                                       e.target
//                                                                           .value
//                                                                   )
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
//                                                                       e.target
//                                                                           .value
//                                                                   )
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
//                                                                       e.target
//                                                                           .value
//                                                                   )
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
//                                                     placeholder="e.g.,   170"
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
//                                                                       field.value[0]?.toString()
//                                                                   )
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
//                                                                       field.value[1]?.toString()
//                                                                   )
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
//                                 Ready To Sell{" "}
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
//                                 disabled={form.formState.isSubmitting}
//                             >
//                                 Save
//                             </Button>
//                         </div>
//                     </>
//                 </form>
//             </Form>
//         </div>
//     );
// }
