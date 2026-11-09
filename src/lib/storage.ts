'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Vocabulary } from '@/payload-types'
import { fallbackVocabulary } from './default-vocabulary'

const VOCAB_STORAGE_KEY = 'marginalia_vocabulary'
const EVENT_NAME = 'marginalia:vocab-changed'

export function getStoredVocabulary(): Vocabulary[] {
  if (typeof window === 'undefined') return fallbackVocabulary
  try {
    const raw = window.localStorage.getItem(VOCAB_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(fallbackVocabulary))
      return fallbackVocabulary
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return fallbackVocabulary
  } catch {
    return fallbackVocabulary
  }
}

export function saveStoredVocabulary(words: Vocabulary[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(words))
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: words }))
  } catch (err) {
    console.error('Failed to save vocabulary to localStorage:', err)
  }
}

export function addVocabularyItem(
  item: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>,
): Vocabulary {
  const current = getStoredVocabulary()
  // Check if word already exists in the same language
  const existing = current.find(
    (w) =>
      w.word.trim().toLowerCase() === item.word.trim().toLowerCase() &&
      w.language === item.language,
  )
  if (existing) {
    return existing
  }

  const now = new Date().toISOString()
  const newItem: Vocabulary = {
    ...item,
    id: `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
  }

  const updated = [newItem, ...current]
  saveStoredVocabulary(updated)
  return newItem
}

export function updateVocabularyItem(id: string, updates: Partial<Vocabulary>): Vocabulary | null {
  const current = getStoredVocabulary()
  let target: Vocabulary | null = null
  const updated = current.map((item) => {
    if (item.id === id) {
      target = {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      return target
    }
    return item
  })

  if (target) {
    saveStoredVocabulary(updated)
  }
  return target
}

export function deleteVocabularyItem(id: string): boolean {
  const current = getStoredVocabulary()
  const filtered = current.filter((item) => item.id !== id)
  if (filtered.length !== current.length) {
    saveStoredVocabulary(filtered)
    return true
  }
  return false
}

export function resetVocabularyToDefault(): Vocabulary[] {
  saveStoredVocabulary(fallbackVocabulary)
  return fallbackVocabulary
}

// React external store subscription
function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}

export function useVocabularyStore(serverWords?: Vocabulary[]) {
  const [mounted, setMounted] = useState(false)
  const clientWords = useSyncExternalStore(
    subscribe,
    getStoredVocabulary,
    () => serverWords || fallbackVocabulary,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    words: mounted ? clientWords : serverWords || fallbackVocabulary,
    addItem: addVocabularyItem,
    updateItem: updateVocabularyItem,
    deleteItem: deleteVocabularyItem,
    resetToDefault: resetVocabularyToDefault,
  }
}
