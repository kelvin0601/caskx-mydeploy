import React from "react";

export default function OfferDetailLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="min-h-screen w-full bg-bg-main">
            {children}
        </div>
    );
}
