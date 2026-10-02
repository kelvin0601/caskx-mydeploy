import { AskControls } from "@/components/shared/cask-card-quantity-controls";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import useOrderCalculation from "@/modules/market-orders/hooks/use-order-calculation";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS } from "@/lib/constants/key";
import { formatCurrency } from "@/lib/utils";
import caskServices from "@/services/cask";
import caskAskService from "@/services/cask-ask";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useManageCask } from "../provider";

export default function UpdateAsk({ id }: { id: string }) {
    const { setSidebarCurrent } = useManageCask();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
        fetchFn: () => caskServices.getDetailCask(id),
    });

    // For asks, the controls component manages its own validations similarly to PlaceAsk

    return (
        <div className="flex h-full flex-col pt-4">
            <div className="flex flex-col gap-4">
                <AskControls
                    data={{
                        ...(caskDetail as cask.TCask),
                        name: `${caskDetail?.master?.name} - ${caskDetail?.name}`,
                    }}
                    setSidebarCurrent={setSidebarCurrent}
                />
            </div>
        </div>
    );
}

export const UpdateAskFooter = ({ id }: { id: string }) => {
    const { priceCaskCurrent, quantity } = useCheckout();
    const { setSidebarCurrent } = useManageCask();
    const { askCalQuery } = useOrderCalculation({
        askData: {
            askPrice: priceCaskCurrent,
            quantity: quantity,
            sessionId: caskAskService.getOrCreateSessionId(),
        },
    });
    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        askCalQuery.data || {};

    const dataRender = {
        subTotal: {
            label: "Ask Price",
            value: () => formatCurrency(subtotal || 0),
        },
        ...(processingFeePercent && {
            processingFee: {
                label: `Processing Fee (${processingFeePercent || 0}%)`,
                value: () => `-${formatCurrency(processingFeeAmount || 0)}`,
            },
        }),
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
                        setSidebarCurrent(SIDEBAR_TABS.CONFIRM_ASK);
                    }
                }}
            >
                Continue
            </Button>
        </div>
    );
};
