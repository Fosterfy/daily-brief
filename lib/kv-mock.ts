import fs from 'fs'
import path from 'path'

const MOCK_FILE = path.join(process.cwd(), '.kv-mock.json')

interface MockStore {
  briefs: Record<string, string>
  index: string[]
}

function readStore(): MockStore {
  try {
    const raw = fs.readFileSync(MOCK_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return { briefs: {}, index: [] }
  }
}

function writeStore(store: MockStore): void {
  fs.writeFileSync(MOCK_FILE, JSON.stringify(store, null, 2), 'utf-8')
}

export function mockGet(date: string): string | null {
  const store = readStore()
  return store.briefs[date] ?? null
}

export function mockSet(date: string, content: string): void {
  const store = readStore()
  store.briefs[date] = content
  if (!store.index.includes(date)) {
    store.index.push(date)
    store.index.sort().reverse()
  }
  writeStore(store)
}

export function mockList(): string[] {
  const store = readStore()
  return [...store.index].sort().reverse()
}
