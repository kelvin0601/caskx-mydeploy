import IconCalendar from "@/components/shared/icons/icon-calendar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormField,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useStatesQuery } from "@/hooks/useLocationQuery";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import {
    cn,
    formatDateTime,
    handleGetCardStatusStripePerson,
} from "@/lib/utils";
import { useAccount } from "@/store";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as RPNInput from "react-phone-number-input";
import { AccountFormWrapper } from "./account-form-wrapper";
import { createPersonSchema, type CreatePersonFormValues } from "./schemas";
import { CountrySelect, RelationshipSelect, StateSelect } from "./utils";

export default function PersonForm({
    data,
    onSubmit,
    onClose,
    isSubmitting,
    isEditMode = false,
}: {
    data?: Partial<CreatePersonFormValues>;
    onSubmit: (data: CreatePersonFormValues) => void;
    onClose: () => void;
    isSubmitting: boolean;
    isEditMode?: boolean;
}) {
    const [openDob, setOpenDob] = useState(false);
    const router = useRouter();
    const { personCurrentId, persons } = useAccount();
    const personCurrent = persons.find((p) => p.id === personCurrentId);
    const hasUnverifiedPerson = personCurrent
        ? handleGetCardStatusStripePerson(personCurrent) !== "Complete"
        : false;

    const form = useForm<CreatePersonFormValues>({
        resolver: zodResolver(createPersonSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            firstName: data?.firstName || "",
            lastName: data?.lastName || "",
            email: data?.email || "",
            phone: data?.phone || "",
            dateOfBirth: data?.dateOfBirth || "",
            ssnLast4: data?.ssnLast4 || "",
            addressLine1: data?.addressLine1 || "",
            addressLine2: data?.addressLine2 || "",
            city: data?.city || "",
            state: data?.state || "",
            postalCode: data?.postalCode || "",
            country: data?.country || "",
            relationshipRepresentative:
                data?.relationshipRepresentative || false,
            relationshipExecutive: data?.relationshipExecutive || false,
            relationshipDirector: data?.relationshipDirector || false,
            relationshipOwner: data?.relationshipOwner || false,
            relationshipPercentOwnership:
                data?.relationshipPercentOwnership || undefined,
            relationshipTitle: data?.relationshipTitle || "",
        },
    });

    const { handleSubmit, control, formState, setValue, watch } = form;

    const [selectedCountryName, setSelectedCountryName] = useState("");
    const selectedCountry = watch("country");

    const { data: states = [], isLoading: loadingStates } =
        useStatesQuery(selectedCountryName);

    const regionNames = useMemo(
        () => new Intl.DisplayNames(["en"], { type: "region" }),
        []
    );

    const [countries, setCountries] = useState<
        { code: string; name: string }[]
    >([]);
    const [loadingCountries, setLoadingCountries] = useState(true);

    useEffect(() => {
        const countryList = RPNInput.getCountries().map((code) => ({
            code,
            name: regionNames.of(code) || code,
        }));
        setCountries(countryList);
        setLoadingCountries(false);
    }, [regionNames]);

    useEffect(() => {
        if (selectedCountry) {
            const found = countries.find((c) => c.code === selectedCountry);
            if (found && selectedCountryName !== found.name) {
                setSelectedCountryName(found.name);
            }
        }
    }, [countries, selectedCountry, selectedCountryName]);

    return (
        <Form {...form}>
            <form
                onSubmit={handleSubmit(onSubmit)}
                id={isEditMode ? "edit-person" : "create-person"}
            >
                <AccountFormWrapper
                    onClose={onClose}
                    isSubmitting={isSubmitting}
                    isValid={formState.isValid}
                    submitLabel={isEditMode ? "Save Changes" : "Add"}
                    submittingLabel={isEditMode ? "Saving…" : "Adding…"}
                >
                    <div className="grid grid-cols-2 !gap-x-2 gap-y-4 tb:grid-cols-1">
                        <div className="col-span-full grid grid-cols-2 !gap-x-2">
                            <FormField
                                name="firstName"
                                control={control}
                                render={({ field }) => (
                                    <div className="col-span-[0.5] space-y-1.5">
                                        <Label htmlFor="firstName">
                                            First Name
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="firstName"
                                                placeholder="Ex: John"
                                                autoComplete="given-name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="lastName"
                                control={control}
                                render={({ field }) => (
                                    <div className="col-span-[0.5] space-y-1.5">
                                        <Label htmlFor="lastName">
                                            Last Name
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="lastName"
                                                placeholder="Ex: Doe"
                                                autoComplete="family-name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>
                        <div className="col-span-2 space-y-1.5 tb:col-span-1">
                            <Label>Relationship</Label>
                            <RelationshipSelect
                                selectedRoles={
                                    [
                                        watch("relationshipRepresentative") &&
                                            "representative",
                                        watch("relationshipExecutive") &&
                                            "executive",
                                        watch("relationshipDirector") &&
                                            "director",
                                        watch("relationshipOwner") && "owner",
                                    ].filter(Boolean) as string[]
                                }
                                onRolesChange={(roles) => {
                                    setValue(
                                        "relationshipRepresentative",
                                        roles.includes("representative")
                                    );
                                    setValue(
                                        "relationshipExecutive",
                                        roles.includes("executive")
                                    );
                                    setValue(
                                        "relationshipDirector",
                                        roles.includes("director")
                                    );
                                    setValue(
                                        "relationshipOwner",
                                        roles.includes("owner")
                                    );
                                }}
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-2 !gap-x-2 gap-y-4 tb:col-span-1">
                            <FormField
                                name="relationshipPercentOwnership"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="relationshipPercentOwnership">
                                            % Ownership
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="relationshipPercentOwnership"
                                                type="number"
                                                placeholder="Ex: 25"
                                                value={field.value ?? ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value === ""
                                                            ? undefined
                                                            : Number(
                                                                  e.target.value
                                                              )
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="relationshipTitle"
                                control={control}
                                render={({ field }) => (
                                    <div className={cn("space-y-1.5")}>
                                        <Label htmlFor="relationshipTitle">
                                            Title (optional)
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="relationshipTitle"
                                                placeholder="Ex: CEO"
                                                autoComplete="organization-title"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="col-span-2 grid grid-cols-2 !gap-x-2 gap-y-4 tb:col-span-1">
                            <FormField
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email">Email</Label>
                                        <FormControl>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Ex: johndoe@gmail.com"
                                                autoComplete="email"
                                                spellCheck={false}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone">
                                            Support phone
                                        </Label>
                                        <FormControl>
                                            <PhoneInput
                                                id="phone"
                                                defaultCountry="US"
                                                international={true}
                                                placeholder="e.g. +12012311231"
                                                autoComplete="tel"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 !gap-x-2 gap-y-4 tb:col-span-1">
                            <FormField
                                name="dateOfBirth"
                                control={control}
                                render={({ field }) => {
                                    const selectedDate = field.value;
                                    return (
                                        <div className="space-y-1.5">
                                            <Label>Date of birth</Label>
                                            <FormControl>
                                                <Popover
                                                    open={openDob}
                                                    onOpenChange={setOpenDob}
                                                >
                                                    <PopoverTrigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            className="flex h-12 w-full items-center justify-between border border-transparent bg-bg-sf4 px-4 py-2 font-normal hover:border-bd-main hover:bg-transparent focus-visible:border-bd-brown data-[state=open]:border-bd-main data-[state=open]:bg-transparent mb:h-10"
                                                        >
                                                            {selectedDate ? (
                                                                selectedDate
                                                                    .split("-")
                                                                    .reverse()
                                                                    .join("/")
                                                            ) : (
                                                                <span className="opacity-40">
                                                                    Select date
                                                                </span>
                                                            )}
                                                            <div className="size-4 text-icon-main">
                                                                <IconCalendar />
                                                            </div>
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent
                                                        className="z-[60] w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            captionLayout="dropdown"
                                                            fromYear={1900}
                                                            toYear={new Date().getFullYear()}
                                                            selected={
                                                                field.value
                                                                    ? new Date(
                                                                          field.value
                                                                      )
                                                                    : undefined
                                                            }
                                                            onSelect={(
                                                                selected
                                                            ) => {
                                                                const formatted =
                                                                    formatDateTime(
                                                                        selected
                                                                    )?.formatDateYYYYMMDD;
                                                                if (formatted) {
                                                                    field.onChange(
                                                                        formatted
                                                                    );
                                                                    setOpenDob(
                                                                        false
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </FormControl>
                                            <FormMessage />
                                        </div>
                                    );
                                }}
                            />
                            <FormField
                                name="ssnLast4"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="ssnLast4">
                                            SSN Last 4 Digits (Optional)
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="ssnLast4"
                                                maxLength={4}
                                                inputMode="numeric"
                                                placeholder="Enter"
                                                autoComplete="off"
                                                spellCheck={false}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>

                        <FormField
                            name="addressLine1"
                            control={control}
                            render={({ field }) => (
                                <div className="col-span-2 space-y-1.5 tb:col-span-1">
                                    <Label htmlFor="addressLine1">
                                        Address 1
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="addressLine1"
                                            autoComplete="address-line1"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <FormField
                            name="addressLine2"
                            control={control}
                            render={({ field }) => (
                                <div className="col-span-2 space-y-1.5 tb:col-span-1">
                                    <Label htmlFor="addressLine2">
                                        Address 2
                                    </Label>
                                    <FormControl>
                                        <Input
                                            id="addressLine2"
                                            placeholder="Enter"
                                            autoComplete="address-line2"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </div>
                            )}
                        />
                        <div className="col-span-2 grid grid-cols-2 !gap-x-2 gap-y-4 tb:col-span-1">
                            <FormField
                                name="country"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="country">Country</Label>
                                        <FormControl>
                                            <CountrySelect
                                                value={field.value}
                                                onValueChange={(value) => {
                                                    field.onChange(value);
                                                    setValue("state", "");
                                                }}
                                                items={countries}
                                                loading={loadingCountries}
                                                regionNames={regionNames}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="state">
                                            State/Province
                                        </Label>
                                        <FormControl>
                                            <StateSelect
                                                value={field.value}
                                                onValueChange={field.onChange}
                                                countryName={
                                                    selectedCountryName
                                                }
                                                disabled={!selectedCountry}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="city">City</Label>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter"
                                                id="city"
                                                autoComplete="address-level2"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                            <FormField
                                name="postalCode"
                                control={control}
                                render={({ field }) => (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="postalCode">
                                            Postal code
                                        </Label>
                                        <FormControl>
                                            <Input
                                                id="postalCode"
                                                placeholder="Enter"
                                                autoComplete="postal-code"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </div>
                                )}
                            />
                        </div>

                        {isEditMode && (
                            <div className="col-span-2 flex flex-col gap-3 tb:col-span-1">
                                <Label>ID Verification</Label>
                                <Button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            ROUTE_PUBLIC.STRIPE_ONBOARDING
                                        )
                                    }
                                    variant="outline"
                                    className="w-max gap-2 rounded-none border border-bd-main px-4 py-2 hover:bg-bg-sf4"
                                >
                                    Upload file
                                    <UploadIcon className="size-3" />
                                </Button>
                                {hasUnverifiedPerson && (
                                    <p className="mt-1 text-xs font-medium text-error">
                                        Your ID verification is not complete.
                                        Please upload your documents to finish
                                        onboarding.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </AccountFormWrapper>
            </form>
        </Form>
    );
}

export type { CreatePersonFormValues } from "./schemas";
