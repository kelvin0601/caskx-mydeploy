import ImagePlaceholder from "@/components/shared/image-placeholder";
import React from "react";

type TWarrantyItem = {
    title: string;
    description: string;
};

const warrantyData: TWarrantyItem[] = [
    {
        title: "Cask Exchange Verified",
        description:
            "Cask Exchange Verified is our exclusive certification, ensuring that each cask undergoes a thorough inspection every time.",
    },
    {
        title: "Cask Exchange Verified",
        description:
            "Cask Exchange Verified is our exclusive certification, ensuring that each cask undergoes a thorough inspection every time.",
    },
    {
        title: "Cask Exchange Verified",
        description:
            "Cask Exchange Verified is our exclusive certification, ensuring that each cask undergoes a thorough inspection every time.",
    },
];

export default function Warranty() {
    return (
        <div className="relative mb-[6.25rem] min-h-[54.875rem] w-full overflow-hidden bg-bg-darker py-24">
            <ImagePlaceholder
                src="/images/warranty-thumb.png"
                width={2000}
                height={1300}
                alt="warranty-thumb"
                className="absolute -bottom-8 left-0 h-[40.9375rem] w-[58.8125rem]"
            />
            <div className="container grid grid-cols-16">
                <h2 className="col-span-4 col-start-2 -ml-4 max-w-[26.625rem] text-3xl font-medium capitalize text-typo-dark-primary">
                    Ensuring Trust & Transparency in Cask Investments
                </h2>
                <div className="col-span-7 col-start-10 -ml-5 self-center">
                    <div className="flex flex-col gap-7">
                        {warrantyData.map((item, index) => (
                            <WarrantyCard
                                key={index}
                                title={item.title}
                                description={item.description}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const WarrantyCard: React.FC<TWarrantyItem> = ({ title, description }) => (
    <div className="flex flex-col gap-8 rounded-lg bg-bg-dark-sf1/30 px-8 py-12">
        <h3 className="text-lg font-medium text-typo-dark-primary">{title}</h3>
        <p className="text-base text-typo-dark-soft">{description}</p>
    </div>
);
