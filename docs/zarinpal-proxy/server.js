/**
 * Minimal Oilbar Zarinpal proxy for an Iran-based Node.js server.
 *
 * Deploy this on a server that can reach Zarinpal, then set on Vercel:
 * ZARINPAL_PROXY_URL=https://your-iran-server.example.com
 * ZARINPAL_PROXY_SECRET=change-this-secret
 *
 * Install:
 *   npm init -y
 *   npm pkg set type=module
 *   npm i express
 * Run:
 *   OILBAR_PAYMENT_PROXY_SECRET=change-this-secret node server.js
 */

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = process.env.OILBAR_PAYMENT_PROXY_SECRET || "";
const ZARINPAL_BASE_URL = process.env.ZARINPAL_BASE_URL || "https://payment.zarinpal.com/pg/v4";

app.use(express.json({ limit: "64kb" }));

function assertSecret(req, res, next) {
  if (SECRET && req.header("x-oilbar-payment-secret") !== SECRET) {
    return res.status(401).json({ data: {}, errors: { message: "unauthorized" } });
  }
  return next();
}

async function forwardToZarinpal(path, req, res) {
  try {
    const response = await fetch(`${ZARINPAL_BASE_URL}${path}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    const text = await response.text();
    res.status(response.status).type("application/json").send(text);
  } catch (error) {
    res.status(502).json({
      data: {},
      errors: { message: error instanceof Error ? error.message : "proxy fetch failed" },
    });
  }
}

app.get("/health", (_req, res) => res.json({ ok: true }));
app.post("/payment/request.json", assertSecret, (req, res) => forwardToZarinpal("/payment/request.json", req, res));
app.post("/payment/verify.json", assertSecret, (req, res) => forwardToZarinpal("/payment/verify.json", req, res));

app.listen(PORT, () => {
  console.log(`Oilbar Zarinpal proxy listening on ${PORT}`);
});
