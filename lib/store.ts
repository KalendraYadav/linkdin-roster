// Persist roastStore across Next.js hot reloads in development
// by attaching it to the Node.js global object.

type RoastSession = {
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

declare global {
  // eslint-disable-next-line no-var
  var roastStore: Map<string, RoastSession> | undefined
}

if (!global.roastStore) {
  global.roastStore = new Map<string, RoastSession>()
}

export const roastStore = global.roastStore
