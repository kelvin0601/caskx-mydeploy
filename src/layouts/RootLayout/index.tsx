import Header from "../Header";
import RootLayoutClient from "./RootLayoutClient";

export default async function RootLayout({
    children,
    footer,
}: Readonly<{
    children: React.ReactNode;
    footer?: React.ReactNode;
}>) {
    return (
        <RootLayoutClient header={<Header />} footer={footer}>
            {children}
        </RootLayoutClient>
    );
}
