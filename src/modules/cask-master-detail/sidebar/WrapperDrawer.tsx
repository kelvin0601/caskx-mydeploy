import DrawerWrapper from "@/components/shared/drawer-wrapper";
import { useCaskDetail } from "../provider";

type TWrapperDrawer = {
    title: string;
    children: React.ReactNode;
    footer: React.ReactNode;
    isLoading?: boolean;
};

export default function WrapperDrawer(props: TWrapperDrawer) {
    const { children, title, footer, isLoading } = props;
    const { drawerCurrent, isDrawerLoading } = useCaskDetail();

    if (!drawerCurrent) return null;

    return (
        <DrawerWrapper
            title={title}
            footer={footer}
            contentKey={drawerCurrent}
            isLoading={isLoading ?? isDrawerLoading}
        >
            {children}
        </DrawerWrapper>
    );
}
