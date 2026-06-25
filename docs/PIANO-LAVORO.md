# Bandi × DNA — Piano di lavoro & onboarding

Ciao a tutti, soprattutto ai nuovi arrivati 👋
Questo è il quadro di come ci stiamo dividendo il lavoro e dove trovate le cose.
**È un'idea di base**: se qualcuno trova critiche o soluzioni migliori, ben venga — miglioriamo tutto insieme.

## In una riga

L'app, partendo dal **DNA aziendale** (i documenti dell'azienda su Drive), trova i bandi pubblici
**compatibili** e dà a ciascuno un **voto da 1 a 10** + un'analisi strategica su quanto conviene
partecipare e quanto è probabile vincere.

---

## Come ci dividiamo il lavoro

### 1. Riempire il Drive con il DNA aziendale — **Riss**
Creare e popolare la cartella Drive con i documenti che compongono il "DNA": Formulario servizi,
Bilanci, Visura, CV dei collaboratori. (Riss condivide la cartella.)
➡️ *Codice collegato:* l'app legge questa cartella in `lib/drive.ts` (`buildDnaSnapshot`). Il nome
azienda + link cartella si inseriscono nella schermata iniziale `/setup`.

### 2. Scraping dei bandi da internet — **Lorenzo** (codice già fatto, da verificare)
Prendere da internet tutti i bandi e filtrare quelli compatibili con il profilo aziendale.
Il codice esiste già ma potrebbero esserci malfunzionamenti: va testato e integrato.
➡️ *Codice collegato:* `lib/scraper.ts` — `cercaBandiOnline()` deve restituire i bandi **grezzi**
(`RawTender[]`); NON deve valutarli (ci pensa il motore al punto 4).

### 3. Automazione Drive → sito + sintesi AI — *(da definire meglio)*
Il flusso che porta i dati dal Drive al sito, dove l'AI fa una **sintesi** e costruisce il DNA.
Da capire al meglio: se farlo in codice o con uno strumento di automazione (es. Make).
➡️ *Codice collegato:* `lib/drive.ts` (lettura file) + `lib/gemini.ts` (sintesi AI) +
`lib/data-source.ts` (orchestrazione). Oggi gira in modalità **mock**; passando a `DATA_MODE=live`
serve implementare questi punti.

### 4. Algoritmo di valutazione (voto 1–10 + strategia) — *(da sviluppare)*
Dare correttamente un voto da 1 a 10 su **quanto il bando fitta** con l'azienda e **quanto è
probabile vincerlo**, fornendo anche una **strategia** e analisi approfondite, sfruttando tutti i
dati sintetizzati dall'AI nel DNA.
➡️ *Codice collegato:* c'è già lo scheletro del motore in `lib/pipeline/`:
- **Ammissibilità** (requisiti minimi → bando compatibile sì/no): `eligibility.ts` ✅ già fatto
- **Pesi/soglie/tier** da calibrare: `scoring-rules.ts` (unico file da toccare per la calibrazione)
- **Formule delle 5 dimensioni**: `stage2-scoring.ts`
- **Strategia/insight via AI**: `stage3-llm.ts`
> L'algoritmo "vero" arriverà: si innesta qui senza riscrivere il resto.

### 5. Parte codice (tutto su GitHub) — **team dev**
- **Abbellire il sito** (UI/UX)
- **Unire i vari codici** che arrivano dalle altre persone
- **Testare** che tutto funzioni (`npm run build`, `npm run typecheck`)
- **Controllare i costi**: testare che le **API dello scraping (e dell'AI) non consumino troppo**
➡️ *Codice collegato:* il "cost-guard" che limita le chiamate AI è in `stage3-llm.ts` /
`scoring-rules.ts` (`STAGE3`). Il funnel è pensato proprio per spendere il minimo.

---

## Stato attuale (cosa gira già)

- Sito online in modalità **mock** (dati finti) → si vede e si prova tutto subito
- Onboarding `/setup` (nome azienda + cartella Drive), grafo "knowledge base" del DNA,
  due fonti bandi (online/Drive), gate di **compatibilità** sui requisiti minimi, export PDF
- Identità grafica JESAP (font, viola, logo gufo)
- Punti da completare per il "live": `lib/drive.ts`, `lib/gemini.ts`, `lib/scraper.ts`
  (hanno commenti che spiegano cosa implementare)

---

## Link utili

| Cosa | Link |
|---|---|
| 🌐 Sito live (demo) | https://task-jegruppo1.vercel.app |
| 💻 Repository GitHub (codice) | https://github.com/daniteg71/TaskJEGruppo1 |
| ▲ Dashboard Vercel (deploy/log) | https://vercel.com/dt-71/task-jegruppo1 |
| 📁 Cartella Drive — DNA aziendale | https://drive.google.com/drive/folders/1HFXiNjjnrnsNeaMRBDH-vGao-XepH_GE?hl=it |
| 🟣 CRM JESAP (riferimento grafico) | https://crm.jesap.it |
| 🐙 Repo CRM JESAP (da cui font/colori/logo) | https://github.com/JesapIt/Jesap-CRM |

### Strumenti citati nel progetto
| Strumento | Link | A cosa serve |
|---|---|---|
| Google AI Studio (Gemini) | https://aistudio.google.com | testare i prompt dell'AI |
| v0.dev | https://v0.dev | generare componenti UI |
| Make (Integromat) | https://www.make.com | automazione Drive→AI→sito (alternativa al codice) |

> ⚠️ **Nota importante sul Drive:** perché l'app legga la cartella, va **condivisa (in lettura)
> con il service account** dell'app — il link da solo non basta a dare l'accesso.

---

## Per i nuovi: come partire in 3 mosse

1. Clonare il repo: `git clone https://github.com/daniteg71/TaskJEGruppo1.git`
2. `npm install` poi `npm run dev` → aprire http://localhost:3000
3. Leggere il `README.md` (spiega architettura e dove mettere le mani) e scegliere un task qui sopra

Critiche e idee migliori sono **benvenute**: questo piano è un punto di partenza, non una regola. 🚀
