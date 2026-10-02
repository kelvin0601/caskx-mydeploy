import axios from "axios";

export type TState = {
    name: string;
    state_code?: string;
};

export type TCity = {
    name: string;
};

export type TDistrict = {
    name: string;
    district_code?: string;
};

type StatesApiResponse = {
    error: boolean;
    msg: string;
    data: {
        name: string;
        iso3: string;
        states: TState[];
    };
};

type CitiesApiResponse = {
    error: boolean;
    msg: string;
    data: TCity[];
};

export class ExternalLocationService {
    private readonly BASE_URL = "https://countriesnow.space/api/v0.1/countries";

    async getStates(country: string): Promise<TState[]> {
        if (!country) return [];

        try {
            const response = await axios.post<StatesApiResponse>(
                `${this.BASE_URL}/states`,
                {
                    country,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (response.data.error) {
                console.log(
                    `[ExternalLocationService] No states found for ${country}:`,
                    response.data.msg
                );
                return [];
            }

            return response.data?.data?.states || [];
        } catch (error) {
            console.error(
                "[ExternalLocationService] Error fetching states:",
                error
            );
            return [];
        }
    }

    async getCitiesByCountry(country: string): Promise<TCity[]> {
        if (!country) return [];

        try {
            const response = await axios.post<CitiesApiResponse>(
                `${this.BASE_URL}/cities`,
                {
                    country,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (!response.data.error && response.data.data) {
                return response.data.data;
            }

            // Fallback: Try to get cities from states endpoint
            const statesResponse = await axios.post<StatesApiResponse>(
                `${this.BASE_URL}/states`,
                {
                    country,
                },
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            if (
                !statesResponse.data.error &&
                statesResponse.data.data?.states
            ) {
                return statesResponse.data.data.states.map((state) => ({
                    name: state.name,
                }));
            }
            return [];
        } catch (error) {
            console.error(
                "[ExternalLocationService] Error fetching cities by country:",
                error
            );
            return [];
        }
    }

    async getCitiesByState(country: string, state?: string): Promise<TCity[]> {
        if (!country) return [];

        try {
            const payload = state ? { country, state } : { country };
            const response = await axios.post<CitiesApiResponse>(
                `${this.BASE_URL}/state/cities`,
                payload,
                { headers: { "Content-Type": "application/json" } }
            );

            if (response.data.error) {
                console.log(
                    `[ExternalLocationService] No cities found for ${state}, ${country}`
                );
                return [];
            }

            return response.data.data || [];
        } catch (error) {
            console.error(
                "[ExternalLocationService] Error fetching cities by state:",
                error
            );
            return [];
        }
    }
}

export const externalLocationService = new ExternalLocationService();
