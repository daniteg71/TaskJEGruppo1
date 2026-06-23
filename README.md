# Bandi × DNA — MVP

Valutazione automatica della fattibilità e convenienza di un bando pubblico rispetto al "DNA" aziendale (Formulario servizi + Bilanci + Visura + CV).

## Stato attuale

Lo scheletro è completo e gira in **modalità mock**: il frontend mostra 4 bandi finti con punteggio 0–10, dashboard, analisi dettagliata (10 criteri, match table, analisi critica, checklist) ed export PDF (via `window.print`).

Quando il Drive sarà popolato e il Prompt validato, basterà:
1. Compilare `.env.local` con le chiavi reali
2. Mettere `DATA_MODE=live`
3. Implementare i tre stub in `lib/drive.ts` e `lib/gemini.ts` (le `throw new Error(...)` spiegano cosa fare)

Nessuna modifica al frontend richiesta.

## Struttura

```
app/
  page.tsx                  Dashboard: lista bandi ordinati per punteggio
  bandi/[id]/page.tsx       Analisi dettagliata + export PDF
  dna/page.tsx              Snapshot DNA aziendale
  api/bandi                 GET lista bandi
  api/bandi/[id]            GET analisi singola
  api/dna                   GET snapshot DNA
lib/
  types.ts                  Tipi condivisi (Bando, DNA, Analisi)
  data-source.ts            Entry point: switcha tra mock e live in base a DATA_MODE
  mock-data.ts              4 bandi + 1 DNA + 1 analisi completa (Flusso 2)
  drive.ts                  Stub Google Drive (Backend Dev)
  gemini.ts                 Stub Gemini + prompt (Prompt Engineering)
  scoring.ts                Logica punteggio 10 criteri → 0–10
components/                 BandoCard, ScoreGauge, CriteriaTable, MatchTable, DnaStatus, ExportButton
```

## Avvio locale

```bash
npm install
npm run dev
# http://localhost:3000
```

## Deploy Vercel

1. Push del repo su GitHub
2. Su vercel.com → New Project → importa la repo
3. Aggiungere le variabili d'ambiente da `.env.example` (per ora basta `DATA_MODE=mock`)
4. Deploy

## Divisione lavoro (riferimento)

| Flusso | Chi | Cosa | Blocca? |
|---|---|---|---|
| 1A | Risorse A+B | Popolare Drive (Formulario, Bilanci, Visura, CV, 4 PDF bandi) | No |
| 1B | Risorse C+D | Tarare il prompt su AI Studio fino a ottenere il JSON descritto in `lib/gemini.ts` | No |
| 2A | Dev Frontend | UI completa su mock (questo repo) | No |
| 2B | Dev Backend | Implementare `lib/drive.ts` + `lib/gemini.ts` | Aspetta 1B per il prompt definitivo |
| 3 | Tutti | Switch a `DATA_MODE=live`, test end-to-end | Aspetta 1A + 1B + 2B |
