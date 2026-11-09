import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ink' | 'outline'
}) {
  return (
    <button
      className={`${variant === 'primary' ? 'primary-button' : `${variant}-button`} ${className}`}
      {...props}
    />
  )
}

export function Stamp({ children, tone = 'red' }: { children: ReactNode; tone?: 'red' | 'green' }) {
  return <span className={`stamp stamp-${tone}`}>{children}</span>
}

export function MarginNote({ children }: { children?: ReactNode }) {
  if (!children) return null
  return (
    <details className="margin-note">
      <summary>
        <span>Margin note</span>
        <i aria-hidden="true">＋</i>
      </summary>
      <div className="margin-note-content">{children}</div>
    </details>
  )
}

export function IndexCard({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`index-card-component ${className}`} {...props}>
      {children}
    </div>
  )
}

export function WordPopover({
  word,
  reading,
  meaning,
  children,
  onClose,
}: {
  word: string
  reading: string
  meaning: string
  children?: ReactNode
  onClose?: () => void
}) {
  return (
    <div className="word-popover" role="status">
      {onClose && (
        <button
          aria-label="Close definition"
          className="word-popover-close"
          onClick={onClose}
          type="button"
        >
          ×
        </button>
      )}
      <strong>{word}</strong>
      <span className="word-popover-reading">{reading}</span>
      <p>{meaning}</p>
      {children}
    </div>
  )
}

export function Tag({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: 'neutral' | 'ochre' | 'moss'
}) {
  return <span className={`tag tag-${tone}`}>{children}</span>
}

export function Table({
  children,
  label,
  className = '',
}: {
  children: ReactNode
  label: string
  className?: string
}) {
  return (
    <div aria-label={label} className={`table-component ${className}`} role="table">
      {children}
    </div>
  )
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: readonly T[]
  value: T
  onChange: (value: T) => void
  label: string
}) {
  return (
    <div aria-label={label} className="tabs-component" role="tablist">
      {items.map((item) => (
        <button
          aria-selected={value === item}
          className={value === item ? 'active' : ''}
          key={item}
          onClick={() => onChange(item)}
          role="tab"
          type="button"
        >
          {item}
        </button>
      ))}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`input-component ${className}`} {...props} />
}
