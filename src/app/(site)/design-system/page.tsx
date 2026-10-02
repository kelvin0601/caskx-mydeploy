import { notFound } from "next/navigation";
import DesignSystemModule from "@/modules/design-system";

export default function DesignSystemPage() {
    // Redirect to not-found in production
    /**
     * @param turnon when to prod
     */

    // if (process.env.NODE_ENV === "production") {
    //     notFound();
    // }

    return <DesignSystemModule />;
}
