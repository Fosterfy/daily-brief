import { notFound } from 'next/navigation'
import { getBrief } from '@/lib/kv'
import { formatDateShort, isValidDate } from '@/lib/utils'
import { SiteNav } from '@/components/SiteNav'
import { BriefContent } from '@/components/BriefContent'

export const dynamic = 'force-dynamic'

export default async function BriefPage({
  params,
}: {
  params: Promise<{ date: string }>
}) {
  const { date } = await params

  if (!isValidDate(date)) notFound()

  const content = await getBrief(date)
  if (!content) notFound()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--clr-paper)' }}>
      <SiteNav showTodayLink showBackToArchive />

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-12 md:pt-16">
        <header className="mb-12 animate-fade-up">
          <p
            className="mb-3 text-xs font-semibold tracking-[0.16em] uppercase"
            style={{ color: 'var(--clr-ink-faint)' }}
          >
            Daily Brief
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
            {formatDateShort(date)}
          </h1>
          <div
            className="mt-6"
            style={{ height: '1px', backgroundColor: 'var(--clr-border)' }}
          />
        </header>

        <BriefContent content={content} />
      </main>
    </div>
  )
}
