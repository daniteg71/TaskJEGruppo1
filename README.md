# Jesap — Intelligence sui bandi (MVP)

Dal **DNA aziendale** (documenti su Drive) ai **bandi compatibili**, con voto 1–10 e strategia.
Sito basato sul design v0 e adattato per girare su Vercel senza servizi esterni.

## Flusso (cosa funziona oggi)

1. **Onboarding** (`/`): nome azienda + settore + cartella Google Drive → costruisce il DNA.
2. **DNA** (`/dna`): grafo 3D "galassia" delle competenze/mercati/asset (sintesi statica del Drive).
3. **Cerca bandi** (`/dashboard`): scraping reale dal web (Google News RSS), ogni bando con **voto 1–10**.
4. **Storico ricerche**: ogni ricerca è salvata; le precedenti restano consultabili.
5. **Dettaglio bando** (`/dashboard/[id]`): strategia, probabilità di accesso, rischi, piano operativo.

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · Tailwind 4 · shadcn/ui
- three.js / react-three-fiber (galassia DNA)
- Scraping: `cheerio` su Google News RSS (`lib/scrape.ts`) — **gratis, niente chiavi**
- AI: Vercel AI SDK (`lib/ai.ts`) con **fallback deterministici**

## Scelte MVP (importanti)

- **Niente Postgres**: persistenza **in-memory** (`lib/store.ts`). Si azzera a freddo sul serverless.
  Per persistenza reale: provisionare un DB e ripristinare il layer drizzle (tipi in `lib/db/schema.ts`).
- **AI a costo zero di default**: `AI_ENABLED` non impostata → fallback deterministici (DNA, voto, strategia).
  Lo scraping resta reale. Per attivare l'AI vera: `AI_ENABLED=1`.
- **Voto 1–10**: internamente lo score è 0–100, mostrato come X/10 (`components/dashboard/match-ring.tsx`).

## Da completare (quando arrivano i codici del team)

- Lettura **reale** dei file del Drive (oggi sintesi statica/mock in `app/actions/company.ts`).
- **Algoritmo di valutazione** definitivo (oggi il voto è il fallback deterministico in `lib/ai.ts`).
- Eventuale **persistenza** su DB.

## Avvio locale

```bash
npm install
npm run dev   # http://localhost:3000
```

## Contributori

- Andrea Rinaldini ([@Zirin405](https://github.com/Zirin405))
- Daniele Tegliucci ([@daniteg71](https://github.com/daniteg71))
- Bryan Cristante ([@BryanCristante](https://github.com/BryanCristante))
