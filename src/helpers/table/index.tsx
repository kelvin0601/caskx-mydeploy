import React from "react";
type TMappingContent<Row extends Record<string, unknown>> = {
    [key: string]: {
        render: (row: Row) => React.ReactNode;
    };
};

export function buildGetCellRenderer<Row extends Record<string, unknown>>(
    mapping: TMappingContent<Row>
) {
    return (key: string) => {
        return (
            mapping[key]?.render ||
            ((row: Row) => (
                <div className="text-sm text-typo-soft">
                    {row[key as keyof Row] as string}
                </div>
            ))
        );
    };
}

export function renderCellFromMapping<Row extends Record<string, unknown>>(
    mapping: TMappingContent<Row>,
    key: string,
    row: Row
) {
    const getCellRenderer = buildGetCellRenderer<Row>(mapping);
    const CellRenderer = getCellRenderer(key);
    return CellRenderer(row) as React.ReactNode;
}
