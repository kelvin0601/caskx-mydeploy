import * as RPNInput from "react-phone-number-input";
import { externalLocationService } from "./external/locationService";

// Types for API responses
export type Country = {
    code: string;
    name: string;
};

export type State = {
    name: string;
    state_code?: string;
};

export type District = {
    name: string;
    district_code?: string;
};

export type City = {
    name: string;
};

export type CountriesApiResponse = {
    error: boolean;
    msg: string;
    data: Country[];
};

export type StatesApiResponse = {
    error: boolean;
    msg: string;
    data: {
        name: string;
        iso3: string;
        states: State[];
    };
};

export type DistrictsApiResponse = {
    error: boolean;
    msg: string;
    data: District[];
};

export type CitiesApiResponse = {
    error: boolean;
    msg: string;
    data: City[];
};

export type LocationData = {
    hasStates: boolean;
    hasDistricts: boolean;
    hasCities: boolean;
    states: State[];
    districts: District[];
    cities: City[];
    locationStructure:
        | "country-only"
        | "country-state"
        | "country-state-district"
        | "country-city"
        | "country-state-city";
};

class HelperServices {
    // Get all countries using react-phone-number-input (reliable source)
    async getCountries(): Promise<Country[]> {
        try {
            // Use react-phone-number-input as primary source (more reliable)
            const regionNames = new Intl.DisplayNames(["en"], {
                type: "region",
            });
            const countryList = RPNInput.getCountries().map((code) => ({
                code,
                name: regionNames.of(code) || code,
            }));

            return countryList;
        } catch (error) {
            console.error("Error fetching countries:", error);
            throw new Error("Failed to fetch countries");
        }
    }

    // Get states/provinces for a specific country
    async getStates(countryName: string): Promise<State[]> {
        return externalLocationService.getStates(countryName);
    }

    // Get cities for a specific country (not requiring state)
    async getCitiesByCountry(countryName: string): Promise<City[]> {
        return externalLocationService.getCitiesByCountry(countryName);
    }

    // Get districts/counties for a specific state
    async getDistrictsByState(
        countryName: string,
        stateName: string
    ): Promise<District[]> {
        const cities = await externalLocationService.getCitiesByState(
            countryName,
            stateName
        );
        return cities.map((city) => ({
            name: city.name,
            district_code: undefined,
        }));
    }

    // Enhanced method: Get location data with 3-level hierarchy
    async getLocationData(countryName: string): Promise<LocationData> {
        try {
            // First get states
            const states = await this.getStates(countryName);
            const hasStates = states.length > 0;

            let hasDistricts = false;
            const districts: District[] = [];

            // If we have states, check if we can get districts for the first state as sample
            if (hasStates && states.length > 0) {
                const sampleDistricts = await this.getDistrictsByState(
                    countryName,
                    states[0].name
                );
                hasDistricts = sampleDistricts.length > 0;
                // Don't set districts here as they depend on selected state
            }

            // Get cities as fallback
            const cities = await this.getCitiesByCountry(countryName);
            const hasCities = cities.length > 0;

            // Determine location structure
            let locationStructure:
                | "country-only"
                | "country-state"
                | "country-state-district"
                | "country-city"
                | "country-state-city";

            if (hasStates && hasDistricts) {
                locationStructure = "country-state-district";
            } else if (hasStates && hasCities) {
                locationStructure = "country-state-city";
            } else if (hasStates && !hasCities && !hasDistricts) {
                locationStructure = "country-state";
            } else if (!hasStates && hasCities) {
                locationStructure = "country-city";
            } else {
                locationStructure = "country-only";
            }

            return {
                hasStates,
                hasDistricts,
                hasCities,
                states,
                districts, // Empty initially, will be populated when state is selected
                cities,
                locationStructure,
            };
        } catch (error) {
            console.error("Error getting location data:", error);
            return {
                hasStates: false,
                hasDistricts: false,
                hasCities: false,
                states: [],
                districts: [],
                cities: [],
                locationStructure: "country-only",
            };
        }
    }

    // Get states/provinces by country and city (updated)
    async getStatesByCountryAndCity(
        countryName: string,
        cityName: string
    ): Promise<State[]> {
        // For most APIs, states are not dependent on cities
        // So we just return all states for the country
        return this.getStates(countryName);
    }

    // Get cities for a specific country and state (legacy method)
    async getCities(countryName: string, stateName?: string): Promise<City[]> {
        return externalLocationService.getCitiesByState(countryName, stateName);
    }
}

export const helperServices = new HelperServices();
