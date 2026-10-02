import CaskCardQuantity from "@/components/shared/cask-card-quantity";
import IconCoinB from "@/components/shared/icons/icon-coin-b";
import ActionOptionItem from "@/components/shared/item-action-w-ic";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import useCalculatePriceCask from "@/hooks/useCalculatePriceCask";
import useGetStateQuery from "@/hooks/useGetStateQuery";
import { SIDEBAR_TABS } from "@/lib/constants";
import { CASK_KEYS, KEY_BID } from "@/lib/constants/key";
import { formatCurrency } from "@/lib/utils";
import { caskBidService } from "@/services/cask-bid";
import { useCheckout } from "@/store/checkout";
import { cask } from "@/types";
import { useEffect, useMemo } from "react";
import { useCaskDetail } from "../provider";
import { AskControls } from "@/components/shared/cask-card-quantity-controls";
import caskServices from "@/services/cask";

export default function SellNow({ id }: { id: string }) {
    const { setPriceCaskCurrent } = useCheckout();
    const { setSidebarCurrent } = useCaskDetail();
    const { data: caskDetail } = useGetStateQuery<cask.TCask>({
        key: [CASK_KEYS.CASK_DETAIL, id],
        fetchFn: () => caskServices.getDetailCask(id),
    });

    const dataCacheMarket = useGetStateQuery({
        key: [KEY_BID.BID_MARKET_DATA, id],
        fetchFn: () => caskBidService.getCaskBidMarketData(id),
    });

    const highestBid = useMemo(() => {
        return dataCacheMarket?.data?.highestBid || 0;
    }, [dataCacheMarket?.data]);

    const handlePlaceAsk = () => {
        setSidebarCurrent(SIDEBAR_TABS.PLACE_ASK);
    };

    useEffect(() => {
        setPriceCaskCurrent(Number(highestBid));
    }, [highestBid, setPriceCaskCurrent]);
    return (
        <div className="flex h-full flex-col pt-4">
            <div className="flex flex-col gap-4">
                {/* <CaskCardQuantity
                    data={{
                        ...caskDetail!,
                        highestBid: highestBid,
                    }}
                    priceCask={highestBid}
                    limit={dataCacheMarket?.data?.totalActiveBids || 0}
                    subContent="Sell now at"
                /> */}
                <AskControls
                    priceLabel="Sell now at"
                    showQuantity
                    showSuggestion={false}
                    data={{
                        ...(caskDetail as cask.TCask),
                        name: `${caskDetail?.master?.name} - ${caskDetail?.name}`,
                    }}
                    setSidebarCurrent={setSidebarCurrent}
                />

                <ActionOptionItem
                    title="Make An Offer"
                    description="Sell it for more"
                    onClick={handlePlaceAsk}
                    icon={<IconCoinB />}
                    isHighLight={true}
                />
            </div>
        </div>
    );
}

export const SellNowFooter = ({ id }: { id: string }) => {
    const { subTotal, priceCaskCurrent, quantity } = useCheckout();
    const { setSidebarCurrent } = useCaskDetail();
    const { askCalQuery } = useCalculatePriceCask({
        askData: {
            askPrice: priceCaskCurrent,
            quantity: quantity,
            sessionId: caskBidService.getOrCreateSessionId(),
        },
    });
    const { totalAmount, subtotal, processingFeeAmount, processingFeePercent } =
        askCalQuery.data || {};

    const dataRender = {
        subTotal: {
            label: "Cask Price",
            value: () => formatCurrency(subtotal || 0),
        },
        processingFee: {
            label: `Processing Fee (${processingFeePercent || 0}%)`,
            value: () => `-${formatCurrency(processingFeeAmount || 0)}`,
        },
    };

    const handlePlaceAsk = () => {
        if (!subTotal) {
            return;
        }
        setSidebarCurrent(SIDEBAR_TABS.CONFIRM_SELL_NOW);
    };

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
                Your sell order may be partially filled. Any unfilled units will
                be placed as an ask.{" "}
            </div>
            <Button
                className="mt-4 w-full disabled:!bg-bg-sf2"
                variant={"secondary"}
                disabled={askCalQuery.isPending || !totalAmount}
                onClick={handlePlaceAsk}
            >
                Sell Now
            </Button>
        </div>
    );
};
