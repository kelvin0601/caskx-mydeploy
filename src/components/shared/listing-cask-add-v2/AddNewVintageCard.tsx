import { Button } from "@/components/ui/button";

export function AddNewVintageCard({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex h-[400px] w-full flex-col items-center justify-center gap-6 p-4 text-center">
            <h2 className="font-reckless text-[1.75rem] font-medium leading-none text-typo-primary mb:text-xl">
                No vintage available
            </h2>
            <Button
                type="button"
                variant="outline"
                onClick={onAdd}
                className="h-10 min-w-0 rounded-none border border-bd-main bg-transparent px-5 py-[0.8125rem] text-sm font-medium leading-none text-typo-primary hover:bg-transparent hover:text-typo-primary focus-visible:bg-transparent mb:px-4"
            >
                Add New Vintage
            </Button>
        </div>
    );
}
