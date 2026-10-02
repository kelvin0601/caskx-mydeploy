import { useQuery } from "@tanstack/react-query";
import { externalLocationService } from "@/services/external/locationService";

export const LOCATION_KEYS = {
    STATES: (country: string) => ["location", "states", country],
};

/**
 * Hook to fetch states for a given country.
 */
export function useStatesQuery(country: string) {
    return useQuery({
        queryKey: LOCATION_KEYS.STATES(country),
        queryFn: () => externalLocationService.getStates(country),
        enabled: !!country,
        staleTime: 1000 * 60 * 60, // 1 hour caching
    });
}
