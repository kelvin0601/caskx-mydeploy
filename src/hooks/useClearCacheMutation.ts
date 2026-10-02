import { useQueryClient } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
//clear cache in authLayout
export default function useClearCacheMutation() {
    const pathName = usePathname();
    const queryClient = useQueryClient();

    useEffect(() => {
        queryClient.getMutationCache().clear();
    }, [pathName]);
}
