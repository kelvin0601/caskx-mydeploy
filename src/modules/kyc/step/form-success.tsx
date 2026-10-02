import ImagePreload from "@/components/shared/image-preload";
import { Button } from "@/components/ui/button";
import { ROUTE_PUBLIC } from "@/lib/constants/route";
import { redirect } from "next/navigation";

export default function FormSuccess() {
    return (
        <div className="flex flex-col items-center gap-6">
            <ImagePreload
                src="/images/waiting_request.png"
                width={200}
                height={200}
                className="aspect-[220/178] w-[13.75rem] tb:w-[10rem] mb:w-[8rem]"
                alt="waiting request"
            />
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="text-xl font-medium text-typo-primary">
                    Under review
                </div>
                <div className="max-w-[27.5rem] text-sm text-typo-soft">
                    You will receive a notification once the review is
                    completed. Meanwhile, please feel free to explore our
                    platform.
                </div>
            </div>
            <Button
                onClick={() => redirect(ROUTE_PUBLIC.HOME)}
                variant={"secondary"}
            >
                Back to homepage
            </Button>
        </div>
    );
}
