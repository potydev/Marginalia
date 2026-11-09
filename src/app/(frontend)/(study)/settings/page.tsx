import { PageHeader } from '@/components/page-parts'
import { SettingsPanel } from '@/components/study-widgets'

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        description="Adjust the desk. The work stays the work."
        eyebrow="SETTINGS / RANI’S NOTEBOOK"
        note={
          <>
            <span>PREFERENCES</span>
            <p>
              Paper clips go
              <br />
              in this drawer.
            </p>
          </>
        }
        title="Make it yours"
      />
      <SettingsPanel />
    </>
  )
}
