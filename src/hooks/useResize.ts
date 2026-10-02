import { createMedia } from "@artsy/fresnel";

const AppMedia = createMedia({
    breakpoints: {
        xs: 0,
        sm: 768,
        desktop: 1024,
        desktopXL: 1200,
        desktop2XL: 1400,
    },
});
// Make styles for injection into the header of the page
export const mediaStyles = AppMedia.createMediaStyle();

export const { Media, MediaContextProvider } = AppMedia;
