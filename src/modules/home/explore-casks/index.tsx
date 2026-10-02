"use client";

import CaskListSection from "@/components/shared/cask-list-section";
import useResponsive from "@/hooks/useResponsive";
import { EXPLORE_CASK_FILTERS } from "@/lib/constants";
import { useEffect, useMemo, useState } from "react";

const ExploreCasks = ({
    isMobile: isMobileSSR,
    isTablet: isTabletSSR,
}: {
    isMobile: boolean;
    isTablet: boolean;
}) => {
    const responsive = useResponsive();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isMobile = isMounted ? responsive.isMobile : isMobileSSR;
    const isTablet = isMounted ? responsive.isTablet : isTabletSSR;
    const isDesktop = !isMobile && !isTablet;

    const size = useMemo(() => {
        return isDesktop ? 12 : 6;
    }, [isDesktop]);

    const CASK_FILTERS = useMemo(() => {
        return EXPLORE_CASK_FILTERS.map((filter) => ({
            label: filter.label,
            value: `${filter.value}&size=${size}`,
        }));
    }, [size]);

    return (
        <CaskListSection
            size={size}
            title="Explore Casks"
            subTitle="Most-watched casks by investors"
            filters={CASK_FILTERS}
            defaultFilter={CASK_FILTERS[0].value}
        />
    );
};

export default ExploreCasks;
