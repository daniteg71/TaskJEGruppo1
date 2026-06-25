import 'server-only'
import * as cheerio from 'cheerio'

export type RawResult = {
  title: string
  link: string
  source: string
  published: string
  snippet: string
}

const UA = 'Mozilla/5.0 (compatible; JesapBot/1.0; grant discovery)'

/**
 * Scraping REALE dei principali incentivi nazionali per le imprese, direttamente dal
 * portale ufficiale del Ministero delle Imprese e del Made in Italy (MIMIT).
 * Eseguito a ogni ricerca (cache: 'no-store'), così i bandi sono sempre quelli pubblicati ora.
 *
 * Fonti:
 *  - RSS ufficiale incentivi (descrizioni + date)
 *  - pagina elenco incentivi (elenco completo)
 *
 * NB: per aggiungere altri portali, basta una nuova funzione che restituisce RawResult[]
 * e concatenare i risultati.
 */
export async function scrapeGrants(_queries?: string[]): Promise<RawResult[]> {
  const [rss, listing] = await Promise.all([scrapeMimitRss(), scrapeMimitListing()])

  // unione + dedup per link, RSS prioritario (ha le descrizioni)
  const byLink = new Map<string, RawResult>()
  for (const r of [...rss, ...listing]) {
    if (!byLink.has(r.link)) byLink.set(r.link, r)
    else if (!byLink.get(r.link)!.snippet && r.snippet) byLink.set(r.link, r)
  }
  return Array.from(byLink.values()).slice(0, 30)
}

async function scrapeMimitRss(): Promise<RawResult[]> {
  try {
    const res = await fetch(
      'https://www.mimit.gov.it/it/incentivi?format=feed&type=rss',
      { headers: { 'User-Agent': UA }, cache: 'no-store' },
    )
    if (!res.ok) return []
    const xml = await res.text()
    const $ = cheerio.load(xml, { xmlMode: true })
    const out: RawResult[] = []
    $('item').each((_, el) => {
      const it = $(el)
      const title = it.find('title').first().text().trim()
      const link = it.find('link').first().text().trim()
      if (!title || !link || !link.includes('/it/incentivi/')) return // scarta "Tutti gli incentivi"
      const descHtml = it.find('description').first().text()
      const snippet = cheerio
        .load(descHtml || '')
        .text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 400)
      out.push({
        title,
        link,
        source: 'MIMIT — Ministero delle Imprese',
        published: it.find('pubDate').first().text().trim(),
        snippet,
      })
    })
    return out
  } catch {
    return []
  }
}

async function scrapeMimitListing(): Promise<RawResult[]> {
  try {
    const res = await fetch('https://www.mimit.gov.it/it/incentivi', {
      headers: { 'User-Agent': UA },
      cache: 'no-store',
    })
    if (!res.ok) return []
    const html = await res.text()
    const $ = cheerio.load(html)
    const out: RawResult[] = []
    const seen = new Set<string>()
    $('a[href^="/it/incentivi/"]').each((_, el) => {
      const a = $(el)
      const href = a.attr('href') || ''
      const slug = href.replace('/it/incentivi/', '')
      const title = a.text().replace(/\s+/g, ' ').trim()
      if (!slug || !title || title.length < 5 || seen.has(slug)) return
      seen.add(slug)
      out.push({
        title,
        link: 'https://www.mimit.gov.it' + href,
        source: 'MIMIT — Ministero delle Imprese',
        published: '',
        snippet:
          'Incentivo nazionale per le imprese (MIMIT). Dettagli e requisiti sulla pagina ufficiale.',
      })
    })
    return out
  } catch {
    return []
  }
}
