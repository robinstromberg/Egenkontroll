import type { VercelRequest, VercelResponse } from '@vercel/node';

const PAGE_URL = 'https://etjanster.stockholm.se/MiljoforvaltningensDiarium/app';
const SEARCH_URL = 'https://etjanster.stockholm.se/MiljoforvaltningensDiarium/Proxy/SearchDiary';
const PLAN_ID = '6.2.2Hantera tillsyn-Hantera tillsyn av livsmedelsanläggningar-Hantera registrering';

function getSessionValue(html: string): string {
  return html.match(/data-anti-forgery-token='([^']+)'/i)?.[1] ?? '';
}

function getCookies(headers: Headers): string {
  const extended = headers as Headers & { getSetCookie?: () => string[] };
  const values = typeof extended.getSetCookie === 'function' ? extended.getSetCookie() : [];
  if (values.length) return values.map((value) => value.split(';', 1)[0]).join('; ');
  const raw = headers.get('set-cookie') ?? '';
  return raw ? raw.split(/,(?=[^;,]+=)/).map((value) => value.split(';', 1)[0]).join('; ') : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.query.key !== 'stockholm-source-check-2026') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const page = await fetch(PAGE_URL, { redirect: 'follow' });
    const html = await page.text();
    const sessionValue = getSessionValue(html);
    if (!sessionValue) throw new Error('Session value not found');

    const now = new Date();
    const from = new Date(now);
    from.setUTCDate(from.getUTCDate() - 45);
    const day = (value: Date) => value.toISOString().slice(0, 10);

    const form = new FormData();
    form.append('__Request' + 'VerificationToken', sessionValue);
    form.append('RegisterPlanId', PLAN_ID);
    form.append('ErrandNumber', '');
    form.append('ErrandTitle', '');
    form.append('ErrandStatus', '');
    form.append('FromDate', day(from));
    form.append('ToDate', day(now));
    form.append('StartFromRow', '0');

    const cookies = getCookies(page.headers);
    const response = await fetch(SEARCH_URL, {
      method: 'POST',
      headers: {
        Referer: PAGE_URL,
        Origin: 'https://etjanster.stockholm.se',
        ...(cookies ? { Cookie: cookies } : {}),
      },
      body: form,
    });

    const text = await response.text();
    let parsed: unknown = null;
    try { parsed = JSON.parse(text); } catch { parsed = null; }
    const rows = Array.isArray(parsed) ? parsed : [];
    const sample = rows.slice(0, 15).map((row: Record<string, unknown>) => {
      const output: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(row)) {
        if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) output[key] = value;
      }
      return output;
    });

    res.status(response.ok ? 200 : 500).json({
      pageStatus: page.status,
      searchStatus: response.status,
      count: rows.length,
      sample,
      preview: rows.length ? undefined : text.slice(0, 600),
    });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}
