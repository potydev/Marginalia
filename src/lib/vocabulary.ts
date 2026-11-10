import { unstable_cache } from 'next/cache'
import type { Vocabulary } from '@/payload-types'
import { getPayloadClient } from './payload'
import { fallbackVocabulary } from './default-vocabulary'

export { fallbackVocabulary }

const readVocabulary = unstable_cache(
  async (): Promise<Vocabulary[]> => {
    if (!process.env.FIGMA_EID) {
      return fallbackVocabulary
    }
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'vocabulary',
        depth: 0,
        limit: 100,
        overrideAccess: false,
        sort: 'word',
      })
      if (result.docs && result.docs.length > 0) {
        return result.docs
      }
    } catch {
      // Offline or local environment outside Figma Make backend
    }
    return fallbackVocabulary
  },
  ['vocabulary-list'],
  { tags: ['vocabulary'] },
)

export async function getVocabulary(): Promise<Vocabulary[]> {
  try {
    return await readVocabulary()
  } catch {
    return fallbackVocabulary
  }
}
