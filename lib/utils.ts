export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function formatMonth(dateStr: string): string {
  const [year, month] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function isValidDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function getSnippet(markdown: string, maxLen = 150): string {
  const lines = markdown.split('\n')
  const textParts: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('#')) continue
    if (trimmed.startsWith('|')) continue
    if (trimmed === '---' || trimmed === '***') continue

    let text = trimmed
    if (trimmed.startsWith('> ')) text = trimmed.slice(2)
    else if (/^[-*+]\s/.test(trimmed)) text = trimmed.replace(/^[-*+]\s+/, '')
    else if (/^\d+\.\s/.test(trimmed)) text = trimmed.replace(/^\d+\.\s+/, '')

    text = text
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1')
      .replace(/__(.+?)__/g, '$1')
      .replace(/_(.+?)_/g, '$1')
      .replace(/`(.+?)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim()

    if (text) {
      textParts.push(text)
      if (textParts.join(' ').length >= maxLen) break
    }
  }

  const result = textParts.join(' ').trim()
  return result.length > maxLen
    ? result.substring(0, maxLen).trimEnd() + '…'
    : result
}
