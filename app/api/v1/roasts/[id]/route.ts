import { supabaseServer } from '@/lib/supabase'
import { getRoastStore } from '@/lib/store'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  console.log('[GET] Fetching roast:', id)

  const { data, error } = await supabaseServer
    .from('roasts')
    .select('*')
    .eq('id', id)
    .single()

  if (data) {
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

  const roastStore = getRoastStore()
  const cached = roastStore.get(id)

  if (cached) {
    return Response.json({ data: cached })
  }

  console.log('[GET] Not found in Supabase or memory')
  return Response.json(
    { error: 'Roast not found' },
    { status: 404 }
  )
}
