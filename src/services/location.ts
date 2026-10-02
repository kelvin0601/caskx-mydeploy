import { externalLocationService } from "./external/locationService";

export type TState = {
    name: string;
    state_code: string;
};

class LocationService {
    /**
     * Fetch states/provinces for a given country name.
     */
    getStates = async (country: string): Promise<TState[]> => {
        // Use external location service and map to local TState
        const states = await externalLocationService.getStates(country);
        return states.map((s) => ({
            name: s.name,
            state_code: s.state_code || "",
        }));
    };
}

export const locationService = new LocationService();
