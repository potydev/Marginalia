import { PageHeader } from '@/components/page-parts'
import { WritingPad } from '@/components/study-widgets'

export default function WritingPage() {
  return (
    <>
      <PageHeader
        description="Three sentences are enough to reveal a useful mistake."
        eyebrow="WRITING PRACTICE / FRIDAY"
        note={
          <>
            <span>RED PEN</span>
            <p>
              Corrections explain
              <br />
              themselves.
            </p>
          </>
        }
        title="Put the words to work"
      />
      <WritingPad />
    </>
  )
}
