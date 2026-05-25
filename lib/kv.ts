const isProd = !!process.env.UPSTASH_REDIS_REST_URL

function dateToScore(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10)
}

export async function getBrief(date: string): Promise<string | null> {
  if (!isProd) {
    const { mockGet } = await import('./kv-mock')
    return mockGet(date)
  }
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  return redis.get<string>(`brief:${date}`)
}

export async function storeBrief(date: string, content: string): Promise<void> {
  if (!isProd) {
    const { mockSet } = await import('./kv-mock')
    mockSet(date, content)
    return
  }
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  await redis.set(`brief:${date}`, content)
  await redis.zadd('briefs:index', { score: dateToScore(date), member: date })
}

export async function listBriefs(): Promise<string[]> {
  if (!isProd) {
    const { mockList } = await import('./kv-mock')
    return mockList()
  }
  const { Redis } = await import('@upstash/redis')
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  })
  const dates = await redis.zrange<string[]>('briefs:index', 0, -1, { rev: true })
  return dates
}

export async function getLatestBrief(): Promise<{ date: string; content: string } | null> {
  const dates = await listBriefs()
  if (!dates.length) return null
  const date = dates[0]
  const content = await getBrief(date)
  if (!content) return null
  return { date, content }
}
