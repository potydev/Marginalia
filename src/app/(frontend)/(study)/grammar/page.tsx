import { PageHeader } from '@/components/page-parts'
import { GrammarViewer } from '@/components/study-widgets'

export default function GrammarPage() {
  return (
    <>
      <PageHeader
        description="Rules, formulas, and the mistakes people actually make in real conversation."
        eyebrow="GRAMMAR NOTES / HANDBOOK"
        note={
          <>
            <span>BOOKMARK</span>
            <p>
              Five core
              <br />
              patterns.
            </p>
          </>
        }
        title="Formulas on the page"
      />
      <GrammarViewer />
    </>
  )
}
