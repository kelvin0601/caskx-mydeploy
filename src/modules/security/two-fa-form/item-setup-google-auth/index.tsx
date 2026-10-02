import { PropsWithChildren } from "react";

export const ItemSetupGoogleAuth = ({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
} & PropsWithChildren) => {
    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
                <div className="text-sm font-semibold text-typo-primary">
                    {title}
                </div>
                <div className="text-sm text-typo-sub">{description}</div>
            </div>
            {children}
        </div>
    );
};
