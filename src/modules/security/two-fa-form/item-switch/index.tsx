"use client";

import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export type TAuthType = "google" | "sms";

type TSwitch = {
    actionSwitch?: (open: boolean) => void;
    checked?: boolean;
    type?: TAuthType;
};

export const SwitchSecurity = (props: TSwitch) => {
    const { actionSwitch, checked, type } = props;
    const [isChecked, setIsChecked] = useState(checked);

    useEffect(() => {
        if (checked !== undefined) {
            setIsChecked(checked);
        }
    }, [checked]);

    return (
        <Switch
            checked={isChecked}
            defaultChecked={checked}
            onCheckedChange={(open) => {
                actionSwitch?.(open);

                if (open) {
                    setIsChecked(open);
                }
            }}
        />
    );
};
