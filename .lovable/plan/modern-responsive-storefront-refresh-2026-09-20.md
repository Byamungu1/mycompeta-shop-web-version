# Modern responsive storefront refresh

## What will change
- Keep the login screen unchanged.
- Apply the selected modular workspace direction using the established brand palette: light neutral surfaces, dark ink, brand blue, and warm orange accents.
- Use Syne for headings and Plus Jakarta Sans for body text.
- Give every authenticated screen a centered, responsive content frame with cleaner spacing, stable card grids, desktop navigation, mobile bottom navigation, and properly sized forms and dialogs.
- Refresh the buyer home and seller dashboard as the strongest examples of the modular composition, while shared layout rules bring the same placement quality to product, cart, checkout, profile, order, notification, store, and seller-management screens.

## Location improvements
- Use the browser Permissions API when available and distinguish prompt, denied, unavailable, timeout, and inaccurate results.
- Capture location through one high-accuracy watch with a hard deadline, favoring fresh fixes and rejecting unusably imprecise coordinates.
- Show accuracy and actionable retry/settings feedback instead of silently accepting or swallowing failures.
- Pass the real captured buyer coordinates into nearby-product discovery and remove the region-specific coordinate-order rejection.

## Technical details
- Extend shared design tokens and responsive utility classes rather than introducing page-specific hardcoded colors.
- Improve the web compatibility primitives for responsive list grids, image fitting, text truncation, and modal presentation.
- Preserve existing routes, data calls, forms, actions, and business behavior.
- Validate at mobile and desktop sizes and review the latest build diagnostics.
