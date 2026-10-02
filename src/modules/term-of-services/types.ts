export type TTermsContent = {
    title: string;
    lastUpdated: string;
    content: string;
};

export type TTermsOfServicesProps = {
    title: string;
    lastUpdated: string;
    content: string;
    className?: string;
};

export type TTableOfContentProps = {
    className?: string;
};

export type TContentProps = {
    data: TTermsContent;
    className?: string;
};
