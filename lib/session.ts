import 'server-only'
import { cookies } from 'next/headers'

const COOKIE = 'jesap_company'

export async function getCompanyId(): Promise<number | null> {
  const store = await cookies()
  const raw = store.get(COOKIE)?.value
  if (!raw) return null
  const id = Number.parseInt(raw, 10)
  return Number.isFinite(id) ? id : null
}

export async function setCompanyId(id: number) {
  const store = await cookies()
  store.set(COOKIE, String(id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
}

export async function clearCompanyId() {
  const store = await cookies()
  store.delete(COOKIE)
}
