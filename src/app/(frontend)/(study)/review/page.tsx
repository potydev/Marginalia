import { PageHeader } from '@/components/page-parts'
import { ReviewSession } from '@/components/study-widgets'

export default function ReviewPage() {
  return (
    <>
      <PageHeader
        eyebrow="SPACED REPETITION / SESSION 47"
        note={
          <>
            <span>18 DUE</span>
            <p>
              About twelve
              <br />
              quiet minutes.
            </p>
          </>
        }
        title="Review"
      />
      <ReviewSession />
    </>
  )
}
