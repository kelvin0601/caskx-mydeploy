import LabelCard from "@/components/shared/lable-card";
import { Badge } from "@/components/ui/badge";
import { LabelWithOutForm } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";

type TCardVerification = {
    title: string;
    icon: React.ReactNode;
    name: string;
    isRecommended?: boolean;
};

export default function CardVerification({
    title,
    icon,
    name,
    isRecommended,
}: TCardVerification) {
    return (
        <div className="flex cursor-pointer flex-row items-start justify-between gap-3 rounded-md border border-bd-brown [&>*]:cursor-pointer">
            <LabelWithOutForm
                htmlFor={name}
                className="flex flex-1 items-center gap-2 p-4"
            >
                <div className="flex flex-row items-center gap-3">
                    <div className="0px 0px 0px 1px rgba(10, 13, 18, 0.18) inset, 0px -2px 0px 0px rgba(10, 13, 18, 0.05) inset, 0px 1px 2px 0px rgba(16, 24, 40, 0.05) rounded-md border border-bd-brown bg-bg-sf1 p-2.5">
                        <div className="h-5 w-5">{icon}</div>
                    </div>
                    <h3 className="text-base font-medium">{title}</h3>
                </div>
                {isRecommended && (
                    <Badge variant="success" isHaveDot={true}>
                        Recommended
                    </Badge>
                )}
            </LabelWithOutForm>
            <div className="p-4">
                <RadioGroupItem value={name} id={name} />
            </div>
        </div>
    );
}
