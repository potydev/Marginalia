import { PageHeader } from '@/components/page-parts'
import { AudioStudio } from '@/components/study-widgets'

export default function ListeningPage() {
  return (
    <>
      <PageHeader
        description="Hear the sentence. Borrow its rhythm. Give it back in your own voice."
        eyebrow="LISTENING & PRONUNCIATION / SHADOWING"
        note={
          <>
            <span>HEADPHONES</span>
            <p>
              One sentence
              <br />
              at a time.
            </p>
          </>
        }
        title="Follow the sound"
      />
      <AudioStudio />
    </>
  )
}
