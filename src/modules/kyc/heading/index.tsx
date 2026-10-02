type THeadingKyc = {
    title: string;
    description?: string;
};

export default function HeadingKyc(props: THeadingKyc) {
    const { title, description } = props;
    return (
        <div className="flex flex-col gap-6">
            <h2 className="text-center text-2xl font-medium capitalize text-typo-primary">
                {title}
            </h2>
            {description && (
                <p className="text-base font-medium capitalize text-typo-primary">
                    {description}
                </p>
            )}
        </div>
    );
}
