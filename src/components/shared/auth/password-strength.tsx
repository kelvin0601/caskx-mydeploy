import usePasswordValidate from "@/hooks/usePasswordValidate";
import { passwordConstraintContent } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

export default function PasswordStrength({
    password = "",
}: {
    password?: string;
}) {
    const [isVisible, setIsVisible] = useState(false);
    const { validateContains, pointPasswordStrong } =
        usePasswordValidate(password);

    useEffect(() => {
        if (password.length > 0) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [password]);

    return (
        <div
            className={`overflow-hidden transition ${isVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}
        >
            <div className="-mt-1.5 pt-4">
                <PasswordStrengthBar validCount={pointPasswordStrong} />

                <div className="space-y-1.5">
                    <div className="text-sm text-dark-300">
                        Password must contain:
                    </div>
                    {passwordConstraintContent.map((item) => {
                        const isInvalid = !validateContains.includes(item.name);
                        return (
                            <PasswordStrengthItem
                                key={item.name}
                                content={item.message}
                                isInvalid={isInvalid}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function PasswordStrengthItem({
    content = "",
    isInvalid = false,
}: {
    content: string;
    isInvalid: boolean;
}) {
    return (
        <div className="flex items-center gap-x-1">
            <Check
                size={16}
                className={`h-4 w-4 shrink-0 transition-colors ${isInvalid ? "text-[#ded7c9]" : "text-[#058134]"}`}
            />
            <span
                className={cn(
                    "font-inter text-sm text-typo-primary transition-all",
                    isInvalid && "text-typo-note"
                )}
            >
                {content}
            </span>
        </div>
    );
}
function PasswordStrengthBar({ validCount }: { validCount: number }) {
    const color =
        validCount === 1
            ? "bg-error"
            : validCount === 2
              ? "bg-warn"
              : validCount === 3
                ? "bg-brand"
                : "bg-success";
    return (
        <div className="mb-4 flex select-none gap-x-1">
            <div
                className={`h-1 w-full rounded-none transition-colors duration-300 ${validCount >= 1 ? color : "bg-bg-sf4"}`}
            ></div>
            <div
                className={`h-1 w-full rounded-none transition-colors duration-300 ${validCount >= 2 ? color : "bg-bg-sf4"}`}
            ></div>
            <div
                className={`h-1 w-full rounded-none transition-colors duration-300 ${validCount >= 3 ? color : "bg-bg-sf4"}`}
            ></div>
            <div
                className={`h-1 w-full rounded-none transition-colors duration-300 ${validCount >= 4 ? color : "bg-bg-sf4"}`}
            ></div>
        </div>
    );
}
