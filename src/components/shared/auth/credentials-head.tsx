export default function CredentialsHead({
    title = "Page Title",
    desc,
    breadcrumb,
    isLoading,
}: {
    title: string;
    desc?: string;
    breadcrumb?: boolean;
    isLoading?: boolean;
}) {
    return (
        <div className="flex-center w-full flex-col pb-10 text-center tb:pb-8">
            <h1 className="font-reckless text-[1.75rem] font-medium capitalize text-typo-primary tb:text-2xl mb:text-xl">
                {title}
                {isLoading && (
                    <div className="flex-center ml-4 mt-2 gap-2">
                        <div className="h-[0.4rem] w-[0.4rem] flex-shrink-0 animate-bounce rounded-full bg-typo-primary"></div>
                        <div className="h-[0.4rem] w-[0.4rem] flex-shrink-0 animate-bounce rounded-full bg-typo-primary delay-100"></div>
                        <div className="h-[0.4rem] w-[0.4rem] flex-shrink-0 animate-bounce rounded-full bg-typo-primary delay-200"></div>
                    </div>
                )}
            </h1>
            {desc && <p className="mt-2 text-sm text-typo-soft">{desc}</p>}
        </div>
    );
}
