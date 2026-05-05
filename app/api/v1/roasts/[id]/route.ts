import { roastStore } from '@/lib/store'
import { supabaseServer } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('[GET] Fetching roast:', id)

  // -- 1. Check in-memory store first (fast, for active sessions) --
  const memSession = roastStore.get(id)
  if (memSession && memSession.status === 'completed') {
    console.log('[GET] Found in memory store')
    return Response.json({ data: memSession })
  }

  // Still processing in memory
  if (memSession && memSession.status === 'processing') {
    console.log('[GET] Still processing in memory')
    return Response.json({ data: memSession })
  }

  // -- 2. Check Supabase (for persisted/shared roasts) --
  console.log('[GET] Checking Supabase...')
  const { data, error } = await supabaseServer
    .from('roasts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    console.log('[GET] Not found in Supabase:', error?.message)
    return Response.json(
      { error: 'Roast not found' },
      { status: 404 }
    )
  }

  console.log('[GET] Found in Supabase')

  return Response.json({
    data: {
      id: data.id,
      status: 'completed',
      scores: data.scores,
      roast: data.roast,
      rewrite: data.rewrite,
      createdAt: new Date(data.created_at).getTime()
    }
  })
}
