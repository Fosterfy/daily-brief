import Link from 'next/link'

interface SiteNavProps {
  showArchiveLink?: boolean
  showTodayLink?: boolean
  showBackToArchive?: boolean
}

export function SiteNav({ showArchiveLink, showTodayLink, showBackToArchive }: SiteNavProps) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur-sm" style={{ backgroundColor: 'color-mix(in srgb, var(--clr-paper) 90%, transparent)' }}>
      <div className="mx-auto flex max-w-[720px] items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="text-xs font-semibold tracking-[0.18em] uppercase"
          style={{ color: 'var(--clr-ink-muted)' }}
        >
          Daily Brief
        </Link>

        <nav className="flex items-center gap-5">
          {showBackToArchive && (
            <Link
              href="/archive"
              className="nav-link group flex items-center gap-1 text-sm"
              style={{ color: 'var(--clr-ink-muted)' }}
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-0.5">←</span>
              <span>Archive</span>
            </Link>
          )}
          {showTodayLink && (
            <Link
              href="/"
              className="nav-link text-sm"
              style={{ color: 'var(--clr-ink-muted)' }}
            >
              Today
            </Link>
          )}
          {showArchiveLink && (
            <Link
              href="/archive"
              className="nav-link group flex items-center gap-1 text-sm"
              style={{ color: 'var(--clr-ink-muted)' }}
            >
              <span>Past briefings</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          )}
        </nav>
      </div>
      <div style={{ height: '1px', backgroundColor: 'var(--clr-border)' }} />
    </header>
  )
}
