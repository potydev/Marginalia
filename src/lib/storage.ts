'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import type { Vocabulary } from '@/payload-types'
import { fallbackVocabulary } from './default-vocabulary'

export interface StoredVocabularyItem extends Vocabulary {
  srsInterval?: number // Interval in days (e.g. 0.01 for 10 min, 1 for 1 day, 3 for 3 days, 7 for 7 days)
  srsRepetitions?: number
  lastReviewed?: string
  nextReview?: string
  missCount?: number
}

export interface StudySessionLog {
  id: string
  date: string
  minutes: number
  cardsReviewed: number
  accuracy: number
  missedWords: string[]
}

export interface StudyActivity {
  streakDays: number
  lastActiveDate: string
  tallyDaysThisMonth: number[]
  totalMinutesThisWeek: number
  totalHoursLifetime: number
  missHistory: Record<string, number>
  sessions: StudySessionLog[]
}

export interface LearnerProfile {
  name: string
  targetLanguage: 'japanese' | 'korean' | 'spanish' | 'english' | 'indonesian'
  level: string
  dailyGoalMinutes: number
  weeklyGoalMinutes: number
  theme: 'paper' | 'night'
  furiganaDefault: boolean
  romanizationDefault: boolean
  fontSize: number
}

export interface JournalEntry {
  id: string
  date: string
  promptId: string
  promptTitle: string
  promptCategory: string
  originalText: string
  revisedText: string
  wordCount: number
  feedbackNotes: string[]
}

export interface CustomReadingPassage {
  id: string
  title: string
  language: string
  level: string
  content: string
  createdAt: string
}

const VOCAB_STORAGE_KEY = 'marginalia_vocabulary'
const ACTIVITY_STORAGE_KEY = 'marginalia_study_activity'
const PROFILE_STORAGE_KEY = 'marginalia_learner_profile'
const JOURNAL_STORAGE_KEY = 'marginalia_writing_journal'
const CUSTOM_PASSAGE_KEY = 'marginalia_custom_passage'

const EVENT_VOCAB_CHANGED = 'marginalia:vocab-changed'
const EVENT_ACTIVITY_CHANGED = 'marginalia:activity-changed'
const EVENT_PROFILE_CHANGED = 'marginalia:profile-changed'
const EVENT_JOURNAL_CHANGED = 'marginalia:journal-changed'
const EVENT_CUSTOM_PASSAGE_CHANGED = 'marginalia:custom-passage-changed'

export const DEFAULT_LEARNER_PROFILE: LearnerProfile = {
  name: 'Rani',
  targetLanguage: 'japanese',
  level: 'N4',
  dailyGoalMinutes: 15,
  weeklyGoalMinutes: 100,
  theme: 'paper',
  furiganaDefault: true,
  romanizationDefault: true,
  fontSize: 16,
}

export const DEFAULT_STUDY_ACTIVITY: StudyActivity = {
  streakDays: 47,
  lastActiveDate: new Date().toISOString().slice(0, 10),
  tallyDaysThisMonth: [1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 16, 17, 18],
  totalMinutesThisWeek: 82,
  totalHoursLifetime: 42,
  missHistory: {
    '助詞 (particles)': 12,
    木漏れ日: 3,
    寄り道: 2,
    たしかに: 1,
  },
  sessions: [
    {
      id: 'session-prev-1',
      date: new Date(Date.now() - 86400000).toISOString(),
      minutes: 14,
      cardsReviewed: 16,
      accuracy: 87,
      missedWords: ['木漏れ日'],
    },
  ],
}

// ──────────────────────────────────────────
// Vocabulary Storage
// ──────────────────────────────────────────

export function getStoredVocabulary(): StoredVocabularyItem[] {
  if (typeof window === 'undefined') return fallbackVocabulary as StoredVocabularyItem[]
  try {
    const raw = window.localStorage.getItem(VOCAB_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(fallbackVocabulary))
      return fallbackVocabulary as StoredVocabularyItem[]
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed
    }
    return fallbackVocabulary as StoredVocabularyItem[]
  } catch {
    return fallbackVocabulary as StoredVocabularyItem[]
  }
}

export function saveStoredVocabulary(words: StoredVocabularyItem[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(VOCAB_STORAGE_KEY, JSON.stringify(words))
    window.dispatchEvent(new CustomEvent(EVENT_VOCAB_CHANGED, { detail: words }))
  } catch (err) {
    console.error('Failed to save vocabulary to localStorage:', err)
  }
}

export function addVocabularyItem(
  item: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>,
): StoredVocabularyItem {
  const current = getStoredVocabulary()
  const existing = current.find(
    (w) =>
      w.word.trim().toLowerCase() === item.word.trim().toLowerCase() &&
      w.language === item.language,
  )
  if (existing) {
    return existing
  }

  const now = new Date().toISOString()
  const newItem: StoredVocabularyItem = {
    ...item,
    id: `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: now,
    updatedAt: now,
    srsInterval: 0,
    srsRepetitions: 0,
    missCount: 0,
  }

  const updated = [newItem, ...current]
  saveStoredVocabulary(updated)
  return newItem
}

export function updateVocabularyItem(
  id: string,
  updates: Partial<StoredVocabularyItem>,
): StoredVocabularyItem | null {
  const current = getStoredVocabulary()
  let target: StoredVocabularyItem | null = null
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

export function recordWordReview(
  id: string,
  rating: 'Again' | 'Hard' | 'Good' | 'Easy',
): StoredVocabularyItem | null {
  const current = getStoredVocabulary()
  const item = current.find((w) => w.id === id)
  if (!item) return null

  const now = Date.now()
  const currentReps = item.srsRepetitions || 0
  const currentInterval = item.srsInterval || 0

  let newInterval = 1
  let newReps = currentReps
  let newStatus: 'new' | 'learning' | 'known' = item.status
  let missCount = item.missCount || 0

  if (rating === 'Again') {
    newReps = 0
    newInterval = 0.01 // ~10 minutes
    newStatus = 'learning'
    missCount += 1
  } else if (rating === 'Hard') {
    newReps = Math.max(1, currentReps)
    newInterval = 1 // 1 day
    newStatus = 'learning'
  } else if (rating === 'Good') {
    newReps = currentReps + 1
    newInterval = currentInterval > 0 ? Math.max(3, Math.round(currentInterval * 1.8)) : 3
    newStatus = newReps >= 2 ? 'known' : 'learning'
  } else if (rating === 'Easy') {
    newReps = currentReps + 2
    newInterval = currentInterval > 0 ? Math.max(7, Math.round(currentInterval * 2.5)) : 7
    newStatus = 'known'
  }

  const nextReviewDate = new Date(now + Math.round(newInterval * 24 * 60 * 60 * 1000)).toISOString()

  return updateVocabularyItem(id, {
    srsInterval: newInterval,
    srsRepetitions: newReps,
    status: newStatus,
    missCount,
    lastReviewed: new Date(now).toISOString(),
    nextReview: nextReviewDate,
  })
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

export function resetVocabularyToDefault(): StoredVocabularyItem[] {
  saveStoredVocabulary(fallbackVocabulary as StoredVocabularyItem[])
  return fallbackVocabulary as StoredVocabularyItem[]
}

// ──────────────────────────────────────────
// Study Activity Storage
// ──────────────────────────────────────────

export function getStoredStudyActivity(): StudyActivity {
  if (typeof window === 'undefined') return DEFAULT_STUDY_ACTIVITY
  try {
    const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(DEFAULT_STUDY_ACTIVITY))
      return DEFAULT_STUDY_ACTIVITY
    }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_STUDY_ACTIVITY, ...parsed }
  } catch {
    return DEFAULT_STUDY_ACTIVITY
  }
}

export function saveStoredStudyActivity(activity: StudyActivity): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activity))
    window.dispatchEvent(new CustomEvent(EVENT_ACTIVITY_CHANGED, { detail: activity }))
  } catch (err) {
    console.error('Failed to save study activity to localStorage:', err)
  }
}

export function recordStudySession({
  minutes,
  cardsReviewed,
  accuracy,
  missedWords,
}: {
  minutes: number
  cardsReviewed: number
  accuracy: number
  missedWords: string[]
}): StudyActivity {
  const current = getStoredStudyActivity()
  const todayDay = new Date().getDate()
  const now = new Date().toISOString()

  const newSession: StudySessionLog = {
    id: `sess-${Date.now()}`,
    date: now,
    minutes,
    cardsReviewed,
    accuracy,
    missedWords,
  }

  const updatedTally = current.tallyDaysThisMonth.includes(todayDay)
    ? current.tallyDaysThisMonth
    : [...current.tallyDaysThisMonth, todayDay].sort((a, b) => a - b)

  const updatedMisses = { ...current.missHistory }
  for (const word of missedWords) {
    if (word) {
      updatedMisses[word] = (updatedMisses[word] || 0) + 1
    }
  }

  const updatedActivity: StudyActivity = {
    ...current,
    lastActiveDate: now.slice(0, 10),
    tallyDaysThisMonth: updatedTally,
    totalMinutesThisWeek: current.totalMinutesThisWeek + minutes,
    totalHoursLifetime: Number((current.totalHoursLifetime + minutes / 60).toFixed(1)),
    missHistory: updatedMisses,
    sessions: [newSession, ...current.sessions].slice(0, 50),
  }

  saveStoredStudyActivity(updatedActivity)
  return updatedActivity
}

// ──────────────────────────────────────────
// Learner Profile Storage
// ──────────────────────────────────────────

export function getStoredLearnerProfile(): LearnerProfile {
  if (typeof window === 'undefined') return DEFAULT_LEARNER_PROFILE
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_LEARNER_PROFILE))
      return DEFAULT_LEARNER_PROFILE
    }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_LEARNER_PROFILE, ...parsed }
  } catch {
    return DEFAULT_LEARNER_PROFILE
  }
}

export function saveStoredLearnerProfile(profile: LearnerProfile): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
    window.dispatchEvent(new CustomEvent(EVENT_PROFILE_CHANGED, { detail: profile }))
  } catch (err) {
    console.error('Failed to save learner profile to localStorage:', err)
  }
}

export function updateLearnerProfile(updates: Partial<LearnerProfile>): LearnerProfile {
  const current = getStoredLearnerProfile()
  const updated = { ...current, ...updates }
  saveStoredLearnerProfile(updated)
  return updated
}

// ──────────────────────────────────────────
// Writing Journal Storage
// ──────────────────────────────────────────

export const DEFAULT_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-entry-1',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    promptId: 'prompt-14',
    promptTitle: 'Describe your breakfast using three new words.',
    promptCategory: 'DAILY LIFE',
    originalText: '朝はトーストとコーヒーを食べました。それから、いそがしい駅に行きました。',
    revisedText: '朝はトーストとコーヒーを飲みました。それから、にぎやかな駅に行きました。',
    wordCount: 35,
    feedbackNotes: [
      'Coffee is drunk (飲みました), not eaten.',
      'A lively station is にぎやかな, whereas いそがしい describes a person.',
    ],
  },
]

export function getStoredJournal(): JournalEntry[] {
  if (typeof window === 'undefined') return DEFAULT_JOURNAL_ENTRIES
  try {
    const raw = window.localStorage.getItem(JOURNAL_STORAGE_KEY)
    if (!raw) {
      window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(DEFAULT_JOURNAL_ENTRIES))
      return DEFAULT_JOURNAL_ENTRIES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_JOURNAL_ENTRIES
  } catch {
    return DEFAULT_JOURNAL_ENTRIES
  }
}

export function saveStoredJournal(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(entries))
    window.dispatchEvent(new CustomEvent(EVENT_JOURNAL_CHANGED, { detail: entries }))
  } catch (err) {
    console.error('Failed to save journal to localStorage:', err)
  }
}

export function addJournalEntry(
  entry: Omit<JournalEntry, 'id' | 'date'> & { date?: string },
): JournalEntry {
  const current = getStoredJournal()
  const newEntry: JournalEntry = {
    ...entry,
    id: `journal-${Date.now()}`,
    date: entry.date || new Date().toISOString(),
  }
  const updated = [newEntry, ...current]
  saveStoredJournal(updated)
  return newEntry
}

export function deleteJournalEntry(id: string): boolean {
  const current = getStoredJournal()
  const filtered = current.filter((item) => item.id !== id)
  if (filtered.length !== current.length) {
    saveStoredJournal(filtered)
    return true
  }
  return false
}

// ──────────────────────────────────────────
// Custom Reading Passage Storage
// ──────────────────────────────────────────

export function getStoredCustomPassage(): CustomReadingPassage | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CUSTOM_PASSAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveStoredCustomPassage(passage: CustomReadingPassage | null): void {
  if (typeof window === 'undefined') return
  try {
    if (passage) {
      window.localStorage.setItem(CUSTOM_PASSAGE_KEY, JSON.stringify(passage))
    } else {
      window.localStorage.removeItem(CUSTOM_PASSAGE_KEY)
    }
    window.dispatchEvent(new CustomEvent(EVENT_CUSTOM_PASSAGE_CHANGED, { detail: passage }))
  } catch (err) {
    console.error('Failed to save custom passage to localStorage:', err)
  }
}

// ──────────────────────────────────────────
// Reactive Hooks
// ──────────────────────────────────────────

function createSubscription(eventName: string) {
  return (callback: () => void) => {
    if (typeof window === 'undefined') return () => {}
    const handler = () => callback()
    window.addEventListener(eventName, handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener(eventName, handler)
      window.removeEventListener('storage', handler)
    }
  }
}

const subscribeVocab = createSubscription(EVENT_VOCAB_CHANGED)
const subscribeActivity = createSubscription(EVENT_ACTIVITY_CHANGED)
const subscribeProfile = createSubscription(EVENT_PROFILE_CHANGED)
const subscribeJournal = createSubscription(EVENT_JOURNAL_CHANGED)
const subscribeCustomPassage = createSubscription(EVENT_CUSTOM_PASSAGE_CHANGED)

export function useVocabularyStore(serverWords?: Vocabulary[]) {
  const [mounted, setMounted] = useState(false)
  const clientWords = useSyncExternalStore(
    subscribeVocab,
    getStoredVocabulary,
    () => (serverWords || fallbackVocabulary) as StoredVocabularyItem[],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    words: mounted ? clientWords : ((serverWords || fallbackVocabulary) as StoredVocabularyItem[]),
    addItem: addVocabularyItem,
    updateItem: updateVocabularyItem,
    recordReview: recordWordReview,
    deleteItem: deleteVocabularyItem,
    resetToDefault: resetVocabularyToDefault,
  }
}

export function useStudyActivityStore() {
  const [mounted, setMounted] = useState(false)
  const activity = useSyncExternalStore(
    subscribeActivity,
    getStoredStudyActivity,
    () => DEFAULT_STUDY_ACTIVITY,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    activity: mounted ? activity : DEFAULT_STUDY_ACTIVITY,
    recordSession: recordStudySession,
  }
}

export function useLearnerProfileStore() {
  const [mounted, setMounted] = useState(false)
  const profile = useSyncExternalStore(
    subscribeProfile,
    getStoredLearnerProfile,
    () => DEFAULT_LEARNER_PROFILE,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    profile: mounted ? profile : DEFAULT_LEARNER_PROFILE,
    updateProfile: updateLearnerProfile,
  }
}

export function useJournalStore() {
  const [mounted, setMounted] = useState(false)
  const entries = useSyncExternalStore(
    subscribeJournal,
    getStoredJournal,
    () => DEFAULT_JOURNAL_ENTRIES,
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    entries: mounted ? entries : DEFAULT_JOURNAL_ENTRIES,
    addEntry: addJournalEntry,
    deleteEntry: deleteJournalEntry,
  }
}

export function useCustomPassageStore() {
  const [mounted, setMounted] = useState(false)
  const passage = useSyncExternalStore(subscribeCustomPassage, getStoredCustomPassage, () => null)

  useEffect(() => {
    setMounted(true)
  }, [])

  return {
    passage: mounted ? passage : null,
    savePassage: saveStoredCustomPassage,
    clearPassage: () => saveStoredCustomPassage(null),
  }
}
