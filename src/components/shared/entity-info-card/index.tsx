import React from "react";

export type TEntityInfoField = {
    label: string;
    value: React.ReactNode;
};

export type TEntityInfoCardProps = {
    title?: string;
    fields: TEntityInfoField[];
    onEdit?: () => void;
    className?: string;
};

const EntityInfoCard: React.FC<TEntityInfoCardProps> = ({
    title,
    fields,
    onEdit,
    className = "",
}) => {
    return (
        <div
            className={`bg-white rounded-lg border p-6 shadow-sm ${className}`}
        >
            {title && (
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="text-gray-600 text-sm hover:underline focus:outline-none"
                            type="button"
                        >
                            Edit
                        </button>
                    )}
                </div>
            )}
            <div className="space-y-2">
                {fields.map((field, idx) => (
                    <div key={idx} className="flex text-sm">
                        <div className="text-gray-500 w-40 shrink-0">
                            {field.label}
                        </div>
                        <div className="text-gray-900">{field.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EntityInfoCard;
