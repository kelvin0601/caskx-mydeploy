import IconChevonRight from "@/components/shared/icons/icon-chevon-right";
import { SwitchSecurity, TAuthType } from "../item-switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TItemTwoFa = {
    title: string;
    description: string;
    isRecommended?: boolean;
    isActive?: boolean;
    actionSwitch?: (open: boolean) => void;
    type?: TAuthType;
} & React.HTMLAttributes<HTMLDivElement>;

export const ItemTwoFa = (props: TItemTwoFa) => {
    const {
        title,
        description,
        isRecommended = false,
        isActive = false,
        actionSwitch,
        type,
        ...rest
    } = props;

    return (
        <div
            {...rest}
            className={cn(
                "cursor-pointer overflow-hidden border border-bd-main bg-bg-main p-4 transition-all hover:bg-bg-sf2 hover:shadow-[0_0.1875rem_0.5rem_0_rgba(23,0,0,0.10),0_0.25rem_0.375rem_0_rgba(15,0,0,0.10)]"
            )}
        >
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                        <div className="text-sm font-semibold text-typo-primary">
                            {title}
                        </div>
                        {isRecommended && (
                            <Badge
                                variant="success"
                                className="border-none bg-bg-sf3"
                            >
                                Recommended
                            </Badge>
                        )}
                    </div>
                    <div className="text-sm text-typo-soft">{description}</div>
                </div>
                {isActive ? (
                    <div>
                        <SwitchSecurity
                            checked={isActive}
                            actionSwitch={actionSwitch}
                            type={type}
                        />
                    </div>
                ) : (
                    <div className="h-5 w-5 flex-shrink-0 text-typo-soft">
                        <IconChevonRight />
                    </div>
                )}
            </div>
        </div>
    );
};
