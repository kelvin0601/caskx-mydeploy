import axiosInstance from "@/config/axios";
import { STRIPE_KEYS } from "@/lib/constants/key";
import { PATH_STRIPE } from "@/lib/constants/path";
import { handleRequest } from "@/lib/utils";
import { stripe } from "@/types/stripe";

class StripeService {
    createAccount = async ({
        sellerId,
        userId,
        email,
        country,
    }: stripe.TCreateAccount) => {
        return handleRequest<stripe.TAccountInfo>(
            axiosInstance.post(`${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}`, {
                sellerId,
                userId,
                email,
                country,
            })
        );
    };
    createNewSessionAccountOnboarding = async ({
        accountId,
        refreshUrl,
        returnUrl,
    }: {
        accountId: string;
        refreshUrl: string;
        returnUrl: string;
    }) => {
        return handleRequest(
            axiosInstance.post(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${accountId}/${STRIPE_KEYS.ACCOUNT_ONBOARDING}`,
                {
                    refreshUrl,
                    returnUrl,
                }
            )
        );
    };
    getStatusOnboarding = async (accountId: string) => {
        return handleRequest(
            axiosInstance.get(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${accountId}/${STRIPE_KEYS.ACCOUNT_ONBOARDING_STATUS}`
            )
        );
    };
    getPersonOfAccount = async () => {
        const res = await handleRequest(
            axiosInstance.get<{
                person: {
                    rawStripeData: stripe.TPerson;
                }[];
            }>(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${STRIPE_KEYS.GET_PERSON}`
            )
        );
        return res?.person.map((person) => ({
            ...person?.rawStripeData,
        }));
    };
    changeRepresentativeCompany = async ({
        personId,
        oldPersonId,
        accountId,
    }: {
        personId: string;
        oldPersonId: string;
        accountId: string;
    }) => {
        await this.updatePerson({
            accountId,
            personId: oldPersonId,
            data: {
                relationship: { representative: false },
            },
        });
        await this.updatePerson({
            accountId,
            personId,
            data: {
                relationship: { representative: true },
            },
        });
    };
    createPerson = (data: Partial<stripe.TCreatePerson>) => {
        return handleRequest(
            axiosInstance.post(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${STRIPE_KEYS.GET_PERSON}`,
                data
            )
        );
    };
    updatePerson = async ({
        accountId,
        personId,
        data,
    }: {
        accountId: string;
        personId: string;
        data: Partial<stripe.TPerson>;
    }) => {
        return handleRequest(
            axiosInstance.put(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${accountId}/${STRIPE_KEYS.UPDATE_PERSON}/${personId}`,
                data
            )
        );
    };
    removePerson = async ({ personId }: { personId: string }) => {
        return handleRequest(
            axiosInstance.delete(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${STRIPE_KEYS.REMOVE_PERSON}/${personId}`
            )
        );
    };
    refreshStripeAccount = async (accountId: string) => {
        return handleRequest(
            axiosInstance.post(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${accountId}/${STRIPE_KEYS.ACCOUNT_REFRESH}`
            )
        );
    };
    getAccountStripe = async () => {
        return handleRequest(
            axiosInstance.get<{
                success: boolean;
                profile: stripe.TAccountProfile;
            }>(`${PATH_STRIPE}/${STRIPE_KEYS.PROFILE}`)
        );
    };

    getAccountDetails = async (accountId?: string) => {
        /**
         * @description with admin role
         */
        return handleRequest(
            axiosInstance.get<{
                success: boolean;
                profile: stripe.TAccountProfile;
            }>(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${accountId}/${STRIPE_KEYS.PROFILE}`
            )
        );
    };
    updateAccountStripe = async (data?: Partial<stripe.TAccountProfile>) => {
        return handleRequest(
            axiosInstance.put<{
                success: boolean;
                error?: string;
                profile: stripe.TAccountProfile;
            }>(`${PATH_STRIPE}/${STRIPE_KEYS.PROFILE}`, data)
        );
    };

    getPayouts = async (accountId: string) => {
        return handleRequest(
            axiosInstance.get<{
                success: boolean;
                payouts: stripe.TPayout;
            }>(
                `${PATH_STRIPE}/${STRIPE_KEYS.ACCOUNT}/${accountId}/${STRIPE_KEYS.PAYOUTS}`
            )
        );
    };
}

const stripeService = new StripeService();
export default stripeService;
