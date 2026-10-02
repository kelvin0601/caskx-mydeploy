import { Button } from "@/components/ui/button";
import { useInvoiceDownload } from "@/hooks/useInvoiceDownload";
import { formatTabletDateTime } from "@/lib/utils";
import { TransactionInvoiceType } from "@/modules/_checkout/table-info-transaction";

export default function TransactionDocuments({
    checkoutSessionId,
    generatedAt,
}: {
    checkoutSessionId: string;
    generatedAt?: string;
}) {
    const { downloadInvoice, isLoading } = useInvoiceDownload(
        checkoutSessionId,
        TransactionInvoiceType.FINAL
    );

    return (
        <section className="hidden flex-col gap-4 pt-6 tb:flex">
            <h2 className="text-lg font-semibold text-typo-primary tb:text-base tb:leading-[1.2]">
                Transaction documents
            </h2>
            <div className="flex items-center gap-8 bg-bg-sf4 p-4">
                <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-typo-primary">
                        Invoice
                    </p>
                    <p className="mt-1 truncate text-sm text-typo-note">
                        PDF • Generated {formatTabletDateTime(generatedAt)}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="link"
                    className="h-auto shrink-0 p-0 text-sm font-medium leading-none"
                    disabled={!checkoutSessionId || isLoading}
                    onClick={() => void downloadInvoice()}
                >
                    {isLoading ? "Downloading..." : "Download"}
                </Button>
            </div>
        </section>
    );
}
