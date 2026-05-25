import { NextRequest } from 'next/server'
import { storeBrief } from '@/lib/kv'
import { isValidDate } from '@/lib/utils'

export async function POST(req: NextRequest) {
  // Auth
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const secret = process.env.PUBLISH_SECRET

  if (!secret || token !== secret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Body must be a JSON object' }, { status: 400 })
  }

  const { date, content } = body as Record<string, unknown>

  if (typeof date !== 'string' || !isValidDate(date)) {
    return Response.json(
      { error: 'Invalid or missing "date". Expected YYYY-MM-DD.' },
      { status: 400 }
    )
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    return Response.json(
      { error: 'Invalid or missing "content". Must be a non-empty string.' },
      { status: 400 }
    )
  }

  // Store
  try {
    await storeBrief(date, content.trim())
  } catch (err) {
    console.error('Failed to store brief:', err)
    return Response.json({ error: 'Storage error' }, { status: 500 })
  }

  return Response.json({ ok: true, date }, { status: 200 })
}
