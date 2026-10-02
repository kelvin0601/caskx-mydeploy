import { TMenuNavigation } from "@/lib/constants";
import MenuItem from "./menu-item";

export function Menu({ menuItems }: { menuItems: TMenuNavigation[] }) {
    return (
        <div className="flex w-max flex-row items-center gap-4">
            {menuItems.map((item, index) => {
                const isNavigationMenu =
                    item?.subItems && item?.subItems?.length > 0;

                return (
                    <div key={item.title} className="flex items-center gap-4">
                        <MenuItem
                            {...item}
                            isNavigationMenu={isNavigationMenu}
                            className="text-sm font-normal text-typo-dark-sub transition-colors hover:text-typo-dark-primary"
                        />
                        {index < menuItems.length - 1 && (
                            <div className="select-none text-sm font-normal uppercase leading-4 text-bd-brown">
                                |
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
