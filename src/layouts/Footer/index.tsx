import ImagePreload from "@/components/shared/image-preload";
import LinkCustom from "@/components/shared/link-custom";
import { APP_NAME, ROUTE_PUBLIC } from "@/lib/constants";

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const ICON_COMPANY = [
        {
            src: "/icons/company/company-logo-1.png",
            alt: "company logo 1",
        },
        {
            src: "/icons/company/company-logo-2.png",
            alt: "company logo 2",
        },
        {
            src: "/icons/company/company-logo-3.png",
            alt: "company logo 3",
        },
        {
            src: "/icons/company/company-logo-4.png",
            alt: "company logo 4",
        },
    ];
    return (
        <footer className="bg-bg-dark-main">
            <div className="container grid grid-cols-12 pt-20 tb:grid-cols-6 tb:pt-[3.75rem] mb:grid-cols-4 mb:pt-[3.75rem]">
                <div className="col-start-2 col-end-4 tb:col-start-1 tb:col-end-3 tb:max-w-[11.0625rem] mb:col-start-1 mb:col-end-3 mb:mb-4">
                    <ImagePreload
                        alt="Logo"
                        src={"/images/logo-full-fx.png"}
                        width={440}
                        height={40}
                        className="img-w"
                    />
                </div>
                <div className="col-start-8 col-end-12 tb:col-start-3 tb:-col-end-1 j-tb:pl-24 mb:col-start-1 mb:-col-end-1">
                    <div className="mb-5 text-sm text-typo-dark-sub j-tb:mb-0">
                        Investing in whiskey casks involves risks, including
                        market fluctuations, regulatory changes, evaporation
                        loss, and limited resale options. Cask Exchange makes no
                        guarantees on future profits and is not obligated to
                        update forward-looking statements.
                    </div>
                    {/* <div className="flex flex-row gap-8">
                        {ICON_COMPANY.map((icon, index) => {
                            return (
                                <ImagePreload
                                    key={index}
                                    src={icon.src}
                                    className="h-6 w-auto flex-shrink-0"
                                    alt={icon.alt}
                                    width={100}
                                    height={100}
                                />
                            );
                        })}
                    </div> */}
                </div>
                <div className="z-0 col-span-12 col-start-2 mt-16 flex flex-row justify-between border-t border-[#43464A]/30 py-5 tb:col-span-8 tb:mt-12 mb:col-span-4 mb:col-start-1 mb:-col-end-1 mb:mt-0 mb:flex-col-reverse mb:gap-4">
                    <div className="flex-center text-xs text-typo-dark-disable mb:mr-auto">
                        Copyright © &nbsp;
                        <span className="uppercase">
                            {APP_NAME} PLATFORM
                        </span>, {currentYear}
                    </div>
                    <div className="flex flex-row items-center gap-4">
                        {/* <p className="hover-line text-sm !text-typo-dark-disable mb:text-xs">
                            Privacy Policy
                        </p> */}
                        <LinkCustom href={ROUTE_PUBLIC.TERMS_OF_USE_BUYER}>
                            <p className="hover-line text-sm !text-typo-dark-disable mb:text-xs">
                                Buyer Terms of Use
                            </p>
                        </LinkCustom>
                        <LinkCustom href={ROUTE_PUBLIC.TERMS_OF_USE_SUPPLIER}>
                            <p className="hover-line text-sm !text-typo-dark-disable mb:text-xs">
                                Supplier Terms of Use
                            </p>
                        </LinkCustom>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export { default as FooterV2 } from "./FooterV2";
export default Footer;
