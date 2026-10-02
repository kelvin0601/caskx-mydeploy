import {
    MAP_KEY_FILTER_DISTILLERIES,
    TStatusDistilleries,
} from "@/lib/constants";
import { filterSchemaCask, filterSchemaDistillery } from "@/lib/validators";
import type {
    BusinessInfoFormValues,
    CompanyDetailsFormValues,
    PersonalDetailsFormValues,
    ProfessionalDetailsFormValues,
    PublicDetailsFormValues,
} from "@/modules/account/forms/schemas";
import { global } from "@/types/global/global";
import { z } from "zod";
import { auth } from "./auth";
import { cask } from "./cask";
import { caskMaster } from "./cask-master";
import { distillery } from "./distillery";
import { stripe } from "./stripe";

// Type alias for edit modal type
type TEditModalType = stripe.TEditMode;

export declare namespace store {
    type TCask = {
        isReset: boolean;
        casks: global.TDataWithPagination<caskMaster.TCaskMasterBase[]>;
        tags: cask.TCaskFilterCask[] | [];
        caskTypes: cask.TCaskType[];
        caskActive?: caskMaster.TCaskChild | null;
        caskMasterDetails?: caskMaster.TCaskMaster;
        distilleries: distillery.TDistillery[];
        sortCask?: cask.TCaskSort;
        filterCask: z.infer<typeof filterSchemaCask>;
        updateCaskMasterDetails: (cask: caskMaster.TCaskMaster) => void;
        updateCaskActive: (cask: caskMaster.TCaskChild | null) => void;
        updateCasks: (
            casks: global.TDataWithPagination<caskMaster.TCaskMasterBase[]>
        ) => void;
        updateTags: () => void;
        setIsResetCask: (isReset: boolean) => void;
        updateSortCask: (sort: cask.TCaskSort) => void;
        updateFilterCask: (filter: z.infer<typeof filterSchemaCask>) => void;
        deleteTag: ({
            id,
            type,
        }: {
            id: string;
            type: cask.TCaskFilter;
        }) => z.infer<typeof filterSchemaCask>;
        updateCaskTypes: (caskTypes: cask.TCaskType[]) => void;
        updateDistilleries: (distilleries: distillery.TDistillery[]) => void;
        clearTags: () => void;
        clearSortCask: () => void;
        clearFilterCask: () => void;
        clearAll: () => void;
    };
    type TDistilleries = {
        isResetDistilleries: boolean;
        tagsDistilleries: distillery.TDistilleryFilter[];
        sortDistilleries?: distillery.TDistillerySort;
        filterDistilleries: z.infer<typeof filterSchemaDistillery>;
        distilleriesData: global.TDataWithPagination<distillery.TDistillery[]>;
        [MAP_KEY_FILTER_DISTILLERIES.statuses.store_key]: TStatusDistilleries[];
        [MAP_KEY_FILTER_DISTILLERIES.regions.store_key]: TOptionCheckBox[];
        [MAP_KEY_FILTER_DISTILLERIES.companies.store_key]: TOptionCheckBox[];
        [MAP_KEY_FILTER_DISTILLERIES.countries.store_key]: TOptionCheckBox[];
        updateTagsDistilleries: () => void;
        updateDistilleriesData: (data: {
            statuses?: TStatusDistilleries[];
            companies?: TOptionCheckBox[];
            countries?: TOptionCheckBox[];
            regions?: TOptionCheckBox[];
        }) => void;
        updateDistilleriesList: (
            data: global.TDataWithPagination<distillery.TDistillery[]>
        ) => void;
        setIsResetDistilleries: (isReset: boolean) => void;
        updateSortDistilleries: (sort: distillery.TDistillerySort) => void;
        updateFilterDistilleries: (
            filter: z.infer<typeof filterSchemaDistillery>
        ) => void;
        deleteTagDistilleries: ({
            id,
            type,
        }: {
            id: string;
            type: distillery.TDistilleryFilter["value"];
        }) => z.infer<typeof filterSchemaDistillery>;
        clearTagsDistilleries: () => void;
        clearSortDistilleries: () => void;
        clearFilterDistilleries: () => void;
        clearAllDistilleries: () => void;
    };
    type TAuth = {
        user: auth.TUserSchema | null;
        isLogin: boolean;
        currentStep: number;
        totalStep: number;
        isBackAction: boolean;
        setCurrentStepLogin: (step: number, isBackAction?: boolean) => void;
        setTotalStep: (step: number) => void;
        nextStep: () => void;
        prevStep: () => void;
        setMyUser: (
            user: (auth.TUserSchema & { isLogin?: boolean }) | null
        ) => void;
        reset: () => void;
    };
    // type TDistilleries = {
    //     // isReset: boolean;
    //     // distilleries: global.TDataWithPagination<distillery.TDistillery[]>;
    //     // tags: distillery.TDistilleryFilter[];
    //     // sortDistilleries?: distillery.TDistillerySort;
    //     // filterDistilleries: z.infer<typeof filterSchemaCask>;
    // };

    type TAccountStore = {
        // Data state
        profile: stripe.TAccountProfile | null;
        persons: stripe.TPerson[];
        personCurrentId: string | null;
        // Loading states
        isLoading: boolean;
        isLoadingPersons: boolean;
        isSubmitting: boolean;

        // Modal state
        isModalOpen: boolean;
        editModal: TEditModalType | null;

        // Error state
        error: string | null;
        setPersonCurrentId: (personCurrentId: string) => void;
        setSubmitting: (submitting: boolean) => void;

        // Modal actions
        openModal: (modalType: TEditModalType, personId?: string) => void;
        closeModal: () => void;

        // Reset
        reset: () => void;
    };

    type TAccountFormData =
        | BusinessInfoFormValues
        | ProfessionalDetailsFormValues
        | PublicDetailsFormValues
        | PersonalDetailsFormValues
        | CompanyDetailsFormValues;

    type TAccountContext = TAccountStore & {
        // API actions are supplied by AccountProvider's React Query instances.
        fetchProfile: () => Promise<void>;
        fetchPersons: () => Promise<void>;
        submitForm: (formData: TAccountFormData) => Promise<unknown>;

        // Mutation actions
        submitFormMutation?: unknown; // The actual mutation object from TanStack Query
    };
}
