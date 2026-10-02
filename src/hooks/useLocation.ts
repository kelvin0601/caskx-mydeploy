import { useQuery } from "@tanstack/react-query";
import { helperServices, type Country, type State } from "@/services/helper";

// Query keys for caching
export const LOCATION_QUERY_KEYS = {
    countries: ["location", "countries"] as const,
    states: (countryName: string) =>
        ["location", "states", countryName] as const,
} as const;

/**
 * Hook to fetch countries list
 */
export function useCountries() {
    return useQuery({
        queryKey: LOCATION_QUERY_KEYS.countries,
        queryFn: () => helperServices.getCountries(),
        staleTime: 1000 * 60 * 60, // 1 hour - countries don't change often
        gcTime: 1000 * 60 * 60 * 24, // 24 hours cache time
        retry: 2,
    });
}

/**
 * Hook to fetch states/provinces for a specific country
 */
export function useStates(countryName: string, enabled = true) {
    return useQuery({
        queryKey: LOCATION_QUERY_KEYS.states(countryName),
        queryFn: () => helperServices.getStates(countryName),
        enabled: enabled && !!countryName,
        staleTime: 1000 * 60 * 30, // 30 minutes
        gcTime: 1000 * 60 * 60, // 1 hour cache time
        retry: 2,
    });
}
