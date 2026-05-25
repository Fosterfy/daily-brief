'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'

const SECTION_MAP: [RegExp, string][] = [
  [/sport|football|basketball|baseball|soccer|hockey|tennis|nfl|nba|mlb|nhl/i, '#d97706'],
  [/tech|technology|software|ai|artificial|digital|cyber|silicon/i, '#2563eb'],
  [/econom|business|financ|trade|gdp|inflation|employment|labor/i, '#059669'],
  [/polit|government|congress|senate|house|election|democrat|republican|white house|president/i, '#6b7280'],
  [/stock|market|nasdaq|dow|s&p|invest|nyse|fund|equit|bond/i, '#7c3aed'],
]

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in (node as object)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return extractText(el.props.children)
  }
  return ''
}

function getSectionColor(children: React.ReactNode): string | null {
  const text = extractText(children)
  for (const [pattern, color] of SECTION_MAP) {
    if (pattern.test(text)) return color
  }
  return null
}

function getCellClass(children: React.ReactNode): string | null {
  const text = extractText(children).trim()
  if (/^\+/.test(text) || /\+\d/.test(text) || /▲|↑/.test(text)) return 'cell-positive'
  if (/^[-−]/.test(text) || /▼|↓/.test(text)) return 'cell-negative'
  return null
}

const components: Components = {
  h2({ children }) {
    const color = getSectionColor(children)
    return (
      <h2 style={color ? { borderLeftColor: color } : undefined}>
        {children}
      </h2>
    )
  },
  td({ children, node: _node, ...props }) {
    const cls = getCellClass(children)
    return (
      <td {...props} className={cls ?? undefined}>
        {children}
      </td>
    )
  },
  a({ href, children }) {
    return (
      <a href={href} rel="noopener noreferrer">
        {children}
      </a>
    )
  },
}

export function BriefContent({ content }: { content: string }) {
  return (
    <div className="brief-content animate-fade-up">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
