# Oilbar ZarinPal Payment Setup

## Architecture

Recommended production flow:

1. User stays on `https://oilbar.ir`.
2. Next.js creates the order in the database.
3. Next.js calls `https://api.oilbar.ir/api/payments/zarinpal/request`.
4. The payment service loads the order from the database and calculates the amount server-side.
5. The payment service calls ZarinPal v4.
6. User is redirected to ZarinPal.
7. ZarinPal calls `https://api.oilbar.ir/api/payments/zarinpal/callback`.
8. The payment service verifies the payment, updates the order/payment transaction, clears the paid cart, decrements stock, sends SMS, and redirects the user to the frontend.

This avoids direct ZarinPal requests from Vercel Serverless Functions. Vercel outbound IPs are dynamic and may be unreliable for Iranian payment providers.

## ZarinPal Panel

Set the callback URL in the ZarinPal panel to:

```text
https://api.oilbar.ir/api/payments/zarinpal/callback
```

The callback domain must match the domain configured in the ZarinPal panel.

## Vercel Environment Variables

Use these on the frontend deployment:

```env
NEXT_PUBLIC_APP_URL=https://www.oilbar.ir
PAYMENT_API_BASE_URL=https://api.oilbar.ir
NEXT_PUBLIC_PAYMENT_API_BASE_URL=https://api.oilbar.ir
PAYMENT_SERVICE_SECRET=change-me-long-random-secret
```

Keep the existing auth, database, and SMS variables too. The frontend should not need to call ZarinPal directly when `PAYMENT_API_BASE_URL` is set.

## VPS Payment Service Environment Variables

Use these on the VPS:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
FRONTEND_BASE_URL=https://www.oilbar.ir
PAYMENT_SERVICE_SECRET=change-me-long-random-secret

ZARINPAL_MERCHANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
ZARINPAL_SANDBOX=false
ZARINPAL_CALLBACK_URL=https://api.oilbar.ir/api/payments/zarinpal/callback
ZARINPAL_AMOUNT_UNIT=toman

SMS_ENABLED=true
SMS_PROVIDER=smsir
SMS_API_KEY=
SMS_SENDER=
SMS_SENDER_NUMBER=
SMSIR_API_KEY=
SMSIR_LINE_NUMBER=
PORT=3001
```

`PAYMENT_SERVICE_SECRET` must be identical on Vercel and VPS. It protects the request endpoint from public order/payment creation attempts.

## Deploy On Ubuntu VPS

Example:

```bash
git clone <repo-url> oilbar
cd oilbar
npm ci
npx prisma generate
npx prisma migrate deploy
cp .env.example .env
nano .env
npm run payment-service
```

For production, run it behind Nginx and a process manager:

```bash
npm install -g pm2
pm2 start "npm run payment-service" --name oilbar-payment
pm2 save
```

Nginx should proxy `https://api.oilbar.ir` to `http://127.0.0.1:3001`.

## Sandbox Test

Set on the VPS:

```env
ZARINPAL_SANDBOX=true
```

Then create a test order from the frontend. The flow should redirect to sandbox StartPay and back to `/checkout/success` or `/checkout/failed`.

## Production Test

Set:

```env
ZARINPAL_SANDBOX=false
```

Confirm:

- `https://api.oilbar.ir/health` returns success.
- ZarinPal panel callback is `https://api.oilbar.ir/api/payments/zarinpal/callback`.
- Vercel has `PAYMENT_API_BASE_URL=https://api.oilbar.ir`.
- Vercel and VPS share the same `DATABASE_URL`.
- Vercel and VPS share the same `PAYMENT_SERVICE_SECRET`.

## Amount Unit

Oilbar stores product/order prices as toman by default.

Use:

```env
ZARINPAL_AMOUNT_UNIT=toman
```

Only set `rial` if your gateway account expects rial; in that case the service multiplies stored toman by 10 before calling ZarinPal.
