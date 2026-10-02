# CODEMAP

Generated: 1 Oct 2026, 19:03
Commit: 4bdfd599 (dirty)
Regenerate: npm run codemap

This file is generated from the current repo tree. Read it first when you need orientation, then open the source files it points to.

## App Routes

### Payload

- `/cms-admin/[[...segments]]` — `src/app/(payload)/cms-admin/[[...segments]]/page.tsx`

### Site

- `/admin/listing/cask-type` — `src/app/(site)/(admin)/admin/listing/cask-type/page.tsx` | module: `src/modules/dashboard/listing-cask-type`
- `/admin/listing/cask/[id]` — `src/app/(site)/(admin)/admin/listing/cask/[id]/page.tsx` | module: `src/modules/dashboard/listing-cask/edit_v2`
- `/admin/listing/cask/add` — `src/app/(site)/(admin)/admin/listing/cask/add/page.tsx` | module: `src/modules/dashboard/listing-cask/add_v2`
- `/admin/listing/cask` — `src/app/(site)/(admin)/admin/listing/cask/page.tsx` | module: `src/modules/dashboard/listing-cask`
- `/admin/listing/classification` — `src/app/(site)/(admin)/admin/listing/classification/page.tsx` | module: `src/modules/dashboard/listing-classification`
- `/admin/listing/distillery/[id]` — `src/app/(site)/(admin)/admin/listing/distillery/[id]/page.tsx` | module: `src/modules/dashboard/listing-distillery/edit`
- `/admin/listing/distillery/add` — `src/app/(site)/(admin)/admin/listing/distillery/add/page.tsx` | module: `src/modules/dashboard/listing-distillery/add`
- `/admin/listing/distillery` — `src/app/(site)/(admin)/admin/listing/distillery/page.tsx` | module: `src/modules/dashboard/listing-distillery`
- `/admin/listing/metadata` — `src/app/(site)/(admin)/admin/listing/metadata/page.tsx` | module: `src/modules/dashboard/metadata-management`
- `/admin/orders/documents` — `src/app/(site)/(admin)/admin/orders/documents/page.tsx`
- `/admin/orders/payments/[id]` — `src/app/(site)/(admin)/admin/orders/payments/[id]/page.tsx` | module: `src/modules/dashboard/payments/payments-detail`
- `/admin/orders/payments` — `src/app/(site)/(admin)/admin/orders/payments/page.tsx` | module: `src/modules/dashboard/payments`
- `/admin/orders/payouts/[id]` — `src/app/(site)/(admin)/admin/orders/payouts/[id]/page.tsx` | module: `src/modules/dashboard/payout/payouts-detail`
- `/admin/orders/payouts` — `src/app/(site)/(admin)/admin/orders/payouts/page.tsx` | module: `src/modules/dashboard/payout`
- `/admin` — `src/app/(site)/(admin)/admin/page.tsx`
- `/forgot-password` — `src/app/(site)/(auth)/forgot-password/page.tsx` | module: `src/modules/forgot-password`
- `/log-in` — `src/app/(site)/(auth)/log-in/page.tsx` | module: `src/modules/login`
- `/reset-password` — `src/app/(site)/(auth)/reset-password/page.tsx` | module: `src/modules/reset-password`
- `/sign-up` — `src/app/(site)/(auth)/sign-up/page.tsx` | module: `src/modules/signup`
- `/verify-user` — `src/app/(site)/(auth)/verify-user/page.tsx` | module: `src/modules/verify`
- `/checkout/[sessionId]/[slug]` — `src/app/(site)/(checkout)/checkout/[sessionId]/[slug]/page.tsx` | module: `src/modules/checkoutv2/pages/OrderCancelled`
- `/checkout/[sessionId]` — `src/app/(site)/(checkout)/checkout/[sessionId]/page.tsx`
- `/_mobile-not-supported` — `src/app/(site)/(empty)/_mobile-not-supported/page.tsx`
- `/docusign/return/ask/[id]` — `src/app/(site)/(empty)/docusign/return/ask/[id]/page.tsx`
- `/docusign/return/bid/[id]` — `src/app/(site)/(empty)/docusign/return/bid/[id]/page.tsx`
- `/_checkout/[sessionId]/[slug]` — `src/app/(site)/(root)/_checkout/[sessionId]/[slug]/page.tsx` | module: `src/modules/_checkout/pages/OwnershipTransfer`
- `/_checkout/[sessionId]/complete` — `src/app/(site)/(root)/_checkout/[sessionId]/complete/page.tsx`
- `/_checkout/[sessionId]` — `src/app/(site)/(root)/_checkout/[sessionId]/page.tsx`
- `/_checkout` — `src/app/(site)/(root)/_checkout/page.tsx`
- `/buying/bids` — `src/app/(site)/(root)/(manage-cask)/buying/bids/page.tsx` | module: `src/modules/mange-cask/buying`
- `/buying/payments` — `src/app/(site)/(root)/(manage-cask)/buying/payments/page.tsx` | module: `src/modules/mange-cask/payments`
- `/selling/asks` — `src/app/(site)/(root)/(manage-cask)/selling/asks/page.tsx` | module: `src/modules/mange-cask/selling`
- `/distillery/[id]` — `src/app/(site)/(root)/distillery/[id]/page.tsx` | module: `src/modules/distillery-detail`
- `/distillery` — `src/app/(site)/(root)/distillery/page.tsx` | module: `src/modules/distilleries`
- `/marketplace/[id]` — `src/app/(site)/(root)/marketplace/[id]/page.tsx` | module: `src/modules/cask-master-detail`
- `/marketplace` — `src/app/(site)/(root)/marketplace/page.tsx` | module: `src/modules/cask-listing`
- `/notifications` — `src/app/(site)/(root)/notifications/(inbox)/page.tsx` | module: `src/modules/notification-inbox`
- `/` — `src/app/(site)/(root)/page.tsx` | module: `src/modules/home`
- `/payout/[sessionId]` — `src/app/(site)/(root)/payout/[sessionId]/page.tsx` | module: `src/modules/profile-listing/detail`
- `/profile/listings/[askId]` — `src/app/(site)/(root)/profile/listings/[askId]/page.tsx`
- `/profile/listings` — `src/app/(site)/(root)/profile/listings/page.tsx` | module: `src/modules/profile/listings`
- `/profile/offer/[bidId]` — `src/app/(site)/(root)/profile/offer/[bidId]/page.tsx` | module: `src/modules/profile-offer/detail`
- `/profile/offer` — `src/app/(site)/(root)/profile/offer/page.tsx` | module: `src/modules/profile/offer`
- `/resources/[topic]/[guide]` — `src/app/(site)/(root)/resources/[topic]/[guide]/page.tsx` | module: `src/modules/resources/components/resource-topic-guide-layout`
- `/resources/[topic]` — `src/app/(site)/(root)/resources/[topic]/page.tsx` | module: `src/modules/resources/utils/search-params`
- `/resources/faqs` — `src/app/(site)/(root)/resources/faqs/page.tsx` | module: `src/modules/resources/faqs`
- `/resources` — `src/app/(site)/(root)/resources/page.tsx` | module: `src/modules/resources/listing`
- `/resources/preview` — `src/app/(site)/(root)/resources/preview/page.tsx` | module: `src/modules/resources/faqs`
- `/search` — `src/app/(site)/(root)/search/page.tsx` | module: `src/modules/search-results`
- `/settings/account` — `src/app/(site)/(root)/settings/(profile)/account/page.tsx` | module: `src/modules/account`
- `/settings/notifications` — `src/app/(site)/(root)/settings/(profile)/notifications/page.tsx` | module: `src/modules/notifycation`
- `/settings` — `src/app/(site)/(root)/settings/(profile)/page.tsx` | module: `src/modules/account`
- `/settings/security` — `src/app/(site)/(root)/settings/(profile)/security/page.tsx` | module: `src/modules/security`
- `/settings/wallet` — `src/app/(site)/(root)/settings/(profile)/wallet/page.tsx` | module: `src/modules/wallet`
- `/settings/kyc` — `src/app/(site)/(root)/settings/(without-profile)/kyc/page.tsx` | module: `src/modules/kyc`
- `/settings/onboarding` — `src/app/(site)/(root)/settings/(without-profile)/onboarding/page.tsx`
- `/settings/stripe` — `src/app/(site)/(root)/settings/(without-profile)/stripe/page.tsx`
- `/terms-of-use/buyer` — `src/app/(site)/(root)/terms-of-use/buyer/page.tsx` | module: `src/modules/term-of-services`
- `/terms-of-use` — `src/app/(site)/(root)/terms-of-use/page.tsx`
- `/terms-of-use/supplier` — `src/app/(site)/(root)/terms-of-use/supplier/page.tsx` | module: `src/modules/term-of-services`
- `/design-system` — `src/app/(site)/design-system/page.tsx` | module: `src/modules/design-system`

## API Routes

- `/api-cms/[...slug]` — `src/app/(payload)/api-cms/[...slug]/route.ts`
- `/resources/preview/enter` — `src/app/(site)/(root)/resources/preview/enter/route.ts`
- `/api-fe/auth/[...nextauth]` — `src/app/api-fe/auth/[...nextauth]/route.ts`
- `/api-fe/cask-permitter` — `src/app/api-fe/cask-permitter/route.ts`
- `/api-fe/download` — `src/app/api-fe/download/route.ts`
- `/api-fe/proxy` — `src/app/api-fe/proxy/route.ts`
- `/api-fe/update-session` — `src/app/api-fe/update-session/route.ts`

## App Shells

- `src/app/(payload)/cms-admin/[[...segments]]/not-found.tsx`
- `src/app/(payload)/layout.tsx`
- `src/app/(site)/_loading.tsx`
- `src/app/(site)/(admin)/admin/listing/cask/layout.tsx`
- `src/app/(site)/(admin)/error.tsx`
- `src/app/(site)/(admin)/layout.tsx`
- `src/app/(site)/(auth)/error.tsx`
- `src/app/(site)/(auth)/layout.tsx`
- `src/app/(site)/(checkout)/checkout/[sessionId]/layout.tsx`
- `src/app/(site)/(checkout)/error.tsx`
- `src/app/(site)/(checkout)/layout.tsx`
- `src/app/(site)/(empty)/error.tsx`
- `src/app/(site)/(empty)/layout.tsx`
- `src/app/(site)/(root)/_checkout/[sessionId]/layout.tsx`
- `src/app/(site)/(root)/(manage-cask)/layout.tsx`
- `src/app/(site)/(root)/error.tsx`
- `src/app/(site)/(root)/layout.tsx`
- `src/app/(site)/(root)/notifications/(inbox)/layout.tsx`
- `src/app/(site)/(root)/notifications/layout.tsx`
- `src/app/(site)/(root)/payout/[sessionId]/layout.tsx`
- `src/app/(site)/(root)/profile/layout.tsx`
- `src/app/(site)/(root)/profile/offer/[bidId]/layout.tsx`
- `src/app/(site)/(root)/resources/error.tsx`
- `src/app/(site)/(root)/resources/not-found.tsx`
- `src/app/(site)/(root)/settings/(profile)/layout.tsx`
- `src/app/(site)/(root)/settings/(without-profile)/layout.tsx`
- `src/app/(site)/(root)/settings/(without-profile)/onboarding/layout.tsx`
- `src/app/(site)/(root)/settings/layout.tsx`
- `src/app/(site)/layout.tsx`
- `src/app/(site)/not-found.tsx`
- `src/app/global-error.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`

## Feature Modules

- `src/modules/_cask-detail/` — index.tsx; children: chart-history, content, fulfillment-preference-item, market-tab, order, +4 more
- `src/modules/_checkout/` — index.tsx; children: button-redirect-home, dialog-checkout, forms, pages, payment-manual, +3 more
- `src/modules/account/` — index.tsx; children: cards, forms
- `src/modules/cask-detail/` — empty folder
- `src/modules/cask-listing/` — index.tsx; children: action, banner, content, filter, list, +5 more
- `src/modules/cask-master-detail/` — index.tsx; children: _sidebar, chart-history, content, fulfillment-preference-item, market-tab, +5 more; files: use-trading-verification.ts
- `src/modules/checkoutv2/` — index.tsx; children: cask-summary-sidebar, checkout-layout-v2, checkout-progress-content, checkout-workspace, dialog-checkout-v2, +7 more
- `src/modules/dashboard/` — children: listing-cask, listing-cask-type, listing-classification, listing-distillery, metadata-management, +2 more
- `src/modules/design-system/` — index.tsx; children: buttons-tab, colors-tab, forms-tab, interactive-tab, typography-tab
- `src/modules/distilleries/` — index.tsx; children: action, banner, content, filter, list, +4 more
- `src/modules/distillery-detail/` — index.tsx; children: content, related, sidebar
- `src/modules/forgot-password/` — index.tsx
- `src/modules/home/` — index.tsx; children: banner, browse-category, explore-casks, home-sidebar, popular-distilleries, +3 more
- `src/modules/kyc/` — index.tsx; children: card-verfication, face-captured, heading, progress-bar, provider, +2 more
- `src/modules/login/` — index.tsx; children: provider
- `src/modules/mange-cask/` — index.tsx; children: alert, body-table, buying, dialog, empty-data, +6 more
- `src/modules/market-orders/` — index.ts; children: adapters, components, definitions, flow, flows, +2 more; files: constants.ts, query-keys.ts, types.ts, utils.ts
- `src/modules/notification-inbox/` — index.tsx; children: notification-header, notification-item, notification-list, notification-sidebar; files: cache.ts, mapping.ts, provider.tsx
- `src/modules/notifycation/` — index.tsx
- `src/modules/payout/` — index.tsx; children: dialog-checkout, forms, list-for-sale, pages, payout-details-card, +3 more
- `src/modules/portfolio/` — index.tsx
- `src/modules/profile/` — children: listings, offer
- `src/modules/profile-listing/` — children: detail
- `src/modules/profile-offer/` — children: detail
- `src/modules/reset-password/` — index.tsx
- `src/modules/resources/` — children: components, faqs, listing, preview, types, +1 more
- `src/modules/search-results/` — index.tsx; children: search-action-bar, search-results-grid, search-results-header
- `src/modules/security/` — index.tsx; children: password-form, section-title, security-content-item, security-item-reset-dialog, session-section, +1 more
- `src/modules/signup/` — index.tsx
- `src/modules/term-of-services/` — index.tsx; children: content, table-of-content; files: types.ts
- `src/modules/verify/` — index.tsx
- `src/modules/wallet/` — index.tsx; children: alert-wallet, card-wallet, dialog-wallet, forms, provider

## Shared Components

- `src/components/shared/animation/` — files: animate-expand-height.tsx, clip-path-transition.tsx
- `src/components/shared/auth/` — files: 2fa-credentials-sign-in.tsx, 2fa-sms-credentials-sign-in.tsx, credentials-footer.tsx, credentials-forgot-password-form.tsx, credentials-head.tsx, +7 more
- `src/components/shared/back-top/` — index.tsx
- `src/components/shared/boolean-radio-field/` — index.tsx
- `src/components/shared/breadcrumb/` — index.tsx
- `src/components/shared/cask-card/` — index.tsx
- `src/components/shared/cask-card-quantity/` — index.tsx
- `src/components/shared/cask-card-quantity-controls/` — index.tsx; README.md; files: AskControl.tsx, BidControl.tsx, ControlHeader.tsx, QuantityControl.tsx, SuggestionCards.tsx
- `src/components/shared/cask-filter-header/` — index.tsx
- `src/components/shared/cask-info-cell/` — index.tsx
- `src/components/shared/cask-info-drawer/` — index.tsx
- `src/components/shared/cask-info-stats/` — index.tsx
- `src/components/shared/cask-list-section/` — index.tsx
- `src/components/shared/cask-notfound/` — index.tsx
- `src/components/shared/cask-summary/` — index.tsx
- `src/components/shared/category-card/` — index.tsx
- `src/components/shared/chart/` — index.tsx
- `src/components/shared/checkout-status-panel/` — index.tsx
- `src/components/shared/count-badge/` — index.tsx
- `src/components/shared/data-chip/` — index.tsx
- `src/components/shared/distilleries-notfound/` — index.tsx
- `src/components/shared/distillery-card/` — index.tsx
- `src/components/shared/distillery-card-if/` — index.tsx
- `src/components/shared/drawer-wrapper/` — index.tsx
- `src/components/shared/empty-state/` — index.tsx
- `src/components/shared/entity-info-card/` — index.tsx
- `src/components/shared/filter-checkbox-group/` — index.tsx
- `src/components/shared/form-image-upload/` — index.tsx
- `src/components/shared/grid-overlay/` — index.tsx
- `src/components/shared/heading/` — index.tsx
- `src/components/shared/heading-settings/` — index.tsx
- `src/components/shared/hover-row/` — index.tsx
- `src/components/shared/icons/` — files: icon-ar-down-bold.tsx, icon-ar-down.tsx, icon-ar-right.tsx, icon-ar-up-bold.tsx, icon-ar-up.tsx, +114 more
- `src/components/shared/image-placeholder/` — index.tsx
- `src/components/shared/image-preload/` — index.tsx
- `src/components/shared/info-field/` — index.tsx
- `src/components/shared/info-row/` — index.tsx
- `src/components/shared/input-filter/` — index.tsx
- `src/components/shared/input-w-control/` — index.tsx
- `src/components/shared/insight-item/` — index.tsx
- `src/components/shared/item-action-w-ic/` — index.tsx
- `src/components/shared/item-security/` — index.tsx
- `src/components/shared/label-filter/` — index.tsx
- `src/components/shared/label-w-ic/` — index.tsx
- `src/components/shared/lable-card/` — index.tsx
- `src/components/shared/link-custom/` — index.tsx
- `src/components/shared/list-casks/` — index.tsx
- `src/components/shared/listing-cask-add-v2/` — index.tsx; files: AddNewVintageCard.tsx, CaskFormSkeleton.tsx, DeleteVintageDialog.tsx, DistillationDateField.tsx, FormVariantsGroup.tsx, +9 more
- `src/components/shared/market-activities/` — index.tsx
- `src/components/shared/market-table/` — index.tsx
- `src/components/shared/menu-chains/` — index.tsx
- `src/components/shared/missing-stripe-requirements/` — index.tsx
- `src/components/shared/mobile-not-supported/` — index.tsx
- `src/components/shared/mobile-order-card/` — index.tsx
- `src/components/shared/noise-overlay/` — index.tsx
- `src/components/shared/notification-dropdown/` — index.tsx
- `src/components/shared/notification-dropdown-item/` — index.tsx
- `src/components/shared/order-card/` — index.tsx
- `src/components/shared/order-card-w-variant/` — index.tsx
- `src/components/shared/order-detail-layout/` — index.tsx
- `src/components/shared/pagination-bar/` — index.tsx
- `src/components/shared/pagination-cask/` — index.tsx
- `src/components/shared/payment-step-card/` — index.tsx
- `src/components/shared/rank-badge/` — index.tsx
- `src/components/shared/read-more/` — index.tsx
- `src/components/shared/release-calendar/` — index.tsx
- `src/components/shared/route-error/` — index.tsx
- `src/components/shared/route-loading/` — index.tsx
- `src/components/shared/row-actions-dropdown/` — index.tsx
- `src/components/shared/scan/` — index.tsx
- `src/components/shared/scroll-area-with-fade/` — index.tsx
- `src/components/shared/search/` — index.tsx
- `src/components/shared/search-input/` — index.tsx
- `src/components/shared/sidebar-listing/` — index.tsx
- `src/components/shared/slide-transition/` — index.tsx
- `src/components/shared/stat-item/` — index.tsx
- `src/components/shared/status-alert/` — index.tsx
- `src/components/shared/status-badge/` — index.tsx
- `src/components/shared/status-w-price/` — index.tsx
- `src/components/shared/step-row-accordion/` — index.tsx
- `src/components/shared/tooltip-wrap/` — index.tsx
- `src/components/shared/tooltips-custom/` — index.tsx
- `src/components/shared/trend-delta/` — index.tsx
- `src/components/shared/trending-badge/` — index.tsx
- `src/components/shared/upload-zone/` — index.tsx
- `src/components/shared/user/` — files: main-nav.tsx, profile-form.tsx
- `src/components/shared/watchlist/` — index.tsx; files: watchlist-item.tsx

## UI Primitives

- `src/components/ui/accordion.tsx`
- `src/components/ui/alert-dialog.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/calendar.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/carousel-dot-button.tsx`
- `src/components/ui/carousel.tsx`
- `src/components/ui/carrousel-arrow-button.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/command.tsx`
- `src/components/ui/delete-dialog.tsx`
- `src/components/ui/dialog.tsx`
- `src/components/ui/drawer.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/dropdown.tsx`
- `src/components/ui/dropzone.tsx`
- `src/components/ui/form.tsx`
- `src/components/ui/input-otp.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/navigation-menu.tsx`
- `src/components/ui/pagination.tsx`
- `src/components/ui/phone-input.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/rich-text-editor.tsx`
- `src/components/ui/scroll-area.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/separator.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/show-more.tsx`
- `src/components/ui/sidebar.tsx`
- `src/components/ui/skeleton.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/tabs.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/tooltip.tsx`
- `src/components/ui/virtualized-combobox.tsx`

## Services

- `src/services/` — subdirs: external, market-operations, server-action, socket; files: auth-2fa.ts, auth.ts, browser-notification.ts, cask-ask.ts, cask-bid.ts, +23 more
- `src/services/server-action/` — files: auth.ts, base.ts, cask-ask.ts, cask-bid.ts, cask-master.ts, +8 more
- `src/services/socket/` — files: baseSocket.ts, market.ts
- `src/services/external/` — files: locationService.ts

## State

- `src/store/` — dirs: account, checkout, dashboard, slices; files: index.ts
- `src/store/slices/` — files: authSlice.ts, caskSlice.ts, distilleriesSlice.ts
- `src/store/account/` — files: AccountProvider.tsx, accountStore.ts, hooks.ts, index.ts
- `src/store/checkout/` — files: index.tsx
- `src/store/dashboard/` — files: CaskProvider.tsx

## Config, Lib, Helpers

- `src/config/` — files: auth.ts, axios.ts, env.ts, tanstack.ts
- `src/lib/` — dirs: constants, server; files: auth-middleware.ts, cask-variants.ts, get-query-client.ts, nextauth-client-debug.ts, nextauth-debug.ts, +3 more
- `src/helpers/` — dirs: carousel, cask, distillery, form, table; files: index.ts

## Assets

- `src/assets/styles/` — files: globals.css
- `src/assets/content/` — files: 2fa-enabled.html, 2fa-removed.html, agreement-update-required-buyer.html, agreement-update-required.html, ask-cancelled-expired.html, ask-expired-seller.html, ask-match.html, ask-near-bid-buying.html, +41 more
- `public/fonts/` — files: RecklessTRIAL-Bold.woff, RecklessTRIAL-Bold.woff2, RecklessTRIAL-BoldItalic.woff, RecklessTRIAL-BoldItalic.woff2, RecklessTRIAL-Heavy.woff, RecklessTRIAL-Heavy.woff2, +22 more
- `public/images/` — dirs: card-payment, cask, distillery, resources; files: agreement_checkout.png, banner_1.jpg, banner_2.jpg, banner_3.jpg, barrel.png, berrel_cask.png, bg-cask-detail.jpg, cask_mock.jpg, +36 more
- `public/icons/` — dirs: Check out, company, payments, resources; files: backtop-ic.svg, badge-distillery-1.png, badge-distillery-2.png, badge-distillery-3.png, cask-icon.svg, checked-noti.svg, chevon-down.svg, discard-change.svg, +26 more

## Scripts

- `dev` — `next dev --turbopack --port 3001`
- `start` — `next start`
- `lint` — `next lint --fix`
- `test` — `TMPDIR=/tmp jest`
- `test:watch` — `TMPDIR=/tmp jest --watch`
- `test:e2e` — `TMPDIR=/tmp playwright test`
- `test:e2e:ui` — `TMPDIR=/tmp playwright test --ui`
- `test:e2e:headed` — `TMPDIR=/tmp playwright test --headed`
- `test:e2e:report` — `playwright show-report`
- `codemap` — `node scripts/generate-codemap.mjs`
- `payload:types` — `payload generate:types --disable-transpile`
- `payload:importmap` — `payload generate:importmap --disable-transpile`
- `prepare` — `husky`
- `clean` — `rm -rf node_modules/.cache .next dist build .output .turbo .vite`
- `build` — `npm run clean && npm run build:prod`
- `build:prod` — `next build`
- `analyze` — `ANALYZE=true npm run build`

## Env Vars

- `ANALYZE` — next.config.ts
- `APP_VERSION` — src/config/env.ts
- `DEBUG` — src/config/env.ts
- `DEFAULT_PAGE_SIZE` — src/config/env.ts
- `HMAC_SECRET` — src/config/env.ts
- `LATEST_PRODUCTS_LIMIT` — src/config/env.ts
- `LOG_STREAM` — src/config/env.ts
- `LORA_SFT_AUTH_TOKEN` — src/config/env.ts
- `NEXT_PUBLIC_API_URL` — next.config.ts, src/config/env.ts
- `NEXT_PUBLIC_APP_DESCRIPTION` — src/config/env.ts
- `NEXT_PUBLIC_DOMAIN_TEST` — src/config/env.ts
- `NEXT_PUBLIC_ENABLE_REACT_QUERY_DEVTOOLS` — src/config/env.ts
- `NEXT_PUBLIC_ENABLE_REACT_SCAN` — src/config/env.ts
- `NEXT_PUBLIC_SERVICE_URL` — src/config/env.ts
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` — src/config/env.ts
- `NEXT_PUBLIC_WS_URL` — src/config/env.ts
- `NEXTAUTH_DEBUG` — src/config/env.ts
- `NEXTAUTH_SECRET` — src/config/env.ts, src/lib/auth-middleware.ts
- `NEXTAUTH_URL` — src/config/env.ts, src/lib/auth-middleware.ts, src/lib/constants/auth.ts
- `NEXTAUTH_URL_INTERNAL` — src/config/env.ts
- `NODE_ENV` — next.config.ts, src/config/env.ts, src/lib/auth-middleware.ts, +1 more
- `PAYLOAD_CMS_ENABLED` — src/config/env.ts
- `VERCEL_URL` — src/config/env.ts

## Notes

- This map is generated from the repo tree, not hand-written.
- If a section is stale, regenerate before trusting it.
