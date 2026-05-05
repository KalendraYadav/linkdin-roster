export type RoastSession = {
  id: string
  headline: string
  about: string
  experience: string
  status: 'processing' | 'completed' | 'error'
  scores?: Record<string, unknown>
  roast?: string
  rewrite?: string
  createdAt: number
}

// In-memory store for local dev only.
// On Vercel, Supabase is the source of truth.
const localStore = new Map<string, RoastSession>()

export function getRoastStore(): Map<string, RoastSession> {
  return localStore
}

export function storeSet(id: string, session: RoastSession): void {
  localStore.set(id, session)
}

export function storeGet(id: string): RoastSession | undefined {
  return localStore.get(id)
}