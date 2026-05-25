import Link from 'next/link'
import { listBriefs, getBrief } from '@/lib/kv'
import { formatDateShort, formatMonth, getSnippet } from '@/lib/utils'
import { SiteNav } from '@/components/SiteNav'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const dates = await listBriefs()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-paper)' }}>
      <SiteNav showTodayLink />

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-12 md:pt-16">
        <header className="mb-12 animate-fade-up">
          <p
            className="mb-3 text-xs font-semibold tracking-[0.16em] uppercase"
            style={{ color: 'var(--clr-ink-faint)' }}
          >
            Archive
          </p>
          <h1
            className="font-display leading-none tracking-tight"
            style={{
              fontSize: 'clamp(2.25rem, 6vw, 3.5rem)',
              fontWeight: 900,
              color: 'var(--clr-ink)',
              fontOpticalSizing: 'auto',
            } as React.CSSProperties}
          >
            Past Briefings
          </h1>
        </header>

        {dates.length === 0 ? (
          <EmptyArchive />
        ) : (
          <BriefList dates={dates} />
        )}
      </main>
    </div>
  )
}

async function BriefList({ dates }: { dates: string[] }) {
  // Load snippets for all dates
  const items = await Promise.all(
    dates.map(async (date) => {
      const content = await getBrief(date)
      return { date, snippet: content ? getSnippet(content) : '' }
    })
  )

  // Group by month key (YYYY-MM)
  const grouped = new Map<string, typeof items>()
  for (const item of items) {
    const monthKey = item.date.substring(0, 7)
    const group = grouped.get(monthKey) ?? []
    group.push(item)
    grouped.set(monthKey, group)
  }

  return (
    <div className="animate-fade-up delay-100">
      {[...grouped.entries()].map(([monthKey, monthItems], groupIndex) => (
        <section key={monthKey} className={groupIndex > 0 ? 'mt-10' : ''}>
          {/* Month header */}
          <div className="mb-4 flex items-center gap-4">
            <span
              className="text-xs font-semibold tracking-[0.12em] uppercase whitespace-nowrap"
              style={{ color: 'var(--clr-ink-muted)' }}
            >
              {formatMonth(monthItems[0].date)}
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: 'var(--clr-border)' }} />
          </div>

          {/* Brief items */}
          <div className="space-y-px">
            {monthItems.map(({ date, snippet }) => (
              <ArchiveItem key={date} date={date} snippet={snippet} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function ArchiveItem({ date, snippet }: { date: string; snippet: string }) {
  return (
    <Link
      href={`/archive/${date}`}
      className="archive-item group block rounded-sm px-0 py-4 transition-colors duration-150"
      style={{ borderBottom: '1px solid var(--clr-border)' }}
    >
      <p
        className="font-display text-lg font-semibold leading-snug tracking-tight transition-colors duration-150 group-hover:opacity-80"
        style={{
          color: 'var(--clr-ink)',
          fontOpticalSizing: 'auto',
        } as React.CSSProperties}
      >
        {formatDateShort(date)}
      </p>
      {snippet && (
        <p
          className="mt-1 text-sm leading-relaxed line-clamp-2"
          style={{ color: 'var(--clr-ink-muted)' }}
        >
          {snippet}
        </p>
      )}
    </Link>
  )
}

function EmptyArchive() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center animate-fade-up delay-100">
      <div className="h-px w-12 mb-6" style={{ backgroundColor: 'var(--clr-border)' }} />
      <p className="font-display text-xl font-semibold" style={{ color: 'var(--clr-ink)', fontOpticalSizing: 'auto' } as React.CSSProperties}>
        No past briefings yet.
      </p>
      <p className="mt-2 text-sm" style={{ color: 'var(--clr-ink-muted)' }}>
        They&apos;ll appear here once published.
      </p>
      <div className="h-px w-12 mt-6" style={{ backgroundColor: 'var(--clr-border)' }} />
    </div>
  )
}
