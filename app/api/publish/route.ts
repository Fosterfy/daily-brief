import { NextRequest } from 'next/server'
import { storeBrief } from '@/lib/kv'
import { isValidDate, formatDate } from '@/lib/utils'

// ─── Email notification ────────────────────────────────────────────────────────
// Intentionally best-effort: a notification failure must never fail the publish.
// The KV write is the source of truth; the email is a convenience side-effect.
async function sendNotification(date: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.NOTIFICATION_EMAIL
  const siteUrl = process.env.SITE_URL

  console.log('[notify] env check — apiKey:', !!apiKey, 'to:', to, 'siteUrl:', siteUrl)
  if (!apiKey || !to || !siteUrl) {
    console.log('[notify] missing env vars, skipping')
    return
  }

  // Date is derived from the request body, not server time, to avoid timezone
  // mismatches between the publisher and the Vercel server region.
  const formattedDate = formatDate(date)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Daily Brief</title>
</head>
<body style="margin:0;padding:0;background-color:#FAFAF8;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color:#FAFAF8;">
    <tr>
      <td align="center" style="padding:48px 16px 64px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:520px;">

          <!-- Eyebrow -->
          <tr>
            <td style="padding-bottom:12px;">
              <p style="margin:0;font-size:11px;font-weight:600;
                letter-spacing:0.15em;text-transform:uppercase;
                color:#A9A49D;font-family:-apple-system,BlinkMacSystemFont,
                'Segoe UI',sans-serif;">
                Daily Brief
              </p>
            </td>
          </tr>

          <!-- Date heading -->
          <tr>
            <td style="padding-bottom:20px;border-bottom:1px solid #E0DDD7;">
              <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;
                font-size:30px;font-weight:700;line-height:1.25;
                color:#1A1A17;letter-spacing:-0.02em;">
                ${formattedDate}
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding-top:28px;padding-bottom:32px;">
              <p style="margin:0 0 28px;font-size:16px;line-height:1.7;
                color:#6C6860;font-family:-apple-system,BlinkMacSystemFont,
                'Segoe UI',sans-serif;">
                Your brief for today is ready.
              </p>
              <!-- CTA -->
              <a href="${siteUrl}"
                style="display:inline-block;background-color:#1A1A17;
                  color:#FAFAF8;text-decoration:none;font-size:14px;
                  font-weight:500;padding:13px 26px;border-radius:4px;
                  letter-spacing:0.01em;font-family:-apple-system,
                  BlinkMacSystemFont,'Segoe UI',sans-serif;">
                Read today&#39;s brief &rarr;
              </a>
            </td>
          </tr>

          <!-- Footer / archive link -->
          <tr>
            <td style="border-top:1px solid #E0DDD7;padding-top:20px;">
              <p style="margin:0;font-size:13px;
                font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <a href="${siteUrl}/archive"
                  style="color:#A9A49D;text-decoration:underline;
                    text-underline-offset:2px;">
                  View past briefings
                </a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(apiKey)
    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: `Daily Brief — ${formattedDate}`,
      html,
    })
    console.log('[notify] Resend result:', JSON.stringify(result))
  } catch (err) {
    console.error('[notify] Failed to send notification:', err)
  }
}

// ─── POST /api/publish ─────────────────────────────────────────────────────────
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

  // Notify — runs after a confirmed successful write; errors are swallowed
  // intentionally (see sendNotification above).
  await sendNotification(date)

  return Response.json({ ok: true, date }, { status: 200 })
}
