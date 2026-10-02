"use client";

import HeadingSettings from "@/components/shared/heading-settings";
import SignAgreementForm from "../forms/sign-agreement-form";
import { useState } from "react";
import { ListForSale } from "../index";

export default function SignAgreement() {
    const [isSuccess, setIsSuccess] = useState(false);

    if (isSuccess) {
        return (
            <ListForSale
                title="Payment processing in progress..."
                description={
                    "The transfers typically take <b>3 days</b> to complete. We will notify you as soon as it's confirmed, and provide instructions on the next steps."
                }
                buttonText="Back to home"
                imageSrc="/images/agreement_checkout.png"
            />
        );
    }
    return (
        <div className="flex flex-col gap-5">
            <HeadingSettings
                className="mb-12 border-b-[1px] border-bd-brown pb-5"
                title="Sign Release Form"
                description="Please review the release form carefully before signing."
            />
            <div className="h-[50vh] rounded-md bg-bg-sf1"></div>
            <SignAgreementForm
                onSuccess={() => {
                    setIsSuccess(true);
                }}
            />
        </div>
    );
}
