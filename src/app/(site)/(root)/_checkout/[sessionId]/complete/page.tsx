"use client";

import { useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { checkoutServices } from "@/services/checkout";

type CompletionState = "idle" | "loading" | "success" | "error";
export const dynamic = "force-dynamic";
export default function CheckoutCompletePage() {
    const router = useRouter();
    const params = useParams<{ sessionId: string }>();
    const sessionId = (params?.sessionId as string) || "";

    const [state, setState] = useState<CompletionState>("idle");
    const [message, setMessage] = useState<string>("");

    const handleComplete = useCallback(async () => {
        if (!sessionId || state === "loading") return;
        setState("loading");
        setMessage("");
        try {
            await checkoutServices.completeTransfer(sessionId);
            setState("success");
            setMessage("Checkout completed successfully.");
        } catch (err) {
            setState("error");
            setMessage(
                (err as Error).message || "Failed to complete checkout."
            );
        }
    }, [sessionId, state]);

    const onBackHome = () => router.push("/");

    return (
        <div
            style={{
                display: "flex",
                minHeight: "60vh",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div
                style={{
                    maxWidth: 560,
                    width: "100%",
                    textAlign: "center",
                    padding: 24,
                }}
            >
                <h1>Checkout Completion</h1>
                {!sessionId && (
                    <p>Missing sessionId. Please check your link.</p>
                )}
                {sessionId && state === "idle" && (
                    <>
                        <button
                            onClick={handleComplete}
                            style={{ marginTop: 16 }}
                        >
                            Complete Transfer
                        </button>
                    </>
                )}
                {sessionId && state === "loading" && (
                    <p>Finalizing your order...</p>
                )}
                {sessionId && state === "success" && (
                    <>
                        <p>{message}</p>
                        <button onClick={onBackHome} style={{ marginTop: 16 }}>
                            Go to Home
                        </button>
                    </>
                )}
                {sessionId && state === "error" && (
                    <>
                        <p>{message}</p>
                        <button onClick={onBackHome} style={{ marginTop: 16 }}>
                            Back to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
