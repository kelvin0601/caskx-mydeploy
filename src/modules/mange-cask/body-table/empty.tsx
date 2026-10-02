import ImagePreload from "@/components/shared/image-preload";
import React from "react";

export default function BodyTableEmpty({ title }: { title: string }) {
    return (
        <div className="h-[34.25rem] w-full rounded-b-md">
            <div className="flex-center flex h-full flex-col gap-6">
                <div className="aspect-[220/178] w-[13.75rem] tb:w-[10rem] mb:w-[8rem]">
                    <ImagePreload
                        src="/images/placeholder_table.png"
                        alt="Empty Data"
                        width={420}
                        height={315}
                    />
                </div>
                {title && (
                    <div className="text-typo-lg text-center font-medium text-typo-primary">
                        {title}
                    </div>
                )}
            </div>
        </div>
    );
}
