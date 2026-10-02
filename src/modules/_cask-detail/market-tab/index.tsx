import MarketTable, {
    MarketTableSkeleton,
} from "@/components/shared/market-table";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTriggerCustom,
} from "@/components/ui/tabs";
import { KEY_MARKET_DATA } from "@/lib/constants/key";
import { marketDataService } from "@/services/market-data";
import { MarketOperations } from "@/types/market-operations";
import { useQuery } from "@tanstack/react-query";
import { MarketTableEmpty } from "../../../components/shared/market-table/index";

const TABLE_MARKETS = [
    { title: "Asks", value: "asks" },
    { title: "Bids", value: "bids" },
    { title: "Sales", value: "sales" },
];

const transformAsksData = (asks: MarketOperations.TAggregatedAskDto[]) =>
    asks
        .map((ask) => ({
            price: ask.price,
            quantity: ask.quantity.toString(),
            type: ask.type.split("_").join(" "),
        }))
        .toSorted((a, b) => a.price - b.price);

const transformBidsData = (bids: MarketOperations.TAggregatedBidDto[]) =>
    bids
        .map((bid) => ({
            price: bid.price,
            quantity: bid.quantity.toString(),
            type: bid.type.split("_").join(" "),
        }))
        .toSorted((a, b) => b.price - a.price);

const transformSalesData = (sales: MarketOperations.TMarketSaleDto[]) =>
    sales
        .map((sale) => ({
            price: sale.salePrice,
            quantity: sale.quantity.toString(),
            date: sale.completedDate,
        }))
        .toSorted(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

export default function MarketTab({ id }: { id: string }) {
    const marketDataAllQuery = useQuery({
        queryKey: [KEY_MARKET_DATA.CASK, id],
        enabled: !!id,
        queryFn: () => marketDataService.getMarketDataAll({ caskId: id }),
    });

    const asks = marketDataAllQuery.data?.marketData.asks ?? [];
    const bids = marketDataAllQuery.data?.marketData.bids ?? [];
    const sales = marketDataAllQuery.data?.marketData.sales ?? [];

    const isLoading = marketDataAllQuery.isLoading;

    if (isLoading) {
        return <MarketTableSkeleton />;
    }
    return (
        <div className="w-full">
            <Tabs defaultValue="asks" className="relative bg-transparent p-0">
                <div className="sticky top-0 z-20 bg-bg-main pt-4">
                    <TabsList className="grid w-full grid-cols-3 !gap-x-1 rounded-lg border border-bd-brown bg-bg-sf1 p-1">
                        {TABLE_MARKETS.map((table, index) => (
                            <TabsTriggerCustom
                                key={table.value}
                                value={table.value}
                                onClick={() => {
                                    marketDataAllQuery.refetch();
                                }}
                                className="text-typo-soft"
                            >
                                {table.title}
                            </TabsTriggerCustom>
                        ))}
                    </TabsList>
                </div>

                <TabsContent value="asks" className="mt-0 pt-4">
                    {Array.isArray(asks) && asks.length > 0 ? (
                        <MarketTable
                            heads={["Ask Price", "Quantity", "Type"]}
                            data={transformAsksData(asks)}
                        />
                    ) : (
                        <MarketTableEmpty
                            title="No Asks Available"
                            description="Be the first to place an ask and list your cask for sale."
                        />
                    )}
                </TabsContent>
                <TabsContent value="bids" className="mt-0 pt-4">
                    {Array.isArray(bids) && bids.length > 0 ? (
                        <MarketTable
                            heads={["Bid Price", "Quantity", "Type"]}
                            data={transformBidsData(bids)}
                        />
                    ) : (
                        <MarketTableEmpty
                            title="No Bids Available"
                            description="Submit the first bid and join the market."
                        />
                    )}
                </TabsContent>
                <TabsContent value="sales" className="mt-0 pt-4">
                    {Array.isArray(sales) && sales.length > 0 ? (
                        <MarketTable
                            heads={["Sale Price", "Quantity", "Date"]}
                            data={transformSalesData(sales)}
                        />
                    ) : (
                        <MarketTableEmpty
                            title="No Sales Available"
                            description="Check back later for the latest market activity."
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

export const MarketTabFooter = ({
    onBack,
    showBack,
}: {
    onBack?: () => void;
    showBack?: boolean;
}) => {
    return (
        <div className="sticky bottom-0 w-full bg-bg-main p-4">
            <div className="mb-1 rounded-md bg-bg-sf1 p-2.5 text-sm text-typo-soft">
                The prices above do not include applicable fees calculated at
                checkout.
            </div>
            {showBack && onBack && (
                <Button variant={"outline"} onClick={onBack} className="w-full">
                    Back
                </Button>
            )}
        </div>
    );
};
