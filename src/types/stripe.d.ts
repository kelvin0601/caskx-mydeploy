import { KEY_FORM_MAP } from "@/store/account";
declare namespace stripe {
    type TEditMode = (typeof KEY_FORM_MAP)[keyof typeof KEY_FORM_MAP];
    type TCreateAccount = {
        sellerId: string;
        userId: string;
        email: string;
        country: string;
    };
    type TAccount = {
        id: string;
        sellerId: string;
        userId: string;
        email: string;
        country: string;
    };
    type TAccountInfo = {
        accountId: string;
        onboardingRequired: boolean;
        success: boolean;
    };
    type TStripeAccount = {
        id: string;
        hasStripeAccount: boolean;
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        requirements: TRequirements;
    };
    type TRequirements = {
        currentlyDue: string[];
        eventuallyDue: string[];
        pastDue: string[];
        pendingVerification: unknown[];
        errors?: Array<{ requirement: string; reason: string; code: string }>;
    };
    type TBusinessType = "individual" | "company" | "nonprofit";
    type TAccountProfile = {
        id: string;
        businessType: TBusinessType;
        country: string;
        email: string;
        detailsSubmitted: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        requirements: TRequirements;
        businessProfile: TBusinessProfile;
        company: TCompany;
        rawStripeData: TStripeAccountRaw;
        individual: TIndividual;
        lastUpdated: string;
        tos_acceptance?: TStripeTosAcceptance;
    };
    type TBusinessProfile = {
        name: string;
        businessType: string;
        url: string;
        supportEmail: string;
        supportPhone: string;
        mcc: string;
    };
    type TCompany = {
        name: string;
        address: TAddress;
        phone: string;
        taxId: string;
        taxIdRegEx: string;
        taxIdRegExMessage: string;
        structure: string;
        country: string;
        taxIdRegExMessage: string;
    };
    type TIndividual = {
        firstName: string;
        lastName: string;
        email: string;
        dob: {
            day: number;
            month: number;
            year: number;
        };
        address: TAddress;
        phone: string;
        ssnLast4: string;
        verification: {
            document: {
                back: string;
                front: string;
            };
        };
    };
    type TMetadata = {
        created_at: string;
        onboarding_source: string;
        platform_user_id: string;
        seller_id: string;
        lastUpdated: string;
    };

    type TStripeBusinessProfile = {
        annual_revenue: number | null;
        estimated_worker_count: number | null;
        mcc: string;
        minority_owned_business_designation: string | null;
        name: string;
        support_address: string | null;
        support_email: string;
        support_phone: string | null;
        support_url: string | null;
        url: string;
    };

    type TStripeCapabilities = {
        card_payments: "active" | "inactive" | "pending";
        transfers: "active" | "inactive" | "pending";
    };

    type TStripeControllerFees = {
        payer: "application_express" | "application";
    };

    type TStripeControllerLosses = {
        payments: "application" | "stripe";
    };

    type TStripeControllerDashboard = {
        type: "express" | "standard";
    };

    type TStripeController = {
        fees: TStripeControllerFees;
        is_controller: boolean;
        losses: TStripeControllerLosses;
        requirement_collection: "stripe" | "application";
        stripe_dashboard: TStripeControllerDashboard;
        type: "application" | "platform";
    };

    type TStripeBankAccount = {
        id: string;
        object: "bank_account";
        account: string;
        account_holder_name: string | null;
        account_holder_type: "individual" | "company" | null;
        account_type: "checking" | "savings" | null;
        available_payout_methods: ("standard" | "instant")[];
        bank_name: string;
        country: string;
        currency: string;
        default_for_currency: boolean;
        fingerprint: string;
        future_requirements: TStripeRequirements;
        last4: string;
        metadata: Record<string, string>;
        requirements: TStripeRequirements;
        routing_number: string;
        status:
            | "new"
            | "validated"
            | "verified"
            | "verification_failed"
            | "errored";
    };

    type TStripeRequirements = {
        alternatives: string[];
        current_deadline: number | null;
        currently_due: string[];
        disabled_reason: string | null;
        errors: unknown[];
        eventually_due: string[];
        past_due: string[];
        pending_verification: string[];
    };

    type TStripeExternalAccounts = {
        object: "list";
        data: TStripeBankAccount[];
        has_more: boolean;
        total_count: number;
        url: string;
    };

    type TStripeIndividual = {
        id: string;
        object: "person";
        account: string;
        created: number;
        email: string;
        first_name: string;
        last_name: string;
        dob: {
            day: number;
            month: number;
            year: number;
        };
        relationship: {
            authorizer: boolean;
            director: boolean;
            executive: boolean;
            legal_guardian: boolean;
            owner: boolean;
            percent_ownership: number | null;
            representative: boolean;
            title: string | null;
        };
        ssn_last_4_provided?: boolean;
        verification?: TPersonVerification;
    };

    type TStripeLoginLinks = {
        object: "list";
        data: unknown[];
        has_more: boolean;
        total_count: number;
        url: string;
    };

    type TStripeSettingsBacsDebitPayments = {
        display_name: string | null;
        service_user_number: string | null;
    };

    type TStripeSettingsBranding = {
        icon: string;
        logo: string;
        primary_color: string;
        secondary_color: string;
    };

    type TStripeSettingsCardIssuing = {
        tos_acceptance: {
            date: number | null;
            ip: string | null;
        };
    };

    type TStripeSettingsCardPayments = {
        decline_on: {
            avs_failure: boolean;
            cvc_failure: boolean;
        };
        statement_descriptor_prefix: string;
        statement_descriptor_prefix_kana: string | null;
        statement_descriptor_prefix_kanji: string | null;
    };

    type TStripeSettingsDashboard = {
        display_name: string;
        timezone: string;
    };

    type TStripeSettingsInvoices = {
        default_account_tax_ids: string[] | null;
        hosted_payment_method_save: "off" | "offer" | "require";
    };

    type TStripeSettingsPayments = {
        statement_descriptor: string;
        statement_descriptor_kana: string | null;
        statement_descriptor_kanji: string | null;
    };

    type TStripeSettingsPayouts = {
        debit_negative_balances: boolean;
        schedule: {
            delay_days: number;
            interval: "daily" | "manual" | "monthly" | "weekly";
        };
        statement_descriptor: string | null;
    };

    type TStripeSettingsSepaDebitPayments = Record<string, unknown>;

    type TStripeSettings = {
        bacs_debit_payments: TStripeSettingsBacsDebitPayments;
        branding: TStripeSettingsBranding;
        card_issuing: TStripeSettingsCardIssuing;
        card_payments: TStripeSettingsCardPayments;
        dashboard: TStripeSettingsDashboard;
        invoices: TStripeSettingsInvoices;
        payments: TStripeSettingsPayments;
        payouts: TStripeSettingsPayouts;
        sepa_debit_payments: TStripeSettingsSepaDebitPayments;
    };

    type TStripeTosAcceptance = {
        date: number;
        ip?: string;
        user_agent?: string;
    };

    type TStripeAccountRaw = {
        id: string;
        object: "account";
        business_profile: TStripeBusinessProfile;
        business_type: "individual" | "company" | "nonprofit";
        capabilities: TStripeCapabilities;
        charges_enabled: boolean;
        company: TCompany;
        controller: TStripeController;
        country: string;
        created: number;
        default_currency: string;
        details_submitted: boolean;
        email: string;
        external_accounts: TStripeExternalAccounts;
        future_requirements: TStripeRequirements;
        individual: TStripeIndividual;
        login_links: TStripeLoginLinks;
        metadata: TMetadata;
        payouts_enabled: boolean;
        requirements: TStripeRequirements;
        settings: TStripeSettings;
        tos_acceptance: TStripeTosAcceptance;
        type: "express" | "standard" | "custom";
    };

    export type TPayoutExternalAccount = {
        id: string;
        object?: string;
        accountHolderName?: string;
        accountHolderType?: "individual" | "company";
        bankName?: string;
        country?: string;
        currency?: string;
        fingerprint?: string;
        last4?: string;
        routingNumber?: string;
        status?:
            | "new"
            | "validated"
            | "verified"
            | "verification_failed"
            | "errored"
            | string;
        default?: boolean;
        metadata?: Record<string, string>;
    };

    export type TPayout = {
        accountId?: string;
        enabled?: boolean;
        payoutsEnabled?: boolean;

        // Payout Schedule
        payoutSchedule?: {
            interval: "manual" | "daily" | "weekly" | "monthly";
            weeklyAnchor?:
                | "monday"
                | "tuesday"
                | "wednesday"
                | "thursday"
                | "friday";
            monthlyAnchor?: number;
            delayDays: number;
        };
        schedule?: {
            interval?: string;
            weeklyAnchor?: string;
            monthlyAnchor?: number;
            delayDays?: number;
        };

        // External Accounts (Bank Accounts)
        externalAccounts?: Array<TPayoutExternalAccount>;
        external_accounts?: Array<TPayoutExternalAccount>;
        bankAccounts?: Array<TPayoutExternalAccount>;

        // Balance Information
        balance?: {
            available: Array<{
                amount: number;
                currency: string;
            }>;
            pending: Array<{
                amount: number;
                currency: string;
            }>;
        };

        // Latest Payout
        latestPayout?: {
            id: string;
            amount: number;
            currency: string;
            created: number;
            description?: string;
            destination: string;
            failureCode?: string;
            failureMessage?: string;
            livemode: boolean;
            method: "standard" | "instant";
            sourceType: "bank_account" | "card" | "fpx";
            status: "paid" | "pending" | "in_transit" | "canceled" | "failed";
            type: "bank_account" | "card";
        };
    };

    type TPersonAddress = {
        city: string;
        country: string;
        line1?: string;
        line2?: string;
        postal_code?: string;
        state: string;
        postalCode?: string;
    };

    type TPersonDob = {
        day: number;
        month: number;
        year: number;
    };

    type TPersonTosAcceptance = {
        date: number | null;
        ip: string | null;
        user_agent: string | null;
    };

    type TPersonAdditionalTosAcceptances = {
        account: TPersonTosAcceptance;
    };

    type TPersonRequirements = {
        alternatives: string[];
        currently_due: string[];
        errors: unknown[];
        eventually_due: string[];
        past_due: string[];
        pending_verification: string[];
    };

    type TPersonRelationship = {
        authorizer?: boolean;
        director?: boolean;
        executive?: boolean;
        legal_guardian?: boolean;
        owner?: boolean;
        percent_ownership?: number | null;
        representative?: boolean;
        title?: string | null;
    };

    type TPersonDocument = {
        back: string | null;
        details: string | null;
        details_code: string | null;
        front: string | null;
    };

    type TPersonVerification = {
        additional_document: TPersonDocument;
        details: string;
        details_code: string;
        document: TPersonDocument;
        status: "unverified" | "pending" | "verified";
    };

    export type TPerson = {
        id: string;
        object: "person";
        account: string;
        additional_tos_acceptances: TPersonAdditionalTosAcceptances;
        address: TPersonAddress;
        created: string | number; // Can be string date or unix timestamp
        dob: TPersonDob | string; // Can be object or string format
        email: string;
        first_name: string;
        future_requirements: TPersonRequirements;
        id_number_provided: boolean;
        last_name: string;
        metadata: Record<string, unknown>;
        phone: string;
        relationship: TPersonRelationship;
        requirements: TPersonRequirements;
        ssn_last_4_provided: boolean;
        ssn_last_4?: string;
        verification: TPersonVerification;
    };

    export type TPersonsResponse = {
        success: boolean;
        persons: TPerson[];
    };

    type TCreatePerson = {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        dateOfBirth: string;
        ssnLast4: string;
        address: {
            line1: string;
            line2: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        relationship: {
            owner: true;
            percentOwnership: number;
            executive: boolean;
            representative: boolean;
            title: string;
        };
        verification: {
            document: string;
            additionalVerification: {
                additional_info: string;
            };
        };
    };
}
