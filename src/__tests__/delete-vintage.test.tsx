import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { checkVintageHasMarketActivity } from "@/components/shared/listing-cask-add-v2/useVintageMarketActivity";
import { DeleteVintageDialog } from "@/components/shared/listing-cask-add-v2/DeleteVintageDialog";
import {
    CaskVariantsProvider,
    useCaskVariants,
    CaskVariantItem,
} from "@/store/dashboard/CaskProvider";
import caskServices from "@/services/cask";
import { useEffect } from "react";
import { toast } from "sonner";

jest.mock("uuid", () => ({
    v4: () => "mocked-uuid",
}));

jest.mock("@/services/cask", () => ({
    deleteCask: jest.fn().mockResolvedValue({ success: true }),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("@/services/market-data", () => ({
    marketDataService: {
        getMarketDataAll: jest.fn().mockResolvedValue({ marketData: {} }),
    },
}));

jest.mock("query-string", () => ({
    stringify: jest.fn((obj) =>
        Object.entries(obj)
            .map(([key, value]) => `${key}=${value}`)
            .join("&")
    ),
    parse: jest.fn((value) =>
        Object.fromEntries(new URLSearchParams(value as string))
    ),
}));

describe("checkVintageHasMarketActivity", () => {
    it("returns false for unsaved/pending variants", () => {
        expect(
            checkVintageHasMarketActivity({
                id: "new-variant-123",
                name: "New vintage",
            } as CaskVariantItem)
        ).toBe(false);

        expect(
            checkVintageHasMarketActivity({
                id: "duplicate-variant",
                name: "Duplicate",
            } as CaskVariantItem)
        ).toBe(false);
    });

    it("returns true when totalActiveBids > 0", () => {
        expect(
            checkVintageHasMarketActivity({
                id: "cask-1",
                totalActiveBids: 2,
            } as CaskVariantItem)
        ).toBe(true);
    });

    it("returns true when highestBid > 0 or lowestAsk > 0", () => {
        expect(
            checkVintageHasMarketActivity({
                id: "cask-1",
                highestBid: 1000,
            } as CaskVariantItem)
        ).toBe(true);

        expect(
            checkVintageHasMarketActivity({
                id: "cask-1",
                lowestAsk: 1200,
            } as CaskVariantItem)
        ).toBe(true);
    });

    it("returns true when marketData has bids, asks, or sales", () => {
        expect(
            checkVintageHasMarketActivity({ id: "cask-1" } as CaskVariantItem, {
                marketData: { asks: [{ id: "ask-1" }] },
            })
        ).toBe(true);

        expect(
            checkVintageHasMarketActivity({ id: "cask-1" } as CaskVariantItem, {
                marketData: { sales: [{ id: "sale-1" }] },
            })
        ).toBe(true);
    });

    it("returns false when there is no activity", () => {
        expect(
            checkVintageHasMarketActivity({
                id: "cask-1",
                totalActiveBids: 0,
                highestBid: 0,
                lowestAsk: 0,
            } as CaskVariantItem)
        ).toBe(false);
    });
});

function TestHarness({
    variants,
    initialPendingDelete,
}: {
    variants: CaskVariantItem[];
    initialPendingDelete?: CaskVariantItem | null;
}) {
    const { setListVariants, setPendingDeleteVariant } = useCaskVariants();

    useEffect(() => {
        setListVariants(variants);
        if (initialPendingDelete) {
            setPendingDeleteVariant(initialPendingDelete);
        }
    }, [
        variants,
        initialPendingDelete,
        setListVariants,
        setPendingDeleteVariant,
    ]);

    return <DeleteVintageDialog masterId="master-1" />;
}

describe("DeleteVintageDialog", () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        jest.clearAllMocks();
    });

    it("renders modal with correct title, year in description, and buttons", () => {
        const variantToDelete = {
            id: "cask-2004",
            vintageYear: 2004,
            name: "2004 Cask",
        } as CaskVariantItem;

        const allVariants = [
            variantToDelete,
            {
                id: "cask-2005",
                vintageYear: 2005,
                name: "2005 Cask",
            } as CaskVariantItem,
        ];

        render(
            <QueryClientProvider client={queryClient}>
                <CaskVariantsProvider>
                    <TestHarness
                        variants={allVariants}
                        initialPendingDelete={variantToDelete}
                    />
                </CaskVariantsProvider>
            </QueryClientProvider>
        );

        expect(screen.getByText("Delete Vintage?")).toBeInTheDocument();
        expect(
            screen.getByText(
                "This will permanently delete the 2004 vintage and all associated data. This action cannot be undone."
            )
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Cancel" })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Delete" })
        ).toBeInTheDocument();
    });

    it("renders single-variant safeguard description when only 1 variant exists", () => {
        const soleVariant = {
            id: "cask-only",
            vintageYear: 2010,
            name: "2010 Cask",
        } as CaskVariantItem;

        render(
            <QueryClientProvider client={queryClient}>
                <CaskVariantsProvider>
                    <TestHarness
                        variants={[soleVariant]}
                        initialPendingDelete={soleVariant}
                    />
                </CaskVariantsProvider>
            </QueryClientProvider>
        );

        expect(
            screen.getByText(
                "Deleting this vintage will also delete its parent cask. Are you sure you want to proceed?"
            )
        ).toBeInTheDocument();
    });

    it("calls delete service and removes variant on confirm", async () => {
        const variantToDelete = {
            id: "cask-delete-me",
            vintageYear: 2008,
            name: "2008 Cask",
        } as CaskVariantItem;

        const allVariants = [
            variantToDelete,
            {
                id: "cask-keep",
                vintageYear: 2009,
                name: "2009 Cask",
            } as CaskVariantItem,
        ];

        render(
            <QueryClientProvider client={queryClient}>
                <CaskVariantsProvider>
                    <TestHarness
                        variants={allVariants}
                        initialPendingDelete={variantToDelete}
                    />
                </CaskVariantsProvider>
            </QueryClientProvider>
        );

        const deleteButton = screen.getByRole("button", { name: "Delete" });
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(caskServices.deleteCask).toHaveBeenCalledWith(
                "cask-delete-me"
            );
            expect(toast.success).toHaveBeenCalledWith(
                "Vintage deleted successfully."
            );
        });
    });
});
