import 'server-only'
import * as cheerio from 'cheerio'

export type RawResult = {
  title: string
  link: string
  source: string
  published: string
  snippet: string
}

/**
 * Real web scraping of current Italian grant/funding listings.
 * We query Google News RSS (real, live web data) for several
 * grant-related searches, then parse the XML with cheerio.
 */
export async function scrapeGrants(queries: string[]): Promise<RawResult[]> {
  const results: RawResult[] = []
  const seen = new Set<string>()

  await Promise.all(
    queries.map(async (q) => {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
        q,
      )}&hl=it&gl=IT&ceid=IT:it`
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (compatible; JesapBot/1.0; grant discovery)',
          },
          // always fetch fresh listings
          cache: 'no-store',
        })
        if (!res.ok) return
        const xml = await res.text()
        const $ = cheerio.load(xml, { xmlMode: true })

        $('item').each((_, el) => {
          const item = $(el)
          const title = item.find('title').first().text().trim()
          const link = item.find('link').first().text().trim()
          const source = item.find('source').first().text().trim() || 'Web'
          const published = item.find('pubDate').first().text().trim()
          const descHtml = item.find('description').first().text()
          const snippet = cheerio
            .load(descHtml || '')
            .text()
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 400)

          if (!title || !link || seen.has(link)) return
          seen.add(link)
          results.push({ title, link, source, published, snippet })
        })
      } catch {
        // network failures are non-fatal; other queries may still succeed
      }
    }),
  )

  return results.slice(0, 30)
}
