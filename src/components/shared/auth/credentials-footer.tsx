export default function CredentialsFooter({
    content,
    subContent,
    action,
}: {
    content: string;
    subContent?: string;
    action?: () => void;
}) {
    return (
        <p className="mt-8 text-center text-base text-typo-soft mb:text-sm">
            {content && content}{" "}
            {subContent && (
                <span
                    onClick={() => action?.()}
                    className="hover-line !text-typo-soft"
                >
                    {subContent}
                </span>
            )}
        </p>
    );
}
