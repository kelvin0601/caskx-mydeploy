import IconPlus from "@/components/shared/icons/icon-plus";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSubmitAccountForm } from "@/hooks/useAccountMutations";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { cn } from "@/lib/utils";
import stripeService from "@/services/stripe";
import { KEY_FORM_MAP, useAccount, useAccountActions } from "@/store";
import { stripe } from "@/types/stripe";
import { useState } from "react";

export function ChangeRepresentativeBanner({
    persons,
}: {
    persons: stripe.TPerson[];
}) {
    const { openModal } = useAccountActions();
    const { profile } = useAccount();
    const isMobile = useIsMobile();
    const isCompany = profile?.businessType === "company";
    const [isSelectRepOpen, setIsSelectRepOpen] = useState(false);
    const [selectedRepId, setSelectedRepId] = useState<string | null>(null);

    const changeRepMutation = useSubmitAccountForm<{
        personId: string;
        oldPersonId: string;
        accountId: string;
    }>(
        (data) => stripeService.changeRepresentativeCompany(data),
        [STRIPE_KEYS.PROFILE]
    );

    const currentRep = persons.find((p) => p.relationship.representative);

    if (!isCompany) return null;

    return (
        <div className="flex items-center justify-between gap-8 bg-bg-sf4 p-4 mb:flex-col mb:items-start mb:gap-4">
            <div className="flex flex-col gap-1">
                <p className="text-base font-semibold text-typo-primary mb:text-sm">
                    Change account representative
                </p>
                <p className="text-sm font-normal text-typo-note">
                    Add or select a person authorized to represent your
                    organization. This may require additional verification
                </p>
            </div>

            <Popover open={isSelectRepOpen} onOpenChange={setIsSelectRepOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline-text"
                        className={cn(
                            "flex h-auto items-center justify-center rounded-none border-bd-main px-5 py-3 text-sm font-medium transition-all mb:w-max mb:px-4 mb:py-2",
                            isSelectRepOpen
                                ? "border-bd-main bg-bg-dark-main text-typo-dark-primary"
                                : "text-typo-primary"
                        )}
                    >
                        Select
                    </Button>
                </PopoverTrigger>

                <PopoverContent
                    align={isMobile ? "start" : "end"}
                    className={cn(
                        "z-10 flex w-[15.875rem] flex-col items-start justify-center gap-2 overflow-clip rounded-none border border-bd-main bg-bg-main px-0 pb-2 pt-4 shadow-[0px_3px_8px_0px_rgba(23,0,0,0.1),0px_4px_6px_0px_rgba(15,0,0,0.1)]",
                        !persons.length && "pb-4"
                    )}
                >
                    <div className="w-full px-4">
                        <Button
                            variant="outline-text"
                            className={cn(
                                "flex w-full items-center justify-center gap-2 border border-bd-main py-3 pl-5 pr-4 backdrop-blur-[10px] transition-colors mb:gap-1 mb:py-2"
                            )}
                            onClick={() => {
                                setIsSelectRepOpen(false);
                                openModal(KEY_FORM_MAP.CREATE_PERSON);
                            }}
                        >
                            <p className="whitespace-nowrap text-sm font-medium capitalize leading-none">
                                Add new person
                            </p>
                            <div className="relative size-3.5 shrink-0">
                                <IconPlus />
                            </div>
                        </Button>
                    </div>
                    {!!persons.length && (
                        <div className="flex w-full flex-col items-start px-2">
                            {persons.map((p) => {
                                const isCurrent = p.id === currentRep?.id;
                                const isChanging =
                                    changeRepMutation.isPending &&
                                    selectedRepId === p.id;
                                return (
                                    <div
                                        key={p.id}
                                        className={cn(
                                            "relative flex w-full items-center justify-between p-2 transition-colors",
                                            isCurrent
                                                ? "bg-bg-sf2"
                                                : "cursor-pointer hover:bg-bg-sf2",
                                            isChanging &&
                                                "pointer-events-none opacity-50"
                                        )}
                                        onClick={() => {
                                            if (
                                                isCurrent ||
                                                changeRepMutation.isPending
                                            )
                                                return;
                                            setSelectedRepId(p.id);
                                            changeRepMutation.mutate({
                                                formData: {
                                                    personId: p.id,
                                                    oldPersonId:
                                                        currentRep?.id || "",
                                                    accountId:
                                                        profile?.id || "",
                                                },
                                            });
                                        }}
                                    >
                                        <p className="min-w-px flex-[1_0_0] truncate text-sm font-normal leading-[1.5] text-typo-primary">
                                            {p.first_name} {p.last_name}
                                        </p>
                                        {isChanging ? (
                                            <p className="animate-pulse whitespace-nowrap pl-2 text-xs font-normal leading-[1.2] text-typo-soft">
                                                Saving...
                                            </p>
                                        ) : isCurrent ? (
                                            <p className="whitespace-nowrap pl-2 text-xs font-normal leading-[1.2] text-typo-soft">
                                                Current
                                            </p>
                                        ) : null}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
