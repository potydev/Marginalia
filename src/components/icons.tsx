import type { ReactNode } from 'react'

export type IconName =
  | 'arrow'
  | 'audio'
  | 'book'
  | 'cards'
  | 'chart'
  | 'check'
  | 'chevron'
  | 'download'
  | 'headphones'
  | 'menu'
  | 'moon'
  | 'notebook'
  | 'pen'
  | 'plus'
  | 'record'
  | 'search'
  | 'settings'
  | 'sun'
  | 'upload'

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    audio: (
      <>
        <path d="M11 5 6 9H3v6h3l5 4z" />
        <path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12" />
      </>
    ),
    book: (
      <>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v15H6.5A2.5 2.5 0 0 0 4 20.5zM20 5.5A2.5 2.5 0 0 0 17.5 3H13v15h4.5a2.5 2.5 0 0 1 2.5 2.5z" />
      </>
    ),
    cards: (
      <>
        <rect x="5" y="4" width="15" height="16" rx="1" />
        <path d="m5 7-2 .5v12L15 22l.5-2M9 9h7M9 13h5" />
      </>
    ),
    chart: <path d="M4 19V9m5 10V5m5 14v-7m5 7V3M2 21h20" />,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 21h16" />,
    headphones: (
      <path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v7H5a1 1 0 0 1-1-1zm16 0h-3v7h2a1 1 0 0 0 1-1z" />
    ),
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    moon: <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5a8.5 8.5 0 1 0 12 12Z" />,
    notebook: (
      <>
        <rect x="5" y="3" width="15" height="18" rx="1" />
        <path d="M9 3v18M3 7h4M3 12h4M3 17h4M12 8h5M12 12h5" />
      </>
    ),
    pen: <path d="m4 20 4.5-1 10-10-3.5-3.5-10 10zM13.5 7 17 10.5M4 20l1-4.5 3.5 3.5" />,
    plus: <path d="M12 5v14M5 12h14" />,
    record: <circle cx="12" cy="12" r="7" />,
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19 15.5 21 17l-4 4-1.5-2a8 8 0 0 1-3.5 1L11 22H7v-2a8 8 0 0 1-2.5-1.5L2.5 19 1 15l2-1a8 8 0 0 1 0-4L1 9l1.5-4 2 .5A8 8 0 0 1 7 4V2h4l1 2a8 8 0 0 1 3.5 1L17 3l4 4-2 1.5a8 8 0 0 1 0 7Z" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </>
    ),
    upload: <path d="M12 21V9m-5 5 5-5 5 5M4 3h16" />,
  }

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  )
}
