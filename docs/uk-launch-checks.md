# UK launch checks

This release changes presentation, legal pages and consent-based analytics. It does not require schema SQL or a dependency reinstall on the production database.

## Campaign link and measurement

Use `https://www.mommenu.ge/?lang=en&utm_source=justparents&utm_medium=banner&utm_campaign=uk_launch` for the banner. JustParents supplies outbound click counts; Mommenu records consented landing visits, not clicks on another website.

GA4 events: `campaign_landing`, `sign_up`, `begin_checkout`, `purchase`. Checkout value/currency come from the saved server order. Purchase value/currency/transaction ID come from the signed-in account's successful payment record after the bank callback. A success return URL alone never produces a purchase.

Analytics loads only after consent. Campaign attribution lasts up to 30 days. Tokens, email addresses and private query parameters are stripped from analytics page URLs. Declining cookies means the visitor will not be counted. Purchases are counted on return to the dashboard in the checkout browser session; closing the browser, blocking analytics, not returning, renewals and later trial charges can leave gaps. Financial reporting remains authoritative.

After deployment, accept analytics on a fresh campaign visit and verify events in the configured GA4 property's Realtime view. Confirm `purchase` and its transaction ID after the owner's real test payment. Do not assume delivery to Google solely from passing local tests. Check GTM configuration separately if enabled, to avoid a second tag duplicating GA4 events. Mark `purchase` as a key event in GA4 if not already configured.

## Real checkout (owner performs payment)

1. Use the international test account and select the one-month plan without a promo code.
2. Before paying, verify the bank page shows **15 USD**. Stop if either amount or currency differs.
3. Complete payment personally. Confirm the successful bank callback, a single successful payment record, and access for the configured **30 days**. Longer plans use 90 / 180 days; the interface explains the renewal interval.
4. Reload and sign in again to confirm paid access persists. If desired, cancel renewal and verify access remains until the paid end date.
5. Check the confirmation email's language, paid amount and dates, and GA4 receipt of the purchase with the campaign attribution.

## Refund handling

UK customers may request a full refund of their first subscription payment within 14 calendar days, including after use. Requests go to `info@mommenu.ge`. The owner must process eligible refunds through the bank within the published deadline, stop renewal, revoke the refunded paid access and keep an accurate payment/referral record. The new legal page does **not** automate bank refunds. Verify the operational handling before relying on it; ordinary subscription cancellation alone does not refund a payment.

Business details are centralized in `lib/business.ts` using the owner's supplied information. Terms, Privacy, Refunds & cancellation and Contact are available in English from the footer and checkout. Technical checks are not a legal certification; the processing basis for children's allergy/health data and any applicable international transfer safeguards still need assessment against the actual business arrangements.

## Verification scope

Use only disposable local database accounts for automated integration tests. Do not run the original international schema/content SQL again: it has already been applied. A production push follows the owner's review, and no automated test makes a real bank charge.
