import IconLoading from "@/components/shared/icons/icon-loading";

export default function CredentialsVerifying() {
    return (
        <div className="flex w-full select-none flex-col items-center justify-center text-center">
            <div className="mb-10 flex flex-col gap-2">
                <h2 className="font-reckless text-xl font-medium text-typo-primary tb:text-lg">
                    Verifying
                </h2>
                <p className="font-inter text-sm text-typo-soft">
                    This may take a little while, please wait a moment.
                </p>
            </div>
            <div className="flex size-12 origin-center items-center justify-center">
                <IconLoading />
            </div>
        </div>
    );
}
