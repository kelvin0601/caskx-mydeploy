import {
    BidControls,
    TWarningType,
} from "@/components/shared/cask-card-quantity-controls";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS } from "@/lib/constants/key";
import { formatCurrency } from "@/lib/utils";
import caskServices from "@/services/cask";
import { caskBidService } from "@/services/cask-bid";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useManageCask } from "../provider";
import useOrderCalculation from "@/modules/market-orders/hooks/use-order-calculation";

export default function UpdateBid({ id }: { id: string }) {
    const { setSidebarCurrent } = useManageCask();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
        fetchFn: () => caskServices.getDetailCask(id),
    });

    const validatePriceMutation = useMutation({
        mutationFn: (data: { caskId: number | string; bidAmount: number }) => {
            return caskBidService.validatePriceBid(data);
        },
    });
    const handleValidatePrice = async (
        price: number,
        cb?: (message: string, warningType?: TWarningType) => void
    ) => {
        if (!caskDetail?.id) {
            cb?.("Cask detail not available", "warning");
            return;
        }

        const { message, warningType } =
            await validatePriceMutation.mutateAsync({
                caskId: caskDetail.id,
                bidAmount: price,
            });
        if (message && warningType !== "none") {
            cb?.(message);
        } else {
            cb?.("");
        }
    };

    return (
        <div className="flex h-full flex-col pt-4">
            <div className="flex flex-col gap-4">
                <BidControls
                    data={{
                        ...(caskDetail as cask.TCask),
                        name: `${caskDetail?.master?.name} - ${caskDetail?.name}`,
                    }}
                    onValidatePrice={handleValidatePrice}
                    priceBid={caskDetail?.lowestAsk || 0}
                    setSidebarCurrent={setSidebarCurrent}
                />
            </div>
        </div>
    );
}

export const UpdateBidFooter = ({ id }: { id: string }) => {
    const { discountSelected, quantity, priceCaskCurrent } = useCheckout();
    const { setSidebarCurrent } = useManageCask();
    const { bidCalQuery } = useOrderCalculation({
        bidData: {
            price: priceCaskCurrent,
            quantity: quantity,
            discountCode: discountSelected?.discountCode?.code,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
    });
    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        bidCalQuery.data || {};

    const dataRender = {
        subTotal: {
            label: "Bid Price",
            value: () => formatCurrency(subtotal || 0),
        },
        processingFee: {
            label: `Processing Fee (${processingFeePercent || 0}%)`,
            value: () => `${formatCurrency(processingFeeAmount || 0)}`,
        },
    } as const;
    const isPassNextStep = priceCaskCurrent > 0;

    return (
        <div className="sticky bottom-0 w-full bg-bg-sf1 p-6">
            <Accordion type="single" collapsible>
                <AccordionItem value="subtotal" className="border-none">
                    <AccordionTrigger
                        classNameChevron="w-5 h-5"
                        className="!w-max items-center !justify-start gap-2 pb-1 pt-0 [&>svg]:-rotate-180 [&[data-state=open]>svg]:rotate-0"
                    >
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-base font-medium text-typo-soft">
                                Subtotal
                            </span>
                            <span className="text-xl font-semibold text-typo-soft tb:text-lg">
                                {formatCurrency(totalAmount || 0)}
                            </span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 pt-3">
                        <Table>
                            {Object.entries(dataRender).map(
                                ([key, content]) => (
                                    <TableBody
                                        key={key}
                                        className="w-full border-y border-solid border-bd-brown [&:not(:last-child)]:border-b-0"
                                    >
                                        <TableRow className="grid-cols-2">
                                            <TableCell className="text-sm font-medium text-typo-primary">
                                                {content.label}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-typo-soft">
                                                {content.value?.()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )
                            )}
                        </Table>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
            <div className="inline w-full items-center gap-1 text-sm text-typo-soft">
                The subtotal may vary depending on market conditions, and the
                final price will be calculated at checkout.
            </div>
            <Button
                disabled={!isPassNextStep}
                className="mt-4 w-full disabled:bg-bg-sf2"
                variant={"secondary"}
                onClick={() => {
                    if (isPassNextStep) {
                        setSidebarCurrent(SIDEBAR_TABS.CONFIRM_BID);
                    }
                }}
            >
                Continue
            </Button>
        </div>
    );
};
