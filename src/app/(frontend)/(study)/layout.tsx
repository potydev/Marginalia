import type { ReactNode } from 'react'
import { AppShell } from '@/components/app-shell'

export default function StudyLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
