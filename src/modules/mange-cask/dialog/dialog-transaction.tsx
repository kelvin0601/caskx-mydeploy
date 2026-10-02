import IconDownload from "@/components/shared/icons/icon-download";
import IconNavArrow from "@/components/shared/icons/icon-nav-arrow";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ETransactionOnGoingStatus } from "@/enum/transaction";
import { MAPPING_COLOR_STATUS, ROUTE_PUBLIC } from "@/lib/constants";
import {
    formatDateTime,
    handleCamelCaseToSnakeCase,
    downloadFile,
} from "@/lib/utils";
import { useMemo } from "react";
import { toast } from "sonner";
import { useManageCask } from "../provider";
import { transaction } from "@/types/transaction";
import { ScrollArea } from "@/components/ui/scroll-area";

type IconConfig = {
    icon: React.ReactNode;
    action?: () => void;
};

const getIconConfig = (
    status: string,
    transactionId: string,
    checkoutSessionId: string,
    type: "bid" | "ask",
    sellerId: string
): IconConfig | null => {
    const normalizedStatus = handleCamelCaseToSnakeCase(status);
    if (
        normalizedStatus ===
        ETransactionOnGoingStatus.OWNERSHIP_TRANSFER.toLowerCase()
    ) {
        return {
            icon: <IconDownload />,
        };
    }

    return {
        icon: <IconNavArrow />,
        action: () => {
            if (!transactionId) {
                toast.error("No transaction found");
                return;
            }
            const PATH_NAVIGATE =
                type === "bid"
                    ? `${ROUTE_PUBLIC.CHECKOUT}/${checkoutSessionId}/${handleCamelCaseToSnakeCase(status.toLowerCase())}`
                    : `${ROUTE_PUBLIC.PAYOUT}/${sellerId}?transactionId=${transactionId}`;
            downloadFile(`${PATH_NAVIGATE}`);
        },
    };
};

export default function DialogTransaction() {
    const { dialogData } = useManageCask();
    const { caskName, transactions } = dialogData;
    const transactionsWithIcons = useMemo(() => {
        const transactionMap = new Map<
            string,
            transaction.TTransaction & { iconConfig: IconConfig }
        >();
        transactions?.forEach((item) => {
            const iconConfig = getIconConfig(
                item.status,
                item.transactionId,
                item.checkoutSessionId,
                dialogData.type as "bid" | "ask",
                dialogData.id as string
            );
            if (iconConfig) {
                transactionMap.set(item.transactionId, { ...item, iconConfig });
            }
        });
        return Array.from(transactionMap.values());
    }, [transactions]);

    const type = dialogData.type as "bid" | "ask";
    if (!transactions || transactions.length === 0) {
        return null;
    }
    return (
        <DialogContent className="flex w-[32.5rem] flex-col gap-6 p-8">
            <DialogHeader className="pb-0">
                <DialogTitle>{caskName}</DialogTitle>
                <DialogDescription className="!mt-6 text-center">
                    {dialogData.content}
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="-mx-4 max-h-48 w-auto px-4">
                <div className="flex flex-col justify-center gap-4">
                    {transactionsWithIcons?.map((item) => {
                        const statusKey =
                            item.status as keyof typeof MAPPING_COLOR_STATUS;
                        const badgeVariant = MAPPING_COLOR_STATUS[statusKey];
                        return (
                            <Card key={item.transactionId} className="p-4">
                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-col gap-2">
                                        <Badge
                                            className="w-max"
                                            variant={badgeVariant}
                                        >
                                            {item.status?.split("_").join(" ")}
                                        </Badge>
                                        <div className="text-sm text-typo-soft">
                                            {type === "bid"
                                                ? item.checkoutSessionId
                                                : item.transactionId}
                                        </div>
                                        <div className="text-sm text-typo-soft">
                                            {
                                                formatDateTime(item.createdAt)
                                                    .dataOnlyNumber
                                            }
                                        </div>
                                    </div>
                                    {item.iconConfig && (
                                        <div
                                            className="h-max cursor-pointer rounded-sm p-1.5 text-typo-note transition-all hover:bg-bg-sf1 hover:text-typo-primary"
                                            onClick={item.iconConfig.action}
                                        >
                                            <div className="h-4 w-4">
                                                {item.iconConfig.icon}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </ScrollArea>
        </DialogContent>
    );
}
