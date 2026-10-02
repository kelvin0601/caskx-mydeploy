import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { TWO_FA_KEYS } from "@/lib/constants/key";
import { authWith2Fa } from "@/services/auth-2fa";
import { useQuery } from "@tanstack/react-query";
import { TStepType } from "..";
import { ItemTwoFa } from "../item-two-fa";
import { useStoreDialogWrap } from "../provider/security-dialog-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { HeaderSkeleton } from "../skeleton/header-skeleton";

const TEXTS = {
    TITLE: "Keep your account secure",
    TITLE_AUTH_ACTIVE: "Two-factor authentication is on",
    DESCRIPTION:
        "Two-factor authentication protects your account by requiring an additional code when you log in on a device that we don't recognise.",
    DESCRIPTION_AUTH_ACTIVE:
        "We'll now ask for a login code whenever you log in on a device that we don't recognise.",
    CHOOSE_METHOD: "Choose your security method",
    CHOOSE_METHOD_AUTH_ACTIVE: "How you get login codes",
    BACKUP_METHOD: "Add a backup method",
} as const;

export const AUTH_OPTIONS: {
    [key: string]: {
        title: string;
        description: string;
        isRecommended: boolean;
        step: TStepType;
        step_active: TStepType;
    };
} = {
    GOOGLE: {
        title: "Authenticator App",
        description: "You'll get a login code from your authenticator app",
        isRecommended: true,
        step: "setupGoogleAuth",
        step_active: "setupGoogleAuthActive",
    },
    SMS: {
        title: "SMS Authentication",
        description: "We'll send a code to your registered phone number",
        isRecommended: false,
        step: "setupSMSAuth",
        step_active: "setupSMSAuthActive",
    },
} as const;

export const FormChooseTwoFa = () => {
    const { setStep } = useStoreDialogWrap();
    const { user, setMyUser } = useAuth();

    const statusGoogleAuthQuery = useQuery({
        queryKey: [TWO_FA_KEYS.STATUS],
        queryFn: authWith2Fa.status2FaDevices,
    });

    const isApp = user?.isGoogleAuth;
    const isSms = user?.isSMSAuth;
    const isEnabled = user?.isGoogleAuth || user?.isSMSAuth;

    if (statusGoogleAuthQuery.isLoading) return <FormChooseTwoFaSkeleton />;

    // Check if user has exactly one auth method
    const shouldShowBackupText = () => {
        const isActiveText = [isSms, isApp].filter(Boolean).length === 1;

        return isActiveText ? (
            <div className="text-sm font-semibold normal-case text-typo-primary">
                {TEXTS.BACKUP_METHOD}
            </div>
        ) : null;
    };

    const renderAuthOptions = () => {
        // Case 1: User has SMS but not Google
        if (isSms && !isApp) {
            return (
                <div className="flex flex-col gap-5">
                    <ItemTwoFa
                        {...AUTH_OPTIONS.SMS}
                        onClick={() => {
                            setStep(
                                isSms
                                    ? AUTH_OPTIONS.SMS.step_active
                                    : AUTH_OPTIONS.SMS.step
                            );
                        }}
                    />
                    <div className="flex flex-col gap-2">
                        {shouldShowBackupText()}
                        <ItemTwoFa
                            {...AUTH_OPTIONS.GOOGLE}
                            onClick={() => {
                                setStep(
                                    isApp
                                        ? AUTH_OPTIONS.GOOGLE.step_active
                                        : AUTH_OPTIONS.GOOGLE.step
                                );
                            }}
                        />
                    </div>
                </div>
            );
        }
        if ((!isSms && !isApp) || (isApp && isSms)) {
            return (
                <div className="flex flex-col gap-2">
                    <ItemTwoFa
                        {...AUTH_OPTIONS.GOOGLE}
                        onClick={() => {
                            setStep(
                                isApp
                                    ? AUTH_OPTIONS.GOOGLE.step_active
                                    : AUTH_OPTIONS.GOOGLE.step
                            );
                        }}
                    />
                    <div className="flex flex-col gap-2">
                        {shouldShowBackupText()}
                        <ItemTwoFa
                            {...AUTH_OPTIONS.SMS}
                            onClick={() => {
                                setStep(
                                    isSms
                                        ? AUTH_OPTIONS.SMS.step_active
                                        : AUTH_OPTIONS.SMS.step
                                );
                            }}
                        />
                    </div>
                </div>
            );
        }

        // Case 2: Default case - show Google first
        return (
            <div className="flex flex-col gap-6">
                <ItemTwoFa
                    {...AUTH_OPTIONS.GOOGLE}
                    onClick={() => {
                        setStep(
                            isApp
                                ? AUTH_OPTIONS.GOOGLE.step_active
                                : AUTH_OPTIONS.GOOGLE.step
                        );
                    }}
                />
                <div className="flex flex-col gap-2">
                    {shouldShowBackupText()}
                    <ItemTwoFa
                        {...AUTH_OPTIONS.SMS}
                        onClick={() => {
                            setStep(
                                isSms
                                    ? AUTH_OPTIONS.SMS.step_active
                                    : AUTH_OPTIONS.SMS.step
                            );
                        }}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-8 mb:gap-6">
            <DialogHeader className="border-none pb-0 text-center">
                <div className="flex w-full flex-col items-center gap-2">
                    <DialogTitle className="text-center font-reckless text-xl font-medium text-typo-primary mb:text-lg">
                        {isEnabled ? TEXTS.TITLE_AUTH_ACTIVE : TEXTS.TITLE}
                    </DialogTitle>
                    <DialogDescription className="text-center text-sm text-typo-soft">
                        {isEnabled
                            ? TEXTS.DESCRIPTION_AUTH_ACTIVE
                            : TEXTS.DESCRIPTION}
                    </DialogDescription>
                </div>
            </DialogHeader>

            <div className="flex flex-col gap-2">
                {isEnabled && (
                    <div className="text-sm font-semibold text-typo-primary">
                        {TEXTS.CHOOSE_METHOD_AUTH_ACTIVE}
                    </div>
                )}
                <div className="flex flex-col gap-2">{renderAuthOptions()}</div>
            </div>
        </div>
    );
};

export const FormChooseTwoFaSkeleton = () => {
    return (
        <div className="flex flex-col gap-4">
            <HeaderSkeleton />
            <div className="flex flex-col gap-5">
                <Skeleton className="h-2 w-1/4" />
                <Skeleton className="flex w-full flex-row items-center justify-between p-4">
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-2 w-1/2 bg-bg-sf2" />
                        <Skeleton className="h-2 w-1/4 bg-bg-sf2" />
                    </div>
                </Skeleton>
                <Skeleton className="flex w-full flex-row items-center justify-between p-4">
                    <div className="flex flex-1 flex-col gap-2">
                        <Skeleton className="h-2 w-1/2 bg-bg-sf2" />
                        <Skeleton className="h-2 w-1/4 bg-bg-sf2" />
                    </div>
                </Skeleton>
            </div>
        </div>
    );
};
