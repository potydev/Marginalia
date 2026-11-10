import type { ReactNode } from 'react'
import { MarginNote } from './ui'

export { Stamp } from './ui'

export function PageHeader({
  eyebrow,
  title,
  description,
  note,
}: {
  eyebrow: string
  title: string
  description?: string
  note?: ReactNode
}) {
  return (
    <header className="page-heading">
      <aside className="page-margin-note">
        <MarginNote>{note}</MarginNote>
      </aside>
      <div className="page-heading-copy">
        <p className="eyebrow" suppressHydrationWarning>
          {eyebrow}
        </p>
        <h1>{title}</h1>
        {description && (
          <p className="page-dek" suppressHydrationWarning>
            {description}
          </p>
        )}
      </div>
    </header>
  )
}
