import { getLatestBrief } from '@/lib/kv'
import { formatDateShort } from '@/lib/utils'
import { SiteNav } from '@/components/SiteNav'
import { BriefContent } from '@/components/BriefContent'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const brief = await getLatestBrief()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-paper)' }}>
      <SiteNav showArchiveLink />

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-12 md:pt-16">
        {brief ? (
          <>
            <header className="mb-12 animate-fade-up">
              <p
                className="mb-3 text-xs font-semibold tracking-[0.16em] uppercase"
                style={{ color: 'var(--clr-ink-faint)' }}
              >
                Today&apos;s Brief
              </p>
              <h1
                className="font-display leading-none tracking-tight"
                style={{
                  fontSize: 'clamp(2.75rem, 8vw, 5rem)',
                  fontWeight: 900,
                  color: 'var(--clr-ink)',
                  fontOpticalSizing: 'auto',
                } as React.CSSProperties}
              >
                {formatDateShort(brief.date)}
              </h1>
              <div
                className="mt-6"
                style={{ height: '1px', backgroundColor: 'var(--clr-border)' }}
              />
            </header>

            <BriefContent content={brief.content} />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center animate-fade-up">
      <div
        className="mb-6 h-px w-12"
        style={{ backgroundColor: 'var(--clr-border)' }}
      />
      <p
        className="font-display text-2xl font-semibold"
        style={{ color: 'var(--clr-ink)', fontOpticalSizing: 'auto' } as React.CSSProperties}
      >
        No brief yet.
      </p>
      <p
        className="mt-2 text-sm"
        style={{ color: 'var(--clr-ink-muted)' }}
      >
        Check back at 7:30 AM.
      </p>
      <div
        className="mt-6 h-px w-12"
        style={{ backgroundColor: 'var(--clr-border)' }}
      />
    </div>
  )
}
