import { PageHeader } from '@/components/page-parts'
import { NotebookTable } from '@/components/study-widgets'
import { getVocabulary } from '@/lib/vocabulary'

export default async function NotebookPage() {
  const words = await getVocabulary()
  return (
    <>
      <PageHeader
        description="A dictionary with your fingerprints on it."
        eyebrow="VOCABULARY NOTEBOOK / 312 ENTRIES"
        note={
          <>
            <span>INDEX</span>
            <p>
              Sorted by recent
              <br />
              attention.
            </p>
          </>
        }
        title="Words worth keeping"
      />
      <NotebookTable words={words} />
    </>
  )
}
