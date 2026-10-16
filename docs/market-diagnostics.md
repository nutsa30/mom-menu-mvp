# Registration market investigation

This change observes the existing routing; it does not trust Cloudflare headers for billing, update existing accounts, or change market assignment.

1. Deploy the diagnostic change. No database migration is required.
2. Sign in as an administrator and open `/admin/market-diagnostics`. Turn off VPN for the baseline test. Compare Vercel and Cloudflare country codes with the country where the test device is located. The administrator's account/preview market is shown separately from guest geolocation.
3. Test registration in a private browser session without a VPN. Check Vercel Runtime Logs for `[registration-market]` promptly, within the log retention period available on the hosting plan.
4. Correlate email registration steps using `registrationId`, then the created `userId`. `email_pending` records the original market selection. `email_verified` uses that persisted selection even if the request country has since changed. Google and legacy signup record the decision at account creation.
5. If Cloudflare and Vercel disagree, investigate proxy geolocation and repeat across multiple devices/networks. Cloudflare headers are observations, not independently authenticated evidence. If both indicate GE at the original selection but the selected market is INTL, inspect session/admin-preview inheritance and application routing. If both indicate a foreign country, this is consistent with IP routing; it does not by itself prove a VPN.

Only country codes, decision/flow, timestamps, internal registration/user identifiers and a boolean proxy marker are logged. No full IP addresses, emails, cookies, OAuth codes, passwords or tokens are logged. The page is protected by the normal admin layout and a database-backed `requireAdmin()` check. It is dynamically rendered.

Past registrations have no such evidence and cannot be conclusively classified retrospectively by this addition. Time zone and language are not proof of location. Do not automatically move existing paying accounts between currencies.
