const redisUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
const isProd = !!redisUrl

function dateToScore(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10)
}

async function getRedis() {
  const { Redis } = await import('@upstash/redis')
  return new Redis({ url: redisUrl!, token: redisToken! })
}

export async function getBrief(date: string): Promise<string | null> {
  if (!isProd) {
    const { mockGet } = await import('./kv-mock')
    return mockGet(date)
  }
  const redis = await getRedis()
  return redis.get<string>(`brief:${date}`)
}

export async function storeBrief(date: string, content: string): Promise<void> {
  if (!isProd) {
    const { mockSet } = await import('./kv-mock')
    mockSet(date, content)
    return
  }
  const redis = await getRedis()
  await redis.set(`brief:${date}`, content)
  await redis.zadd('briefs:index', { score: dateToScore(date), member: date })
}

export async function listBriefs(): Promise<string[]> {
  if (!isProd) {
    const { mockList } = await import('./kv-mock')
    return mockList()
  }
  const redis = await getRedis()
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
