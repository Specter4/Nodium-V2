# Nodium Launch Plan

This document is the operating plan for launching Nodium. It deliberately keeps launch infrastructure simple and postpones custom systems until sales justify them.

## Current state

- Storefront: complete enough for launch presentation and product browsing.
- Product catalogue: 35 products across 10 categories.
- Demo product reviews removed; product pages now provide a customer review path.
- Real checkout: **not enabled yet**.
- Payment receiving: **Payoneer is the current working assumption for receiving business funds**, pending confirmation of the final customer-facing payment route.
- Deployment target: **Cloudflare Pages** for the static storefront.
- Backend/data platform: **Supabase only when a real backend is needed**; do not introduce it merely because it is available.
- Automation: **n8n** will first automate Nodium's own operations, then proven internal workflows can become products.

## Priority 1 — MUST HAVE FOR LAUNCH

### 1. Product readiness

For every launch product:

- Final product files are complete and tested.
- Files are organized into a professional download package.
- A short setup/readme guide is included where needed.
- Product preview assets match the actual product.
- Product description states exactly what is included.
- License terms match the actual product.
- Price and any comparison price are intentional and documented.
- No private credentials, API keys, customer data, or internal files are included.

### 2. Customer support

- Use `hello@nodium.co` as the public support address.
- Target response time: within 24 hours on business days.
- Support requests should capture the customer's name, email, order ID when available, product, and issue.
- Keep a simple support log before introducing a helpdesk.

### 3. Delivery

The final customer flow must be:

`Purchase → payment confirmed → order recorded → product delivered → instructions/access provided → delivery recorded → support available`

During the initial launch, prefer a reliable existing delivery mechanism over building a custom download system.

### 4. Deployment

Deploy the current static storefront to Cloudflare Pages and connect `nodium.co`.

Keep the site as a static deployment initially. No application server is required for the storefront itself.

### 5. Legal and trust

Before accepting real payments, verify:

- Terms
- Privacy policy
- Refund policy
- Product/license wording
- Support email
- Business/contact information
- Final payment-provider wording

Do not claim payment methods or guarantees that are not actually enabled.

## Priority 2 — SHOULD ADD SOON

### Order/customer records

When real orders begin, introduce a small database layer for:

- customers
- orders
- order items
- delivery status
- refunds
- support references

Supabase is the preferred candidate because it provides Postgres, Storage, Auth and Edge Functions in one platform. Start on the free plan while usage is small.

### Internal n8n automation

First automations to build:

1. New paid order → record order/customer.
2. Paid order → identify product and trigger delivery.
3. Delivery completed → update delivery status.
4. New customer → add customer record.
5. Support request → create internal task.
6. Refund → update order status.
7. Weekly sales → generate a simple report.

Do not build all of these before the first sale. Implement them in the order that real operational friction appears.

### Product analytics

Track at minimum:

- product views
- add-to-cart events
- checkout starts
- completed purchases
- revenue per product
- refunds
- review submissions

Use the simplest reliable analytics available; avoid building custom analytics infrastructure early.

## Priority 3 — FUTURE / SCALE

Only consider these after meaningful sales volume or operational complexity:

- customer accounts/library
- automated license management
- secure expiring download links
- advanced affiliate/referral system
- subscription products
- managed automation services
- customer-specific n8n environments
- advanced CRM/helpdesk
- custom order-management dashboard
- AI-assisted support and operations

## Payment decision gate

Do not turn on the site's live checkout until these questions have been answered:

1. What customer-facing payment method can legally and reliably accept international payments for Nodium from Bangladesh?
2. Where do the proceeds settle?
3. What fees apply to each transaction and to withdrawals/conversion?
4. Can refunds be issued through the same payment route?
5. Can the payment provider send a reliable success/webhook signal for automated delivery?
6. What customer and transaction information is available after payment?

Payoneer can be used as a receiving/settlement component where supported, but it is not automatically the customer-facing checkout itself. The customer payment route must be selected separately.

## Launch sequence

`Finish products`
→ `Package + document`
→ `Deploy storefront`
→ `Verify domain + email`
→ `Choose payment route`
→ `Connect payment`
→ `Connect delivery`
→ `Test complete purchase flow`
→ `Launch`
→ `Get first customers`
→ `Measure`
→ `Automate the real bottlenecks`

The objective is revenue first, infrastructure second.
