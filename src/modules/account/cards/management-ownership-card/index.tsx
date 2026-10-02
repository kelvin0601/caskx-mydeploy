import IconDotVrt from "@/components/shared/icons/icon-dot-vrt";
import IconEdit from "@/components/shared/icons/icon-edit";
import IconPlus from "@/components/shared/icons/icon-plus";
import IconTrash from "@/components/shared/icons/icon-trash";
import { InfoRow } from "@/components/shared/info-row";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSubmitAccountForm } from "@/hooks/useAccountMutations";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { formatDateTime, handleGetCardStatusStripePerson } from "@/lib/utils";
import stripeService from "@/services/stripe";
import { KEY_FORM_MAP, useAccountActions } from "@/store";
import { stripe } from "@/types/stripe";
import { useState } from "react";
import { toast } from "sonner";
import { ChangeRepresentativeBanner } from "../change-representative-banner";

type TManagementOwnershipCardProps = {
    persons: stripe.TPerson[];
    onEdit: () => void;
    status: string;
};

function PersonInfo({
    person,
    onUpdate,
    onDelete,
    isDeleting,
}: {
    person: stripe.TPerson;
    onUpdate: () => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const address = [
        person.address.line1,
        person.address.line2,
        person.address.city,
        person.address.state,
        person.address.postal_code,
        person.address.country,
    ]
        .filter(Boolean)
        .join(", ");

    const dobString =
        typeof person.dob === "string"
            ? person.dob
            : person?.dob
              ? `${person.dob.month}/${person.dob.day}/${person.dob.year}`
              : "";

    // Get primary role for the title
    let primaryRole = "";
    if (person.relationship.representative)
        primaryRole = "Account representative";
    else if (person.relationship.owner) primaryRole = "Owner";
    else if (person.relationship.director) primaryRole = "Director";
    else if (person.relationship.executive) primaryRole = "Executive";

    const displayName = primaryRole
        ? `${person.first_name} ${person.last_name} - ${primaryRole}`
        : `${person.first_name} ${person.last_name}`;

    const status = handleGetCardStatusStripePerson(person) as string;
    const isVerified = status === "Complete" || status === "verified";
    const isInvalid = status === "Invalid" || status === "unverified";
    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="person-info" className="border-none">
                <AccordionTrigger className="group h-auto w-full gap-4 py-0">
                    <div className="flex w-full flex-1 items-center justify-between overflow-hidden mb:justify-start mb:gap-2">
                        <div className="flex items-center gap-2 overflow-hidden mb:flex-1">
                            <h4 className="line-clamp-1 max-w-[40ch] truncate text-start text-sm font-semibold text-typo-primary tb:max-w-[30ch] mb:w-full mb:max-w-none">
                                {displayName}
                            </h4>
                            {isVerified && (
                                <Badge variant="success" size="xs">
                                    Verified
                                </Badge>
                            )}
                            {isInvalid && (
                                <Badge variant="destructive" size="xs">
                                    Invalid
                                </Badge>
                            )}
                            {!isVerified && !isInvalid && (
                                <Badge variant="warning" size="xs">
                                    {status || "Pending"}
                                </Badge>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-4 pl-2">
                            {/* Tablet/Desktop Actions */}
                            <div className="flex items-center gap-4 mb:hidden">
                                <Button
                                    variant={"link"}
                                    asChild
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsDeleteDialogOpen(true);
                                    }}
                                >
                                    <span>Delete</span>
                                </Button>

                                <Button
                                    variant={"link"}
                                    asChild
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onUpdate();
                                    }}
                                >
                                    <span>Update</span>
                                </Button>
                            </div>

                            {/* Mobile Actions Dropdown */}
                            <div
                                className="hidden mb:block"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="relative z-10 flex size-6 cursor-pointer items-center justify-center p-0 text-icon-main">
                                            <div className="size-4">
                                                <IconDotVrt />
                                            </div>
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="z-10 w-20 rounded-none border border-bd-main bg-bg-dark-main p-0 shadow-lg mb:min-w-0"
                                    >
                                        <div
                                            className="hover:bg-white/10 flex cursor-pointer items-center justify-between border-b border-bd-main p-2 transition-colors"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Small timeout to allow DropdownMenu to close before opening AlertDialog
                                                setTimeout(
                                                    () =>
                                                        setIsDeleteDialogOpen(
                                                            true
                                                        ),
                                                    0
                                                );
                                            }}
                                        >
                                            <span className="text-xs font-medium text-typo-dark-primary">
                                                Delete
                                            </span>
                                            <div className="size-3 text-typo-dark-primary">
                                                <IconTrash />
                                            </div>
                                        </div>

                                        <div
                                            className="hover:bg-white/10 flex cursor-pointer items-center justify-between rounded-none p-2 text-typo-dark-primary transition-colors"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onUpdate();
                                            }}
                                        >
                                            <span className="text-xs font-medium">
                                                Update
                                            </span>
                                            <div className="size-3">
                                                <IconEdit />
                                            </div>
                                        </div>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                </AccordionTrigger>
                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent
                        isShowClose
                        className="z-[60] max-w-[28rem] gap-8"
                    >
                        <AlertDialogHeader className="space-y-2">
                            <AlertDialogTitle className="mx-auto font-reckless text-xl font-medium text-typo-primary">
                                Delete Member
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-center text-sm font-normal text-typo-soft">
                                Please confirm your decision to remove{" "}
                                <span className="font-semibold text-typo-primary">
                                    {person.first_name} {person.last_name}
                                </span>{" "}
                                from the member list.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="mt-8 flex w-full gap-1 mb:mt-6">
                            <AlertDialogCancel asChild>
                                <Button
                                    variant="outline"
                                    size="xl"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </AlertDialogCancel>
                            <Button
                                variant="action"
                                size="xl"
                                className="flex-1"
                                onClick={() => onDelete(person.id)}
                                disabled={isDeleting}
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                        </div>
                    </AlertDialogContent>
                </AlertDialog>

                <AccordionContent className="pb-0 pt-4">
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4 tb:grid-cols-1">
                            <InfoRow
                                label="Title"
                                value={person.relationship.title || "-"}
                                orientation="vertical"
                                className="flex-1"
                            />
                            <InfoRow
                                label="Date of birth"
                                value={
                                    dobString
                                        ? formatDateTime(dobString).dateOnly
                                        : "-"
                                }
                                orientation="vertical"
                                className="flex-1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 tb:grid-cols-1">
                            <InfoRow
                                label="Email"
                                value={person.email || "-"}
                                orientation="vertical"
                                className="flex-1"
                            />
                            <InfoRow
                                label="Phone"
                                value={person.phone || "-"}
                                orientation="vertical"
                                className="flex-1"
                            />
                        </div>
                        <InfoRow
                            label="Address"
                            value={address || "-"}
                            orientation="vertical"
                        />
                    </div>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export function ManagementOwnershipCard({
    persons,
}: TManagementOwnershipCardProps) {
    const { openModal } = useAccountActions();
    const deletePersonMutation = useSubmitAccountForm<string>(
        (personId) => stripeService.removePerson({ personId }),
        [STRIPE_KEYS.PROFILE],
        { onSuccessMessage: null }
    );

    return (
        <div className="isolate flex flex-col gap-4 border-t border-bd-main pt-8 tb:pt-6">
            <div className="z-[2] flex flex-row items-start justify-between gap-4 tb:items-start tb:gap-4 mb:flex-col">
                <div className="flex flex-col gap-2">
                    <h3 className="font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        Management and ownership
                    </h3>
                    <p className="text-sm font-normal text-typo-soft">
                        Information about company owners, representatives, and
                        authorized individuals
                    </p>
                </div>

                <Button
                    variant="outline-text"
                    className="flex h-auto items-center gap-2 border border-bd-main px-5 py-3 text-sm font-medium text-typo-primary backdrop-blur-[10px] transition-all mb:py-2 mb:pl-4 mb:pr-3"
                    onClick={() => openModal(KEY_FORM_MAP.CREATE_PERSON)}
                >
                    Add person
                    <div className="size-3.5">
                        <IconPlus />
                    </div>
                </Button>
            </div>

            <div className="flex flex-col gap-2">
                <ChangeRepresentativeBanner persons={persons} />

                {persons.map((person) => (
                    <div key={person.id} className="z-[1] bg-bg-sf4 p-4">
                        <PersonInfo
                            person={person}
                            onUpdate={() =>
                                openModal(
                                    KEY_FORM_MAP.MANAGEMENT_DETAILS,
                                    person.id
                                )
                            }
                            onDelete={(id) =>
                                deletePersonMutation.mutate(
                                    { formData: id },
                                    {
                                        onSuccess: () => {
                                            toast.success(
                                                `${person.first_name} ${person.last_name} has been removed from the member list`
                                            );
                                        },
                                    }
                                )
                            }
                            isDeleting={deletePersonMutation.isPending}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
