
import { Router } from "express";
const router = Router();

router.get("/", async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: "Query param 'code' is required, e.g. ?code=USD" });
  }

  const today = new Date().toISOString().slice(0, 10);
  const url = `https://www.nrb.org.np/api/forex/v1/rates?page=1&per_page=1&from=${today}&to=${today}`;

  try {
    const response = await fetch(url, {
      headers: {
        // some APIs behind a WAF reject requests with no/unusual User-Agent —
        // sending a plain non-browser one here in case that's a factor
        "User-Agent": "curl/8.5.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: `NRB API responded with ${response.status}` });
    }

    const json = await response.json();
    const rates = json.data?.[0]?.rates ?? [];
    const match = rates.find((r) => r.currency.iso3 === code.toUpperCase());

    if (!match) {
      return res.status(404).json({ error: `No rate found for currency code '${code}'` });
    }

    // NRB rates are per `unit` (e.g. per 10 JPY, per 100 KRW) — normalize to per-1-unit
    const buy = parseFloat(match.buy) / match.currency.unit;
    const sell = parseFloat(match.sell) / match.currency.unit;
    const rate = (buy + sell) / 2;

    return res.json({ rate });
  } catch (err) {
    console.error("NRB rate fetch failed:", err.message);
    return res.status(502).json({ error: "Failed to fetch rate from NRB" });
  }
});

export default router;
