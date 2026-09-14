# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deploying Supabase Edge Functions

When deploying Edge Functions, `payment-webhook` MUST be deployed with `--no-verify-jwt` since it receives server-to-server callbacks from Maksekeskus without any auth headers:

```
supabase functions deploy payment-webhook --no-verify-jwt
```

All other functions can be deployed normally:

```
supabase functions deploy <function-name>
```

## Maksekeskus Integration

The `transaction_url` object (containing `return_url`, `cancel_url`, `notification_url`) must be nested **inside** the `transaction` object in the create-transaction payload — not at the top level. See `_shared/maksekeskus.ts`.

## Purchase Notifications (ntfy)

The "Uus ost" push notification is sent by the `purchase_completed_notify` database trigger (see migration 00007) via `pg_net`, **not** from the Edge Function. Edge Functions share egress IPs across Supabase customers and ntfy.sh rate-limits per IP, so requests from them get HTTP 429 "daily message quota reached". The database VM has its own address and is not affected.

The ntfy topic lives in Supabase Vault under the secret name `ntfy_topic`. Responses are visible in `net._http_response` for debugging.
