const isProd = !!(
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
)

function dateToScore(dateStr: string): number {
  return parseInt(dateStr.replace(/-/g, ''), 10)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _redis: any = null
async function getRedis() {
  if (!_redis) {
    const { Redis } = await import('@upstash/redis')
    _redis = Redis.fromEnv()
  }
  return _redis
}

export async function getBrief(date: string): Promise<string | null> {
  if (!isProd) {
    const { mockGet } = await import('./kv-mock')
    return mockGet(date)
  }
  const redis = await getRedis()
  return redis.get(`brief:${date}`)
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
  return redis.zrange('briefs:index', 0, -1, { rev: true })
}

export async function getLatestBrief(): Promise<{ date: string; content: string } | null> {
  const dates = await listBriefs()
  if (!dates.length) return null
  const date = dates[0]
  const content = await getBrief(date)
  if (!content) return null
  return { date, content }
}
