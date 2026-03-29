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
