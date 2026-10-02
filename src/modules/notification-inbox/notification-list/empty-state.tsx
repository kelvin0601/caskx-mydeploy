"use client";

type TEmptyStateProps = {
    title?: string;
    description?: string;
    isUnreadOnly?: boolean;
};

export default function EmptyState({
    title,
    description,
    isUnreadOnly = false,
}: TEmptyStateProps) {
    const heading =
        title ??
        (isUnreadOnly ? "No unread notifications" : "No notifications");
    const message =
        description ??
        (isUnreadOnly
            ? "You're all caught up! Switch off 'Unread only' to view previous notifications."
            : "You're all caught up! Check back later for new updates.");

    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-20">
            <EmptyInboxIcon className="h-16 w-16 text-typo-soft" />
            <div className="flex flex-col items-center gap-2 text-center">
                <h3 className="font-reckless text-xl font-medium text-typo-primary">
                    {heading}
                </h3>
                <p className="max-w-[18.75rem] text-sm text-typo-soft">
                    {message}
                </p>
            </div>
        </div>
    );
}

function EmptyInboxIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M8 24L32 8L56 24V48L32 56L8 48V24Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M8 24L32 32L56 24"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M32 32V56"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M44 40L56 48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
