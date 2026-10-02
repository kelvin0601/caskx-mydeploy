"use client"; // Error boundaries must be Client Components

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        // global-error must include html and body tags
        <html lang="en" className="bg-bg-main">
            <body className="bg-bg-main">
                <div className="flex h-screen flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold">
                        Something went wrong!
                    </h2>
                    <button
                        className="bg-blue-500 text-white rounded-md px-4 py-2"
                        onClick={() => window.location.reload()}
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
