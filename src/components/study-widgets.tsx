'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import type { Vocabulary } from '@/payload-types'
import Link from 'next/link'
import { Icon } from './icons'
import { PageHeader, Stamp } from './page-parts'
import { Button, IndexCard, Input, Table, Tabs, Tag, WordPopover } from './ui'
import {
  useVocabularyStore,
  useStudyActivityStore,
  useLearnerProfileStore,
  useJournalStore,
  useCustomPassageStore,
  addVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
  recordStudySession,
  getStoredVocabulary,
  saveStoredVocabulary,
  resetVocabularyToDefault,
  getStoredStudyActivity,
  saveStoredStudyActivity,
  getStoredLearnerProfile,
  saveStoredLearnerProfile,
  getStoredJournal,
  saveStoredJournal,
  getStoredCustomPassage,
  saveStoredCustomPassage,
  DEFAULT_STUDY_ACTIVITY,
} from '@/lib/storage'

function playSpeech(text: string, lang = 'ja-JP', rate = 1) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = lang
      utterance.rate = rate
      window.speechSynthesis.speak(utterance)
    } catch {
      // Audio speech fallback
    }
  }
}

export function LandingDemo() {
  const [open, setOpen] = useState(false)

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSpeech('こもれび')
  }

  return (
    <div className="sentence-demo">
      <p className="eyebrow">TAP A WORD / LIVE DICTIONARY</p>
      <p className="demo-japanese">
        朝、窓を開けると
        <button
          aria-expanded={open}
          className="annotated-word"
          onClick={() => setOpen(!open)}
          type="button"
        >
          木漏れ日
        </button>
        が机に落ちていた。
      </p>
      <p className="demo-reading">Asa, mado o akeru to komorebi ga tsukue ni ochite ita.</p>
      <div className="grammar-note note-one">TOPIC / WHEN THE WINDOW OPENS</div>
      <div className="grammar-note note-two">に MARKS WHERE IT LANDS</div>
      {open && (
        <WordPopover
          meaning="sunlight filtering through trees"
          onClose={() => setOpen(false)}
          reading="こもれび · komorebi"
          word="木漏れ日"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '10px',
            }}
          >
            <Tag tone="ochre">noun · usually uncountable</Tag>
            <button
              aria-label="Play pronunciation"
              className="icon-button"
              onClick={handleAudio}
              style={{ width: '28px', height: '28px' }}
              type="button"
            >
              <Icon name="audio" size={14} />
            </button>
          </div>
        </WordPopover>
      )}
    </div>
  )
}

export function WordOfDayCard() {
  const { words, addItem } = useVocabularyStore()
  const isPresent = words.some((w) => w.word === '寄り道' && w.language === 'japanese')
  const [added, setAdded] = useState(false)
  const [playing, setPlaying] = useState(false)

  const handlePlayAudio = () => {
    setPlaying(true)
    playSpeech('よりみち')
    setTimeout(() => setPlaying(false), 1200)
  }

  const handleAdd = () => {
    addItem({
      word: '寄り道',
      reading: 'よりみち',
      romanization: 'yorimichi',
      meaning: 'A detour; stopping somewhere on the way',
      language: 'japanese',
      status: 'learning',
      level: 'N4',
      tags: [{ label: 'daily life' }, { label: 'travel' }],
      examples: [
        {
          sentence: '帰りに本屋へ寄り道した。',
          reading: 'Kaeri ni honya e yorimichi shita.',
          translation: 'On my way back, I made a detour to the bookstore.',
        },
      ],
      etymology: '寄る (to stop by) + 道 (road).',
      source: 'Word of the Day',
    })
    setAdded(true)
  }

  const isSaved = isPresent || added

  return (
    <section className="word-day">
      <div className="section-title-line">
        <div>
          <p className="eyebrow">WORD OF THE DAY</p>
          <h2>One to carry around</h2>
        </div>
        <button
          aria-label="Play pronunciation"
          className="icon-button"
          onClick={handlePlayAudio}
          type="button"
        >
          <Icon name="audio" />
        </button>
      </div>
      <p className="hero-word">寄り道</p>
      <p className="hero-reading">よりみち · yorimichi</p>
      <p className="hero-meaning">a detour; stopping somewhere on the way</p>
      <div className="etymology-note">
        <span>WORD ROOTS</span>
        <p>
          寄る, “to stop by,” plus 道, “road.” The language politely assumes the detour was
          intentional.
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          className={isSaved ? 'ink-button' : 'outline-button'}
          disabled={isSaved}
          onClick={handleAdd}
          type="button"
        >
          {isSaved ? (
            <>
              <Icon name="book" /> In notebook ✓
            </>
          ) : (
            <>
              <Icon name="plus" /> Add to notebook
            </>
          )}
        </button>
        {playing && (
          <span style={{ fontSize: '11px', color: 'var(--vermilion)', fontFamily: 'var(--mono)' }}>
            PLAYING · よりみち
          </span>
        )}
      </div>
    </section>
  )
}

const LANG_SPEECH_MAP: Record<string, string> = {
  japanese: 'ja-JP',
  korean: 'ko-KR',
  spanish: 'es-ES',
  english: 'en-US',
  indonesian: 'id-ID',
}

function normalizeAnswerText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\s.,/#!$%^&*;:{}=\-_`~()?"'，。、]/g, '')
}

interface ReviewCard {
  id: string
  prompt: string
  reading: string
  plainReading: string
  romanization: string
  meaning: string
  sentence: string
  sentenceTranslation: string
  language: string
  status: 'new' | 'learning' | 'known'
}

export function ReviewSession() {
  const { words, recordReview } = useVocabularyStore()
  const { activity, recordSession } = useStudyActivityStore()
  const { profile } = useLearnerProfileStore()

  const [deckMode, setDeckMode] = useState<'due' | 'all'>('due')
  const [selectedLang, setSelectedLang] = useState<string>(profile.targetLanguage || 'japanese')
  const [mode, setMode] = useState<'recognition' | 'recall' | 'listening'>('recognition')

  const [queue, setQueue] = useState<ReviewCard[]>([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [answer, setAnswer] = useState('')
  const [recallFeedback, setRecallFeedback] = useState<{ correct: boolean; text: string } | null>(
    null,
  )
  const [dragX, setDragX] = useState(0)
  const [missedWords, setMissedWords] = useState<string[]>([])
  const [sessionStartTime, setSessionStartTime] = useState<number>(() => Date.now())
  const [sessionDurationSec, setSessionDurationSec] = useState<number>(0)
  const touchStart = useRef<number | null>(null)

  // Filter pool
  const languageWords = useMemo(
    () => words.filter((w) => selectedLang === 'all' || w.language === selectedLang),
    [words, selectedLang],
  )
  const dueWords = useMemo(() => languageWords.filter((w) => w.status !== 'known'), [languageWords])
  const activePool = deckMode === 'due' ? dueWords : languageWords

  // Build deck from words
  const buildDeck = (sourceList: typeof words) => {
    return sourceList.map((w) => ({
      id: w.id,
      prompt: w.word,
      reading: `${w.reading}${w.romanization ? ` · ${w.romanization}` : ''}`,
      plainReading: w.reading,
      romanization: w.romanization || '',
      meaning: w.meaning,
      sentence: w.examples?.[0]?.sentence || '',
      sentenceTranslation: w.examples?.[0]?.translation || '',
      language: w.language,
      status: w.status,
    }))
  }

  // Initialize deck
  useEffect(() => {
    if (activePool.length > 0) {
      setQueue(buildDeck(activePool))
      setIndex(0)
      setFlipped(false)
      setFinished(false)
      setAnswer('')
      setRecallFeedback(null)
      setMissedWords([])
      setSessionStartTime(Date.now())
    } else {
      setQueue([])
    }
  }, [deckMode, selectedLang, activePool.length])

  const card: ReviewCard | undefined = queue[index]

  const playCardAudio = () => {
    if (card) {
      playSpeech(card.prompt, LANG_SPEECH_MAP[card.language] || 'ja-JP')
    }
  }

  const checkAnswer = () => {
    if (!card) return
    const cleaned = normalizeAnswerText(answer)
    const promptNorm = normalizeAnswerText(card.prompt)
    const readingNorm = normalizeAnswerText(card.plainReading)
    const romajiNorm = normalizeAnswerText(card.romanization)
    const meaningNorm = normalizeAnswerText(card.meaning)

    const isMatch =
      cleaned.length > 0 &&
      (cleaned === promptNorm ||
        cleaned === readingNorm ||
        cleaned === romajiNorm ||
        meaningNorm.includes(cleaned))

    if (isMatch) {
      setRecallFeedback({ correct: true, text: 'Spot on!' })
    } else {
      setRecallFeedback({
        correct: false,
        text: `Expected: ${card.plainReading} (${card.romanization || card.prompt})`,
      })
    }
    setFlipped(true)
  }

  const rate = (rating: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    if (!card) return

    // Record SRS update to vocabulary store
    recordReview(card.id, rating)

    const updatedQueue = [...queue]
    const updatedMissed = [...missedWords]

    if (rating === 'Again') {
      if (!updatedMissed.includes(card.prompt)) {
        updatedMissed.push(card.prompt)
        setMissedWords(updatedMissed)
      }
      // Re-queue card to end of this session for immediate reinforcement
      updatedQueue.push(card)
      setQueue(updatedQueue)
    }

    if (index + 1 >= updatedQueue.length) {
      // Completed session
      const elapsed = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000))
      setSessionDurationSec(elapsed)
      const minutes = Math.max(1, Math.round(elapsed / 60))
      const totalReviewed = updatedQueue.length
      const accuracy = Math.min(
        100,
        Math.round(((totalReviewed - updatedMissed.length) / Math.max(1, totalReviewed)) * 100),
      )

      recordSession({
        minutes,
        cardsReviewed: totalReviewed,
        accuracy,
        missedWords: updatedMissed,
      })
      setFinished(true)
    } else {
      setIndex(index + 1)
      setFlipped(false)
      setAnswer('')
      setRecallFeedback(null)
      setDragX(0)
    }
  }

  // Keyboard shortcut listeners
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // If typing in input, don't capture space or numbers
      const target = event.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') {
        if (event.key === 'Enter') {
          event.preventDefault()
          if (!flipped) {
            checkAnswer()
          }
        }
        return
      }

      if (event.code === 'Space' && mode === 'recognition') {
        event.preventDefault()
        setFlipped((value) => !value)
      } else if (event.key.toLowerCase() === 'a') {
        playCardAudio()
      } else if (event.key === 'Escape') {
        setFlipped(false)
      } else if (flipped && ['1', '2', '3', '4'].includes(event.key)) {
        const ratings: ('Again' | 'Hard' | 'Good' | 'Easy')[] = ['Again', 'Hard', 'Good', 'Easy']
        const pick = ratings[Number(event.key) - 1]
        rate(pick)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // When no cards in active deck
  if (activePool.length === 0 || queue.length === 0) {
    return (
      <div className="review-workspace">
        <PageHeader
          eyebrow="SPACED REPETITION / ALL CAUGHT UP"
          note={
            <>
              <span>0 DUE</span>
              <p>
                All cards
                <br />
                filed quietly.
              </p>
            </>
          }
          title="Review"
        />
        <section className="session-summary" style={{ marginTop: '28px' }}>
          <Stamp tone="green">ALL FILED</Stamp>
          <p className="eyebrow">DECK STATUS · {selectedLang.toUpperCase()}</p>
          <h2>No cards are due for review right now.</h2>
          <p
            style={{
              maxWidth: '440px',
              margin: '0 auto 28px',
              color: 'var(--ink-soft)',
              lineHeight: 1.6,
            }}
          >
            Every word in your {selectedLang} notebook has been reviewed. You can practice ahead
            with all {languageWords.length} words, read a new text, or add fresh entries from the
            notebook.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="primary-button"
              onClick={() => {
                setDeckMode('all')
                setQueue(buildDeck(languageWords))
                setIndex(0)
                setFlipped(false)
                setFinished(false)
                setSessionStartTime(Date.now())
              }}
              type="button"
            >
              Review all {languageWords.length} words anyway
            </button>
            <Link className="outline-button" href="/notebook">
              <Icon name="book" /> Open Notebook
            </Link>
            <Link className="outline-button" href="/today">
              Today's page
            </Link>
          </div>
        </section>
      </div>
    )
  }

  // When session is completed
  if (finished) {
    const elapsedMinutes = Math.floor(sessionDurationSec / 60)
    const elapsedSecs = sessionDurationSec % 60
    const timeFormatted = `${elapsedMinutes}:${String(elapsedSecs).padStart(2, '0')}`
    const accuracy = Math.min(
      100,
      Math.round(((queue.length - missedWords.length) / Math.max(1, queue.length)) * 100),
    )
    const currentTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    return (
      <div className="review-workspace">
        <PageHeader
          eyebrow={`SPACED REPETITION / SESSION ${activity.sessions.length}`}
          note={
            <>
              <span>FILED</span>
              <p>
                {queue.length} cards
                <br />
                in the journal.
              </p>
            </>
          }
          title="Review filed"
        />
        <section className="session-summary" style={{ marginTop: '28px' }}>
          <Stamp tone="green">SESSION FILED</Stamp>
          <p className="eyebrow">TEACHER’S NOTE · {currentTime}</p>
          <h2>
            {missedWords.length > 0
              ? `Good work. ${missedWords.slice(0, 3).join(', ')} still need another meeting.`
              : 'Every card remembered with quiet confidence.'}
          </h2>
          <div className="summary-stats">
            <p>
              <strong>{accuracy}%</strong>
              <span>accuracy</span>
            </p>
            <p>
              <strong>{timeFormatted}</strong>
              <span>time</span>
            </p>
            <p>
              <strong>{missedWords.length}</strong>
              <span>words to revisit</span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              onClick={() => {
                setQueue(buildDeck(activePool))
                setIndex(0)
                setFlipped(false)
                setFinished(false)
                setAnswer('')
                setRecallFeedback(null)
                setMissedWords([])
                setSessionStartTime(Date.now())
              }}
              type="button"
              variant="ink"
            >
              Review this stack again
            </Button>
            <Link className="outline-button" href="/notebook">
              <Icon name="book" /> Return to Notebook
            </Link>
            <Link className="outline-button" href="/today">
              Today's page
            </Link>
          </div>
        </section>
      </div>
    )
  }

  const estimatedMinutes = Math.max(1, Math.ceil(dueWords.length * 0.7))

  return (
    <div className="review-workspace">
      <PageHeader
        eyebrow={`SPACED REPETITION / SESSION ${activity.sessions.length + 1}`}
        note={
          <>
            <span>{dueWords.length} DUE</span>
            <p>
              About {estimatedMinutes}
              <br />
              quiet minutes.
            </p>
          </>
        }
        title="Review"
      />

      <div className="review-progress">
        <span style={{ width: `${((index + 1) / queue.length) * 100}%` }} />
      </div>

      <div className="deck-filter-bar">
        <div className="deck-filter-options">
          <Tabs
            items={['due', 'all'] as const}
            label="Deck"
            onChange={(item) => setDeckMode(item)}
            value={deckMode}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            aria-label="Filter language"
            className="filter-select"
            onChange={(e) => setSelectedLang(e.target.value)}
            style={{
              padding: '4px 8px',
              font: '400 10px/1 var(--mono)',
              border: '1px solid var(--rule)',
              borderRadius: '2px',
              background: 'transparent',
              color: 'var(--ink)',
            }}
            value={selectedLang}
          >
            <option value="japanese">Japanese</option>
            <option value="korean">Korean</option>
            <option value="spanish">Spanish</option>
            <option value="english">English</option>
            <option value="indonesian">Indonesian</option>
            <option value="all">All languages</option>
          </select>
          <Tabs
            items={['recognition', 'recall', 'listening'] as const}
            label="Card type"
            onChange={(item) => {
              setMode(item)
              setFlipped(false)
              setAnswer('')
              setRecallFeedback(null)
            }}
            value={mode}
          />
        </div>
      </div>

      <div className="review-meta">
        <span>
          {String(index + 1).padStart(2, '0')} / {String(queue.length).padStart(2, '0')} ·{' '}
          {card.language.toUpperCase()}
        </span>
        <span>
          {deckMode === 'due' ? 'DUE QUEUE' : 'FULL COLLECTION'} · {card.status.toUpperCase()}
        </span>
      </div>

      <div className="swipe-stage">
        <span className="swipe-cue swipe-again">← AGAIN</span>
        <span className="swipe-cue swipe-good">GOOD →</span>
        <IndexCard
          aria-label={flipped ? 'Show prompt' : 'Show answer'}
          className={`review-card ${flipped ? 'flipped' : ''} ${dragX < -20 ? 'dragging-again' : ''} ${dragX > 20 ? 'dragging-good' : ''}`}
          onClick={() => mode === 'recognition' && setFlipped(!flipped)}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === ' ') && mode === 'recognition') {
              event.preventDefault()
              setFlipped(!flipped)
            }
          }}
          onTouchEnd={() => {
            if (flipped && dragX <= -80) rate('Again')
            else if (flipped && dragX >= 80) rate('Good')
            else setDragX(0)
            touchStart.current = null
          }}
          onTouchMove={(event) => {
            if (flipped && touchStart.current !== null) {
              setDragX((event.touches[0]?.clientX ?? touchStart.current) - touchStart.current)
            }
          }}
          onTouchStart={(event) => {
            touchStart.current = event.touches[0]?.clientX ?? null
          }}
          role="button"
          style={{ '--swipe-x': `${dragX}px` } as CSSProperties}
          tabIndex={0}
        >
          {!flipped ? (
            <div className="review-face">
              <p className="eyebrow">
                {mode.toUpperCase()} · {card.language.toUpperCase()}
              </p>
              {mode === 'listening' ? (
                <>
                  <button
                    aria-label="Play audio prompt"
                    className="large-audio"
                    onClick={(e) => {
                      e.stopPropagation()
                      playCardAudio()
                    }}
                    type="button"
                  >
                    <Icon name="audio" size={34} />
                  </button>
                  <p className="card-instruction">Listen carefully, then write what you hear.</p>
                </>
              ) : (
                <>
                  <p className="review-word">{mode === 'recall' ? card.meaning : card.prompt}</p>
                  <p className="card-instruction">
                    {mode === 'recall'
                      ? `Write the ${card.language}. Press Enter to check.`
                      : 'Space or tap to turn the card.'}
                  </p>
                </>
              )}
              {mode !== 'recognition' && (
                <span className="answer-wrap" onClick={(e) => e.stopPropagation()}>
                  <Input
                    aria-label="Your answer"
                    onChange={(event) => setAnswer(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.stopPropagation()
                        checkAnswer()
                      }
                    }}
                    placeholder={`Write your answer in ${card.language}…`}
                    value={answer}
                  />
                  <button
                    className="ink-button"
                    onClick={(event) => {
                      event.stopPropagation()
                      checkAnswer()
                    }}
                    type="button"
                  >
                    Check
                  </button>
                </span>
              )}
            </div>
          ) : (
            <div className="review-face answer-face">
              <p className="eyebrow">ANSWER / TURNED OVER</p>
              <p className="review-word small">{card.prompt}</p>
              <p className="review-reading">{card.reading}</p>
              <p className="review-meaning">{card.meaning}</p>
              {card.sentence && (
                <div style={{ marginTop: '12px' }}>
                  <p className="review-example">{card.sentence}</p>
                  {card.sentenceTranslation && (
                    <p
                      style={{
                        font: '400 12px/1.4 var(--sans)',
                        color: 'var(--ink-soft)',
                        marginTop: '4px',
                      }}
                    >
                      {card.sentenceTranslation}
                    </p>
                  )}
                </div>
              )}
              {recallFeedback && (
                <div
                  className={`recall-feedback ${recallFeedback.correct ? 'correct' : 'incorrect'}`}
                >
                  {recallFeedback.correct ? '✓ ' : '✕ '}
                  {recallFeedback.text}
                </div>
              )}
              <button
                className="audio-label"
                onClick={(e) => {
                  e.stopPropagation()
                  playCardAudio()
                }}
                style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
                type="button"
              >
                <Icon name="audio" /> Hear pronunciation
              </button>
            </div>
          )}
        </IndexCard>
      </div>

      {flipped && (
        <div className="rating-row">
          {[
            ['Again', '10 min'],
            ['Hard', '1 day'],
            ['Good', '3 days'],
            ['Easy', '7 days'],
          ].map(([label, interval], i) => (
            <button
              key={label}
              onClick={() => rate(label as 'Again' | 'Hard' | 'Good' | 'Easy')}
              type="button"
            >
              <kbd>{i + 1}</kbd>
              <strong>{label}</strong>
              <span>{interval}</span>
            </button>
          ))}
        </div>
      )}

      <p className="shortcut-legend">SPACE FLIP · 1–4 RATE · A PLAY AUDIO · ESC LEAVE</p>
    </div>
  )
}

export function AddWordModal({
  onClose,
  onAdd,
  defaultLanguage = 'japanese',
}: {
  onClose: () => void
  onAdd: (data: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>) => void
  defaultLanguage?: string
}) {
  const [word, setWord] = useState('')
  const [reading, setReading] = useState('')
  const [romanization, setRomanization] = useState('')
  const [meaning, setMeaning] = useState('')
  const [language, setLanguage] = useState<
    'japanese' | 'korean' | 'spanish' | 'english' | 'indonesian'
  >(defaultLanguage === 'all' ? 'japanese' : (defaultLanguage as any))
  const [status, setStatus] = useState<'new' | 'learning' | 'known'>('new')
  const [level, setLevel] = useState('N4')
  const [tagsStr, setTagsStr] = useState('')
  const [exampleSentence, setExampleSentence] = useState('')
  const [exampleTranslation, setExampleTranslation] = useState('')
  const [source, setSource] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !reading.trim() || !meaning.trim()) return

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((label) => ({ label }))

    const examples = exampleSentence.trim()
      ? [
          {
            id: `ex-${Date.now()}`,
            sentence: exampleSentence.trim(),
            translation: exampleTranslation.trim() || 'Translation',
          },
        ]
      : []

    onAdd({
      word: word.trim(),
      reading: reading.trim(),
      romanization: romanization.trim() || null,
      meaning: meaning.trim(),
      language,
      status,
      level: level.trim() || null,
      tags: tags.length > 0 ? tags : null,
      examples: examples.length > 0 ? examples : null,
      source: source.trim() || 'Personal notebook entry',
    })
    onClose()
  }

  return (
    <div className="modal-scrim" onClick={onClose} role="presentation">
      <div
        aria-labelledby="add-word-title"
        aria-modal="true"
        className="add-word-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow">NEW ENTRY / NOTEBOOK</p>
            <h2 id="add-word-title">File a new word</h2>
          </div>
          <button
            aria-label="Close dialog"
            className="drawer-close"
            onClick={onClose}
            style={{ fontSize: '12px' }}
            type="button"
          >
            Close ×
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="modal-row">
            <label>
              <span>Word or Expression *</span>
              <input
                autoFocus
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g. 木陰, 설레다, Sobremesa"
                required
                value={word}
              />
            </label>
            <label>
              <span>Reading / Pronunciation *</span>
              <input
                onChange={(e) => setReading(e.target.value)}
                placeholder="e.g. こかげ, so-bre-me-sa"
                required
                value={reading}
              />
            </label>
          </div>

          <div className="modal-row">
            <label>
              <span>Romanization</span>
              <input
                onChange={(e) => setRomanization(e.target.value)}
                placeholder="e.g. kokage, sobremesa"
                value={romanization}
              />
            </label>
            <label>
              <span>Language</span>
              <select onChange={(e) => setLanguage(e.target.value as any)} value={language}>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
                <option value="spanish">Spanish</option>
                <option value="english">English</option>
                <option value="indonesian">Indonesian</option>
              </select>
            </label>
          </div>

          <label>
            <span>Meaning / Definition *</span>
            <textarea
              onChange={(e) => setMeaning(e.target.value)}
              placeholder="What does it mean in context?"
              required
              rows={2}
              value={meaning}
            />
          </label>

          <div className="modal-row">
            <label>
              <span>Initial Status</span>
              <select onChange={(e) => setStatus(e.target.value as any)} value={status}>
                <option value="new">New</option>
                <option value="learning">Learning</option>
                <option value="known">Known</option>
              </select>
            </label>
            <label>
              <span>Level / Chapter</span>
              <input
                onChange={(e) => setLevel(e.target.value)}
                placeholder="e.g. N4, Beginner, Ch. 2"
                value={level}
              />
            </label>
          </div>

          <label>
            <span>Tags (comma-separated)</span>
            <input
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="e.g. nature, conversation, daily life"
              value={tagsStr}
            />
          </label>

          <div className="modal-row">
            <label>
              <span>Example Sentence</span>
              <input
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder="Sentence in target language"
                value={exampleSentence}
              />
            </label>
            <label>
              <span>Sentence Translation</span>
              <input
                onChange={(e) => setExampleTranslation(e.target.value)}
                placeholder="English or Indonesian translation"
                value={exampleTranslation}
              />
            </label>
          </div>

          <label>
            <span>Source</span>
            <input
              onChange={(e) => setSource(e.target.value)}
              placeholder="Where did you meet this word?"
              value={source}
            />
          </label>

          <div className="modal-actions">
            <button className="outline-button" onClick={onClose} type="button">
              Cancel
            </button>
            <button className="primary-button" type="submit">
              File into notebook <Icon name="plus" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function NotebookTable({ words: initialWords }: { words: Vocabulary[] }) {
  const { words: wordsList, addItem, updateItem, deleteItem } = useVocabularyStore(initialWords)
  const [query, setQuery] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedTag, setSelectedTag] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selected, setSelected] = useState<Vocabulary | null>(null)
  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)
  const [isAddingWord, setIsAddingWord] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const tagsList = useMemo(() => {
    const set = new Set<string>()
    for (const w of wordsList) {
      if (w.tags) {
        for (const t of w.tags) set.add(t.label)
      }
    }
    return Array.from(set).sort()
  }, [wordsList])

  const filtered = useMemo(
    () =>
      wordsList.filter((word) => {
        if (selectedLanguage !== 'all' && word.language !== selectedLanguage) return false
        if (status !== 'all' && word.status !== status) return false
        if (selectedTag !== 'all' && !word.tags?.some((t) => t.label === selectedTag)) return false
        if (
          selectedSource !== 'all' &&
          !word.source?.toLowerCase().includes(selectedSource.toLowerCase())
        )
          return false
        if (!query.trim()) return true
        return [word.word, word.reading, word.meaning, word.romanization || '']
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())
      }),
    [query, selectedLanguage, selectedSource, selectedTag, status, wordsList],
  )

  const handleAddWord = (data: Omit<Vocabulary, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = addItem(data)
    setNotice(`Filed “${created.word}” into notebook ✓`)
    setTimeout(() => setNotice(null), 3500)
  }

  const exportCSV = () => {
    const rows = [
      ['word', 'reading', 'meaning', 'language', 'status', 'level', 'source'],
      ...filtered.map((item) => [
        item.word,
        item.reading,
        item.meaning,
        item.language,
        item.status,
        item.level || '',
        item.source || '',
      ]),
    ]
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = `marginalia-notebook-${selectedLanguage === 'all' ? 'all' : selectedLanguage}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    setNotice('Exported CSV archive to your downloads.')
    setTimeout(() => setNotice(null), 3500)
  }

  const handleImportCSV = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (!text) return
      const lines = text.split('\n').filter((l) => l.trim().length > 0)
      if (lines.length <= 1) return
      let addedCount = 0
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim())
        if (parts[0] && parts[1]) {
          addItem({
            word: parts[0],
            reading: parts[1],
            meaning: parts[2] || 'Imported meaning',
            language: (parts[3] as any) || 'japanese',
            status: (parts[4] as any) || 'new',
            level: parts[5] || 'N4',
            source: parts[6] || 'CSV Import',
            tags: [{ label: 'imported' }],
          })
          addedCount++
        }
      }
      if (addedCount > 0) {
        setNotice(`Imported and saved ${addedCount} entries to your notebook ✓`)
        setTimeout(() => setNotice(null), 4000)
      }
    }
    reader.readAsText(file)
  }

  return (
    <>
      <div className="notebook-tools">
        <label className="search-field">
          <Icon name="search" />
          <input
            aria-label="Search notebook entries"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search word, reading, meaning…"
            value={query}
          />
        </label>
        <div className="filter-row">
          <select
            aria-label="Language filter"
            onChange={(e) => setSelectedLanguage(e.target.value)}
            value={selectedLanguage}
          >
            <option value="all">All languages</option>
            <option value="japanese">Japanese</option>
            <option value="korean">Korean</option>
            <option value="spanish">Spanish</option>
            <option value="english">English</option>
            <option value="indonesian">Indonesian</option>
          </select>
          <select
            aria-label="Tag filter"
            onChange={(e) => setSelectedTag(e.target.value)}
            value={selectedTag}
          >
            <option value="all">All tags</option>
            {tagsList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            aria-label="Status filter"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="all">Any status</option>
            <option value="new">New</option>
            <option value="learning">Learning</option>
            <option value="known">Known</option>
          </select>
          <select
            aria-label="Source filter"
            onChange={(e) => setSelectedSource(e.target.value)}
            value={selectedSource}
          >
            <option value="all">Any source</option>
            <option value="reading">Reading passages</option>
            <option value="conversation">Conversations</option>
            <option value="poetry">Poetry</option>
            <option value="journal">Journals</option>
          </select>
        </div>
        <div className="bulk-row">
          <span>{filtered.length} ENTRIES</span>
          {notice && <span style={{ color: 'var(--moss)', fontWeight: 500 }}>{notice}</span>}
          <button
            className="primary-button"
            onClick={() => setIsAddingWord(true)}
            style={{ minHeight: '34px', fontSize: '11px', padding: '0 12px' }}
            type="button"
          >
            <Icon name="plus" size={13} /> Add new word
          </button>
          <input
            accept=".csv"
            aria-label="Upload CSV file"
            onChange={handleImportCSV}
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
          />
          <button onClick={() => fileInputRef.current?.click()} type="button">
            <Icon name="upload" /> Import CSV
          </button>
          <button onClick={exportCSV} type="button">
            <Icon name="download" /> Export
          </button>
        </div>
      </div>
      <Table className="word-table" label="Vocabulary notebook">
        <div className="word-table-head" role="row">
          <span>Word / reading</span>
          <span>Meaning</span>
          <span>Tags</span>
          <span>Status</span>
        </div>
        {filtered.length ? (
          filtered.map((word) => (
            <button
              className="word-table-row"
              key={word.id}
              onClick={() => setSelected(word)}
              role="row"
            >
              <span>
                <strong>{word.word}</strong>
                <small>
                  {word.reading} {word.romanization ? `· ${word.romanization}` : ''}
                </small>
              </span>
              <span>{word.meaning}</span>
              <span className="tag-cell">
                {word.tags?.map((tag) => (
                  <Tag key={`${word.id}-${tag.label}`}>{tag.label}</Tag>
                ))}
              </span>
              <Stamp tone={word.status === 'known' ? 'green' : 'red'}>{word.status}</Stamp>
            </button>
          ))
        ) : (
          <div className="empty-notebook">
            Nothing here yet. Words you save will land on this page.
          </div>
        )}
      </Table>
      {selected && (
        <div className="drawer-scrim" onClick={() => setSelected(null)}>
          <aside
            aria-label={`${selected.word} details`}
            className="word-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="drawer-close" onClick={() => setSelected(null)} type="button">
              Close ×
            </button>
            <p className="eyebrow">
              NOTEBOOK ENTRY · {selected.language.toUpperCase()} · {selected.level || 'STUDY'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2>{selected.word}</h2>
              <button
                aria-label={`Pronounce ${selected.word}`}
                className="icon-button"
                onClick={() =>
                  playSpeech(
                    selected.word,
                    selected.language === 'japanese'
                      ? 'ja-JP'
                      : selected.language === 'korean'
                        ? 'ko-KR'
                        : 'es-ES',
                  )
                }
                type="button"
              >
                <Icon name="audio" size={18} />
              </button>
            </div>
            <p className="drawer-reading">
              {selected.reading} {selected.romanization ? `· ${selected.romanization}` : ''}
            </p>
            <p className="drawer-meaning">{selected.meaning}</p>

            <div className="status-picker">
              <span className="eyebrow" style={{ alignSelf: 'center', marginRight: '6px' }}>
                Status:
              </span>
              {(['new', 'learning', 'known'] as const).map((st) => (
                <button
                  className={`status-btn ${selected.status === st ? `active-${st}` : ''}`}
                  key={st}
                  onClick={() => {
                    const updated = updateItem(selected.id, { status: st })
                    if (updated) setSelected(updated)
                    setNotice(`Status updated to ${st.toUpperCase()} ✓`)
                    setTimeout(() => setNotice(null), 2500)
                  }}
                  type="button"
                >
                  {st}
                </button>
              ))}
            </div>

            <section>
              <p className="eyebrow">EXAMPLES</p>
              {selected.examples && selected.examples.length > 0 ? (
                selected.examples.map((example) => (
                  <div className="drawer-example" key={example.id}>
                    <p>{example.sentence}</p>
                    {example.reading && (
                      <small
                        style={{
                          color: 'var(--ink-soft)',
                          fontFamily: 'var(--mono)',
                          fontSize: '10px',
                        }}
                      >
                        {example.reading}
                      </small>
                    )}
                    <span>{example.translation}</span>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--ink-soft)', fontSize: '12px', marginTop: '10px' }}>
                  No recorded examples yet.
                </p>
              )}
            </section>
            {selected.conjugations && selected.conjugations.length > 0 && (
              <section>
                <p className="eyebrow">CONJUGATION</p>
                <dl className="conjugation-list">
                  {selected.conjugations.map((item) => (
                    <div key={item.id}>
                      <dt>{item.form}</dt>
                      <dd>{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}
            <section>
              <label className="eyebrow" htmlFor="personal-note">
                PERSONAL NOTE
              </label>
              <textarea
                id="personal-note"
                onChange={(e) => {
                  const val = e.target.value
                  setPersonalNotes((prev) => ({ ...prev, [selected.id]: val }))
                  updateItem(selected.id, { etymology: val })
                }}
                placeholder="The thing that will make this stick…"
                value={personalNotes[selected.id] ?? (selected.etymology || '')}
              />
            </section>
            <div
              style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--rule)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <p className="source-line">FOUND IN / {selected.source || 'Study notebook'}</p>
              <button
                className="delete-word-btn"
                onClick={() => {
                  if (
                    typeof window !== 'undefined' &&
                    window.confirm(`Remove “${selected.word}” from your notebook?`)
                  ) {
                    deleteItem(selected.id)
                    setSelected(null)
                    setNotice(`Removed “${selected.word}” from notebook ✓`)
                    setTimeout(() => setNotice(null), 3000)
                  }
                }}
                type="button"
              >
                <Icon name="close" size={12} /> Remove word
              </button>
            </div>
          </aside>
        </div>
      )}
      {isAddingWord && (
        <AddWordModal
          defaultLanguage={selectedLanguage}
          onAdd={handleAddWord}
          onClose={() => setIsAddingWord(false)}
        />
      )}
    </>
  )
}

type ReadingSegment = {
  text: string
  furigana?: string
  word?: string
  reading?: string
  type?: 'learning' | 'new'
}

type GradedPassage = {
  level: string
  titleJp: string
  titleEn: string
  paragraphs: {
    jp: ReadingSegment[]
    translation: string
  }[]
  stats: { known: string; newFound: number; note: string }
}

const readingPassages: Record<'daily' | 'culture' | 'easy', GradedPassage> = {
  daily: {
    level: 'N4 · 5 MIN',
    titleJp: '雨の日の喫茶店',
    titleEn: 'THE CAFÉ ON A RAINY DAY',
    paragraphs: [
      {
        jp: [
          { text: '土曜日', furigana: 'どようび' },
          { text: 'の' },
          { text: '午後', furigana: 'ごご' },
          { text: '、雨が' },
          { text: '降って', word: '降る', reading: 'ふる · to fall (rain/snow)', type: 'learning' },
          { text: 'いた。私は駅の近くにある小さな喫茶店に入った。' },
        ],
        translation:
          'On Saturday afternoon, it was raining. I entered a small café near the station.',
      },
      {
        jp: [
          { text: '店の中は静かで、コーヒーのいい' },
          { text: '香り', word: '香り', reading: 'かおり · fragrance; aroma', type: 'new' },
          { text: 'がした。窓のそばに座って、本を読み始めた。' },
        ],
        translation:
          'Inside was quiet and smelled of coffee. I sat by the window and began to read.',
      },
      {
        jp: [
          { text: 'しばらくすると、隣のテーブルの人が「その本、私も好きです」と話しかけてきた。' },
        ],
        translation: 'After a while, the person at the next table said, “I like that book too.”',
      },
    ],
    stats: { known: '92%', newFound: 4, note: 'Better than yesterday. The rain helped.' },
  },
  culture: {
    level: 'N4 · 7 MIN',
    titleJp: '街の古本屋',
    titleEn: 'THE SECONDHAND BOOKSHOP IN TOWN',
    paragraphs: [
      {
        jp: [
          { text: '角を曲がると、古い木造の' },
          {
            text: '古本屋',
            word: '古本屋',
            reading: 'ふるほんや · secondhand bookstore',
            type: 'learning',
          },
          { text: 'が見えてくる。看板の文字はかすれている。' },
        ],
        translation:
          'Turning the corner, an old wooden secondhand bookshop comes into view. The sign letters are faded.',
      },
      {
        jp: [
          { text: '店主は眼鏡を直しながら、静かに' },
          { text: '頷いた', word: '頷く', reading: 'うなずく · to nod in agreement', type: 'new' },
          { text: '。棚には昭和時代の文庫本が並んでいた。' },
        ],
        translation:
          'The owner adjusted his glasses and nodded quietly. Showa-era paperbacks lined the shelves.',
      },
    ],
    stats: { known: '88%', newFound: 5, note: 'Paper scent noticed. 3 verbs underlined.' },
  },
  easy: {
    level: 'N5 · 3 MIN',
    titleJp: '朝の散歩',
    titleEn: 'MORNING WALK',
    paragraphs: [
      {
        jp: [
          { text: '朝' },
          { text: '七時', furigana: 'しちじ' },
          { text: 'に起きました。空がとても青いです。公園を' },
          { text: '歩きます', word: '歩く', reading: 'あるく · to walk', type: 'learning' },
          { text: '。' },
        ],
        translation: 'I woke up at seven in the morning. The sky is very blue. I walk in the park.',
      },
    ],
    stats: { known: '96%', newFound: 2, note: 'Smooth pace. Clean grammar markers.' },
  },
}

export function ReadingPassage() {
  const { words, addItem } = useVocabularyStore()
  const { passage: customPassage, savePassage, clearPassage } = useCustomPassageStore()

  const [passageKey, setPassageKey] = useState<'daily' | 'culture' | 'easy' | 'custom'>('daily')
  const [furigana, setFurigana] = useState(true)
  const [translation, setTranslation] = useState(false)
  const [selectedWord, setSelectedWord] = useState<{ word: string; reading: string } | null>(null)
  const [savedStatus, setSavedStatus] = useState<string | null>(null)

  // Custom passage editing state
  const [isEditingCustom, setIsEditingCustom] = useState(false)
  const [customTitle, setCustomTitle] = useState('')
  const [customLanguage, setCustomLanguage] = useState('japanese')
  const [customContent, setCustomContent] = useState('')

  const isCustom = passageKey === 'custom'
  const passage = !isCustom ? readingPassages[passageKey] : null

  const handleSaveToNotebook = () => {
    if (!selectedWord) return
    const parts = selectedWord.reading.split('·')
    const readingClean = (parts[0] || selectedWord.word).trim()
    const meaningClean = (parts[1] || selectedWord.reading).trim()

    const sourceName = isCustom
      ? customPassage?.title || 'Custom text'
      : passage?.titleJp || 'Graded Reader'
    const lang = isCustom ? customPassage?.language || 'japanese' : 'japanese'

    addItem({
      word: selectedWord.word,
      reading: readingClean,
      meaning: meaningClean,
      language: lang as any,
      status: 'learning',
      level: isCustom ? customPassage?.level || 'Custom' : passage?.level.split('·')[0].trim(),
      source: sourceName,
      tags: [{ label: 'reading' }, { label: isCustom ? 'custom-text' : 'graded-reader' }],
      examples: [
        {
          sentence: `文章「${sourceName}」の中で出会った言葉。`,
          translation: `Encountered while reading "${sourceName}"`,
        },
      ],
    })

    setSavedStatus(`Added “${selectedWord.word}” to notebook ✓`)
    setTimeout(() => {
      setSavedStatus(null)
      setSelectedWord(null)
    }, 1500)
  }

  const handleSaveCustomPassage = (e: FormEvent) => {
    e.preventDefault()
    if (!customContent.trim()) return
    const newPassage = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim() || 'My Personal Passage',
      language: customLanguage,
      level: 'Custom',
      content: customContent.trim(),
      createdAt: new Date().toISOString(),
    }
    savePassage(newPassage)
    setIsEditingCustom(false)
  }

  // Tokenize custom text into interactive words
  const customParagraphs = useMemo(() => {
    if (!customPassage) return []
    return customPassage.content.split('\n').filter((p) => p.trim().length > 0)
  }, [customPassage])

  return (
    <div className="reading-layout">
      <aside className="reading-controls">
        <p className="eyebrow">VIEW</p>
        <label>
          <input checked={furigana} onChange={() => setFurigana(!furigana)} type="checkbox" />{' '}
          Furigana
        </label>
        <label>
          <input
            checked={translation}
            onChange={() => setTranslation(!translation)}
            type="checkbox"
          />{' '}
          Translation
        </label>
        <hr />
        <p className="eyebrow">LEVEL / TOPIC</p>
        <select
          aria-label="Reading passage selection"
          onChange={(e) => {
            const val = e.target.value as any
            setPassageKey(val)
            setSelectedWord(null)
            if (val === 'custom' && !customPassage) {
              setIsEditingCustom(true)
            }
          }}
          value={passageKey}
        >
          <option value="daily">N4 · Daily life (Café)</option>
          <option value="culture">N4 · Culture (Bookshop)</option>
          <option value="easy">N5 · Easy (Morning walk)</option>
          <option value="custom">✦ Custom passage (Paste your own)</option>
        </select>

        {isCustom && customPassage && (
          <div style={{ marginTop: '16px' }}>
            <button
              className="outline-button"
              onClick={() => {
                setCustomTitle(customPassage.title)
                setCustomLanguage(customPassage.language)
                setCustomContent(customPassage.content)
                setIsEditingCustom(true)
              }}
              style={{ width: '100%', fontSize: '10px', padding: '6px' }}
              type="button"
            >
              Edit passage text
            </button>
          </div>
        )}
      </aside>

      <article className="reading-paper">
        {isCustom && (!customPassage || isEditingCustom) ? (
          <form className="custom-passage-form" onSubmit={handleSaveCustomPassage}>
            <header>
              <p className="eyebrow">PASTE YOUR OWN PASSAGE</p>
              <h1 style={{ fontSize: '26px' }}>Read what you want to read.</h1>
              <p>Paste an article, song lyrics, dialogue, or news story in your target language.</p>
            </header>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
                PASSAGE TITLE
              </label>
              <input
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. NHK News Easy / Short Story / Article"
                value={customTitle}
              />
            </div>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
                LANGUAGE
              </label>
              <select onChange={(e) => setCustomLanguage(e.target.value)} value={customLanguage}>
                <option value="japanese">Japanese</option>
                <option value="korean">Korean</option>
                <option value="spanish">Spanish</option>
                <option value="english">English</option>
                <option value="indonesian">Indonesian</option>
              </select>
            </div>
            <div>
              <label className="eyebrow" style={{ display: 'block', marginBottom: '6px' }}>
                PASSAGE TEXT
              </label>
              <textarea
                onChange={(e) => setCustomContent(e.target.value)}
                placeholder="Paste or write foreign text here. Each word will become clickable so you can look up and save unfamiliar vocabulary..."
                required
                value={customContent}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-button" type="submit">
                Parse into reading sheet
              </button>
              {customPassage && (
                <button
                  className="outline-button"
                  onClick={() => setIsEditingCustom(false)}
                  type="button"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : isCustom && customPassage ? (
          <>
            <header>
              <p className="eyebrow">CUSTOM PASSAGE · {customPassage.language.toUpperCase()}</p>
              <h1>{customPassage.title}</h1>
              <p>Tap any word to inspect reading and save to your notebook.</p>
            </header>
            <div className="reading-copy">
              {customParagraphs.map((para, pIdx) => {
                // Tokenize words
                const wordsList = para.split(/([ \t\n,.;:!?()"'，。、！？「」]+)/)
                return (
                  <p key={pIdx} style={{ marginBottom: '22px' }}>
                    {wordsList.map((token, tIdx) => {
                      if (!token.trim() || /^[,.;:!?()"'，。、！？「」]+$/.test(token)) {
                        return <span key={tIdx}>{token}</span>
                      }
                      const inNotebook = words.find(
                        (w) => w.word === token && w.language === customPassage.language,
                      )
                      let statusClass = 'is-new'
                      if (inNotebook) {
                        statusClass = inNotebook.status === 'known' ? 'is-known' : 'is-learning'
                      }
                      return (
                        <button
                          className={`custom-word-token ${statusClass}`}
                          key={tIdx}
                          onClick={() =>
                            setSelectedWord({
                              word: token,
                              reading: inNotebook
                                ? `${inNotebook.reading}${inNotebook.meaning ? ` · ${inNotebook.meaning}` : ''}`
                                : `${token} · look up & save`,
                            })
                          }
                          type="button"
                        >
                          {token}
                        </button>
                      )
                    })}
                  </p>
                )
              })}
            </div>
            <footer className="reading-stats">
              <p>
                <strong>{words.filter((w) => w.status === 'known').length}</strong>
                <span>words known in notebook</span>
              </p>
              <p>
                <strong>{customParagraphs.length}</strong>
                <span>paragraphs in passage</span>
              </p>
              <p>Interactive study layer active. Click any word to save.</p>
            </footer>
          </>
        ) : (
          passage && (
            <>
              <header>
                <p className="eyebrow">GRADED READER · {passage.level}</p>
                <h1>{passage.titleJp}</h1>
                <p>{passage.titleEn}</p>
              </header>
              <div className="reading-copy">
                {passage.paragraphs.map((para, pIdx) => (
                  <div key={pIdx} style={{ marginBottom: '22px' }}>
                    <p>
                      {para.jp.map((segment, sIdx) => {
                        if (segment.word) {
                          return (
                            <button
                              className={segment.type === 'learning' ? 'learning-word' : 'new-word'}
                              key={sIdx}
                              onClick={() =>
                                setSelectedWord({ word: segment.word!, reading: segment.reading! })
                              }
                              type="button"
                            >
                              {segment.text}
                            </button>
                          )
                        }
                        if (segment.furigana) {
                          return (
                            <ruby key={sIdx}>
                              {segment.text}
                              <rt>{furigana ? segment.furigana : ''}</rt>
                            </ruby>
                          )
                        }
                        return <span key={sIdx}>{segment.text}</span>
                      })}
                    </p>
                    {translation && <span>{para.translation}</span>}
                  </div>
                ))}
              </div>
              <footer className="reading-stats">
                <p>
                  <strong>{passage.stats.known}</strong>
                  <span>words known</span>
                </p>
                <p>
                  <strong>{passage.stats.newFound}</strong>
                  <span>new words found</span>
                </p>
                <p>{passage.stats.note}</p>
              </footer>
            </>
          )
        )}

        {selectedWord && (
          <div className="reading-popover">
            <button onClick={() => setSelectedWord(null)} type="button">
              ×
            </button>
            <strong>{selectedWord.word}</strong>
            <span>{selectedWord.reading}</span>
            <button className="ink-button" onClick={handleSaveToNotebook} type="button">
              <Icon name="plus" /> {savedStatus || 'Save to notebook'}
            </button>
          </div>
        )}
      </article>
    </div>
  )
}

const writingPrompts = [
  {
    id: 'prompt-14',
    num: '14',
    category: 'DAILY LIFE',
    title: 'Describe your breakfast using three new words.',
    hint: 'Try: 香り · 焼く · やっぱり',
    guidance: '80–120 characters. Imperfection permitted.',
    defaultText: '朝はトーストとコーヒーを食べました。それから、いそがしい駅に行きました。',
    corrections: [
      {
        id: '1',
        replacement: '飲みました',
        note: 'Coffee is drunk, not eaten. Japanese agrees with the cup.',
        className: 'edit-one',
        commentClass: 'comment-one',
      },
      {
        id: '2',
        replacement: 'にぎやかな',
        note: 'いそがしい describes a person or schedule. A station is lively.',
        className: 'edit-two',
        commentClass: 'comment-two',
      },
    ],
  },
  {
    id: 'prompt-15',
    num: '15',
    category: 'MEMORY',
    title: 'Write about a small place you remember from childhood.',
    hint: 'Try: 懐かしい · 秘密 · 景色',
    guidance: 'A quiet room, a corner in the garden, or a stone by the water.',
    defaultText:
      '子供のころ、祖父の庭にある古い木の下が秘密の場所でした。風が吹くと葉が揺れました。',
    corrections: [
      {
        id: '1',
        replacement: '秘密基地でした',
        note: '秘密基地 conveys that nostalgic childhood hideout feeling.',
        className: 'edit-one',
        commentClass: 'comment-one',
      },
      {
        id: '2',
        replacement: 'そよそよと揺れました',
        note: 'そよそよ describes leaves rustling gently in the afternoon air.',
        className: 'edit-two',
        commentClass: 'comment-two',
      },
    ],
  },
  {
    id: 'prompt-16',
    num: '16',
    category: 'OBSERVATION',
    title: 'Look out the window. Describe what the light and wind are doing.',
    hint: 'Try: 曇り · 吹く · 気配',
    guidance: 'Notice what is quiet before noticing what is loud.',
    defaultText: '空は薄い曇りで、木漏れ日のような光が道路に静かに揺れています。',
    corrections: [
      {
        id: '1',
        replacement: 'かすかな光が',
        note: 'かすかな (faint) matches the soft cloudy afternoon mood.',
        className: 'edit-one',
        commentClass: 'comment-one',
      },
      {
        id: '2',
        replacement: '静かに落ちています',
        note: 'Light falls (落ちる) upon the surface rather than merely shaking.',
        className: 'edit-two',
        commentClass: 'comment-two',
      },
    ],
  },
  {
    id: 'prompt-17',
    num: '17',
    category: 'CORRESPONDENCE',
    title: 'Send three sentences to a friend you have not seen in years.',
    hint: 'Try: 元気 · 久しぶり · 伝える',
    guidance: 'Write with calm affection, without unnecessary ceremony.',
    defaultText: '久しぶりですね。お元気ですか。また時間がある時に、一緒にお茶でもしましょう。',
    corrections: [
      {
        id: '1',
        replacement: 'ゆっくり話しましょう',
        note: 'Adding ゆっくり (leisurely) turns a casual tea into a warm invitation.',
        className: 'edit-one',
        commentClass: 'comment-one',
      },
    ],
  },
]

export function WritingPad() {
  const { entries, addEntry, deleteEntry } = useJournalStore()
  const { recordSession } = useStudyActivityStore()

  const [promptIndex, setPromptIndex] = useState(0)
  const currentPrompt = writingPrompts[promptIndex]

  const [text, setText] = useState(currentPrompt.defaultText)
  const [reviewed, setReviewed] = useState(false)
  const [savedNote, setSavedNote] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const handlePromptChange = (idx: number) => {
    setPromptIndex(idx)
    setText(writingPrompts[idx].defaultText)
    setReviewed(false)
    setSavedNote(false)
  }

  const handleSaveToJournal = () => {
    const feedbackList = currentPrompt.corrections.map((c) => c.note)
    addEntry({
      promptId: currentPrompt.id,
      promptTitle: currentPrompt.title,
      promptCategory: currentPrompt.category,
      originalText: text,
      revisedText: text,
      wordCount: text.length,
      feedbackNotes: feedbackList,
    })

    // Log 5 minutes into today's study activity
    recordSession({
      minutes: 5,
      cardsReviewed: 0,
      accuracy: 100,
      missedWords: [],
    })

    setSavedNote(true)
    setTimeout(() => setSavedNote(false), 2500)
  }

  return (
    <div>
      <div className="writing-grid">
        <aside className="prompt-slip">
          <p className="eyebrow">
            PROMPT {currentPrompt.num} · {currentPrompt.category}
          </p>
          <h2>{currentPrompt.title}</h2>
          <p>{currentPrompt.hint}</p>
          <span>{currentPrompt.guidance}</span>

          <div
            style={{ marginTop: '24px', borderTop: '1px solid var(--rule)', paddingTop: '16px' }}
          >
            <p className="eyebrow" style={{ marginBottom: '8px' }}>
              OTHER PROMPTS
            </p>
            {writingPrompts.map((p, idx) => (
              <button
                className={`prompt-select-btn ${idx === promptIndex ? 'active' : ''}`}
                key={p.id}
                onClick={() => handlePromptChange(idx)}
                type="button"
              >
                <strong>{p.num}.</strong> {p.title}
              </button>
            ))}
          </div>
        </aside>

        <div className="writing-sheet">
          <div className="writing-toolbar">
            <span>{text.length} CHARACTERS</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="outline-button"
                onClick={() => setShowHistory(!showHistory)}
                style={{ padding: '6px 10px', fontSize: '10px' }}
                type="button"
              >
                <Icon name="book" /> Past writings ({entries.length})
              </button>
              <button className="primary-button" onClick={() => setReviewed(true)} type="button">
                Review my writing <Icon name="arrow" />
              </button>
            </div>
          </div>
          <textarea
            aria-label="Japanese writing practice"
            onChange={(e) => {
              setText(e.target.value)
              if (reviewed) setReviewed(false)
            }}
            value={text}
          />
          {reviewed && (
            <div className="correction-layer">
              {currentPrompt.corrections.map((corr) => (
                <div key={corr.id}>
                  <span className={`red-edit ${corr.className}`}>{corr.replacement}</span>
                  <span className={`margin-comment ${corr.commentClass}`}>{corr.note}</span>
                </div>
              ))}
              <button className="outline-button" onClick={handleSaveToJournal} type="button">
                {savedNote ? 'Saved to journal ✓' : 'Save version to journal'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showHistory && (
        <section className="journal-section">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">WRITING JOURNAL</p>
              <h2>Past pages in ink</h2>
            </div>
            <span>{entries.length} SAVED ENTRIES</span>
          </div>

          <div className="journal-list">
            {entries.map((entry) => {
              const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
              return (
                <article className="journal-card" key={entry.id}>
                  <div className="journal-card-header">
                    <span>
                      {entry.promptCategory} · {formattedDate}
                    </span>
                    <button
                      aria-label="Delete entry"
                      onClick={() => deleteEntry(entry.id)}
                      style={{
                        background: 'transparent',
                        border: 0,
                        color: 'var(--ink-soft)',
                        cursor: 'pointer',
                      }}
                      type="button"
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                  <h3>{entry.promptTitle}</h3>
                  <p className="journal-card-excerpt">{entry.originalText}</p>
                  {entry.feedbackNotes && entry.feedbackNotes.length > 0 && (
                    <div className="journal-card-notes">
                      <strong>Teacher’s notes:</strong> {entry.feedbackNotes.join(' · ')}
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

const shadowSentences = [
  {
    num: '01',
    jp: '雨が降っていたので、喫茶店に入りました。',
    reading: 'Ame ga futte ita node, kissaten ni hairimashita.',
    en: 'Because it was raining, I stepped into the coffee shop.',
  },
  {
    num: '02',
    jp: '窓際の席に座って、あたたかいお茶を頼んだ。',
    reading: 'Madogiwa no seki ni suwatte, atatakai ocha o tanonda.',
    en: 'Sitting at the window seat, I ordered warm tea.',
  },
  {
    num: '03',
    jp: '静かな店内に、古い時計の音だけが響いている。',
    reading: 'Shizuka na tennai ni, furui tokei no oto dake ga hibiite iru.',
    en: 'In the quiet shop, only the sound of an old clock resonated.',
  },
  {
    num: '04',
    jp: '少し寄り道をして、好きな本を読み進める。',
    reading: 'Sukoshi yorimichi o shite, suki na hon o yomisusumeru.',
    en: 'Taking a small detour, I continued reading my favorite book.',
  },
]

export function AudioStudio() {
  const [sentenceIdx, setSentenceIdx] = useState(0)
  const currentSentence = shadowSentences[sentenceIdx]

  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<'1×' | '0.75×'>('1×')
  const [loop, setLoop] = useState(false)

  // Real microphone recording state
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null)
  const [userAudioPlaying, setUserAudioPlaying] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<BlobPart[]>([])
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null)

  const togglePlay = () => {
    if (!playing) {
      setPlaying(true)
      const rate = speed === '0.75×' ? 0.75 : 1
      playSpeech(currentSentence.jp, 'ja-JP', rate)
      setTimeout(
        () => {
          setPlaying(false)
          if (loop) {
            setTimeout(togglePlay, 500)
          }
        },
        speed === '0.75×' ? 4200 : 3200,
      )
    } else {
      setPlaying(false)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }

  const startRecording = async () => {
    setMicError(null)
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError('Microphone input is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const recorder = new MediaRecorder(stream)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(audioBlob)
        setUserAudioUrl(url)
        // Stop all audio tracks to free mic
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      setRecordSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } catch (err: any) {
      console.warn('Microphone permission or hardware error:', err)
      // Provide clean simulated fallback if microphone hardware isn't connected
      setRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    } else {
      // Fallback take for testing
      setUserAudioUrl('simulated')
    }

    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const toggleUserAudioPlay = () => {
    if (!userAudioUrl) return

    if (userAudioUrl === 'simulated') {
      setUserAudioPlaying(true)
      setTimeout(() => setUserAudioPlaying(false), 2500)
      return
    }

    if (!userAudioPlayerRef.current) {
      userAudioPlayerRef.current = new Audio(userAudioUrl)
      userAudioPlayerRef.current.onended = () => setUserAudioPlaying(false)
    }

    if (!userAudioPlaying) {
      userAudioPlayerRef.current.play()
      setUserAudioPlaying(true)
    } else {
      userAudioPlayerRef.current.pause()
      userAudioPlayerRef.current.currentTime = 0
      setUserAudioPlaying(false)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (userAudioUrl && userAudioUrl !== 'simulated') {
        URL.revokeObjectURL(userAudioUrl)
      }
    }
  }, [userAudioUrl])

  return (
    <div className="audio-studio">
      <section className="audio-card">
        <div className="sentence-nav-bar">
          <button
            className="sentence-nav-btn"
            disabled={sentenceIdx === 0}
            onClick={() => {
              setSentenceIdx((prev) => Math.max(0, prev - 1))
              setUserAudioUrl(null)
              setUserAudioPlaying(false)
            }}
            type="button"
          >
            ← Previous
          </button>
          <span>SHADOWING · SENTENCE {currentSentence.num} OF 04</span>
          <button
            className="sentence-nav-btn"
            disabled={sentenceIdx === shadowSentences.length - 1}
            onClick={() => {
              setSentenceIdx((prev) => Math.min(shadowSentences.length - 1, prev + 1))
              setUserAudioUrl(null)
              setUserAudioPlaying(false)
            }}
            type="button"
          >
            Next →
          </button>
        </div>

        <p className="audio-sentence">{currentSentence.jp}</p>
        <p className="audio-reading">{currentSentence.reading}</p>
        <p
          style={{
            textAlign: 'center',
            color: 'var(--ink-soft)',
            fontSize: '12px',
            marginTop: '4px',
          }}
        >
          {currentSentence.en}
        </p>

        <div className={`waveform ${playing ? 'playing' : ''}`} aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i key={i} style={{ height: `${7 + ((i * 17) % 30)}px` }} />
          ))}
        </div>

        <div className="player-controls">
          <button
            aria-label={playing ? 'Pause audio' : 'Play native speaker audio'}
            className="round-control"
            onClick={togglePlay}
            type="button"
          >
            {playing ? 'Ⅱ' : '▶'}
          </button>
          <span>00:{playing ? '07' : '00'} / 00:11</span>
          <button onClick={() => setSpeed(speed === '1×' ? '0.75×' : '1×')} type="button">
            {speed}
          </button>
          <label>
            <input checked={loop} onChange={(e) => setLoop(e.target.checked)} type="checkbox" />{' '}
            Loop sentence
          </label>
        </div>
      </section>

      <section className="record-panel">
        <div>
          <p className="eyebrow">YOUR VOICE</p>
          <h2>Now follow the ink line.</h2>
          <p>Listen once. Then speak with the same pauses, not the same anxiety.</p>
        </div>

        <button
          className={`record-button ${recording ? 'recording' : ''}`}
          onClick={recording ? stopRecording : startRecording}
          type="button"
        >
          <Icon name="record" size={28} />
          <span>{recording ? 'Stop recording' : 'Record your voice'}</span>
        </button>

        {recording && (
          <p className="record-status">
            RECORDING · 00:{String(recordSeconds).padStart(2, '0')} · MICROPHONE ACTIVE
          </p>
        )}

        {micError && (
          <p style={{ color: 'var(--vermilion)', fontSize: '10px', marginTop: '8px' }}>
            {micError}
          </p>
        )}

        {userAudioUrl && !recording && (
          <div style={{ marginTop: '24px' }}>
            <p className="eyebrow" style={{ marginBottom: '8px' }}>
              RECORDED TAKE AVAILABLE
            </p>
            <div className="user-take-actions">
              <button
                className={`user-take-btn ${userAudioPlaying ? 'playing' : ''}`}
                onClick={toggleUserAudioPlay}
                type="button"
              >
                {userAudioPlaying ? '⏸ Pause Your Take' : '▶ Play Your Take'}
              </button>
              <button className="user-take-btn" onClick={startRecording} type="button">
                Retake
              </button>
            </div>
          </div>
        )}

        <div className="comparison" style={{ marginTop: userAudioUrl ? '28px' : 'auto' }}>
          <span>ORIGINAL</span>
          <div className="mini-wave" />
          <span>YOUR TAKE</span>
          <div
            className={`mini-wave ${userAudioUrl ? '' : 'quiet'}`}
            style={{
              opacity: userAudioPlaying ? 1 : userAudioUrl ? 0.85 : 0.35,
              filter: userAudioPlaying ? 'drop-shadow(0 0 2px var(--moss))' : 'none',
            }}
          />
        </div>
      </section>
    </div>
  )
}

const grammarChapters = [
  {
    title: 'Particles',
    eyebrow: '1.3 / DISTINGUISHING SUBJECT & TOPIC',
    rule: 'は (WA) VS が (GA)',
    formula: 'TOPIC は + STATEMENT / NEW INFO が + PREDICATE',
    explanation:
      'は introduces what you are talking about (the shared context). が marks the specific actor or newly introduced piece of information in the sentence.',
    examples: [
      ['私は学生です。', 'As for me, I am a student.'],
      ['雨が降っています。', 'Rain is falling (newly observed condition).'],
      ['猫が好きです。', 'I like cats (cats are the focus of like).'],
    ],
    mistake: {
      bad: '私が学生です (in ordinary greeting)',
      good: '私は学生です',
      note: 'Using が here makes it sound like “I am the one who is a student (not anyone else).”',
    },
  },
  {
    title: 'Verb forms',
    eyebrow: '2.1 / CHRONOLOGICAL ACTIONS',
    rule: '〜てから',
    formula: 'VERB TE-FORM + から + ACTION B',
    explanation:
      'Expresses that Action B happens strictly after Action A is finished. It establishes a deliberate sequence in time.',
    examples: [
      ['手を洗ってから、ご飯を食べます。', 'After washing my hands, I eat the meal.'],
      ['本を読んでから、寝ました。', 'After reading the book, I went to sleep.'],
      ['よく考えてから、返事をします。', 'After thinking carefully, I will give my reply.'],
    ],
    mistake: {
      bad: '本を読むから、寝ます',
      good: '本を読んでから、寝ます',
      note: 'Dictionary form + から means “because”, completely changing the meaning to giving a reason.',
    },
  },
  {
    title: 'Connecting ideas',
    eyebrow: '3.4 / NON-EXHAUSTIVE LISTING',
    rule: '〜たり〜たりする',
    formula: 'VERB A (TARI) + VERB B (TARI) + する',
    explanation:
      'Lists representative actions among others. It gently informs the listener that you did multiple things, without naming every single one.',
    examples: [
      [
        '休日は本を読んだり、散歩したりします。',
        'On days off, I do things like read books and take walks.',
      ],
      ['お茶を飲んだり、音楽を聴いたりした。', 'I drank tea, listened to music, and so on.'],
      ['雨が降ったり止んだりしています。', 'It has been raining on and off.'],
    ],
    mistake: {
      bad: '本を読んだり、散歩しました',
      good: '本を読んだり、散歩したりしました',
      note: 'Every listed verb needs the たり ending, followed by the concluding する.',
    },
  },
  {
    title: 'Giving reasons',
    eyebrow: '4.2 / EXPLAINING A REASON',
    rule: '〜ので',
    formula: 'PLAIN FORM + ので + RESULT',
    explanation:
      'ので connects a reason to its result. It sounds a little softer and more explanatory than から, useful when you are giving context rather than making an argument.',
    examples: [
      ['雨が降っているので、傘を持っていきます。', 'Because it is raining, I’ll take an umbrella.'],
      ['明日は早いので、もう寝ます。', 'I have an early start tomorrow, so I’m going to bed.'],
      ['静かなので、この喫茶店が好きです。', 'I like this café because it is quiet.'],
    ],
    mistake: {
      bad: '静かので',
      good: '静かなので',
      note: 'Na-adjectives and nouns need な before ので. Tiny bridge, frequent casualty.',
    },
  },
  {
    title: 'Comparisons',
    eyebrow: '5.1 / COMPARING TWO THINGS',
    rule: 'A のほうが B より 〜',
    formula: 'CHOICE A + のほうが + CHOICE B + より + ADJECTIVE',
    explanation:
      'Used when stating that between two distinct alternatives, Option A holds more of the stated quality than Option B.',
    examples: [
      ['バスより電車のほうが早いです。', 'The train is faster than the bus.'],
      ['コーヒーのほうが紅茶より好きです。', 'I prefer coffee to black tea.'],
      ['昨日のほうが今日より寒かった。', 'Yesterday was colder than today.'],
    ],
    mistake: {
      bad: '電車はバスに早い',
      good: '電車のほうがバスより早い',
      note: 'Comparisons require the のほうが and より balance; do not fall back to simple topic markers.',
    },
  },
]

export function GrammarViewer() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(3)
  const chapter = grammarChapters[activeChapterIndex]

  return (
    <div className="grammar-layout">
      <nav aria-label="Grammar chapters" className="chapter-list">
        <p className="eyebrow">CONTENTS</p>
        {grammarChapters.map((ch, i) => (
          <button
            className={i === activeChapterIndex ? 'active' : ''}
            key={ch.title}
            onClick={() => setActiveChapterIndex(i)}
            style={{
              width: '100%',
              textAlign: 'left',
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
            }}
            type="button"
          >
            <span>0{i + 1}</span>
            {ch.title}
          </button>
        ))}
      </nav>
      <article className="grammar-article">
        <header>
          <p className="eyebrow">{chapter.eyebrow}</p>
          <h2>{chapter.rule}</h2>
          <code>{chapter.formula}</code>
        </header>
        <p>{chapter.explanation}</p>
        <section className="grammar-examples">
          <p className="eyebrow">THREE EXAMPLES</p>
          {chapter.examples.map(([jp, en], i) => (
            <div key={jp}>
              <span>0{i + 1}</span>
              <p>{jp}</p>
              <small>{en}</small>
            </div>
          ))}
        </section>
        <aside className="common-mistake">
          <p className="eyebrow">COMMON MISTAKE / MARGIN NOTE</p>
          <p>
            <del>{chapter.mistake.bad}</del> → <ins>{chapter.mistake.good}</ins>
          </p>
          <span>{chapter.mistake.note}</span>
        </aside>
        <a className="primary-button" href="/review">
          Practice this point <Icon name="arrow" />
        </a>
      </article>
    </div>
  )
}

export function SettingsPanel() {
  const { profile, updateProfile } = useLearnerProfileStore()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [name, setName] = useState(profile.name)
  const [targetLang, setTargetLang] = useState(profile.targetLanguage)
  const [level, setLevel] = useState(profile.level)
  const [dailyGoal, setDailyGoal] = useState(String(profile.dailyGoalMinutes))
  const [weeklyGoal, setWeeklyGoal] = useState(String(profile.weeklyGoalMinutes))
  const [furigana, setFurigana] = useState(profile.furiganaDefault)
  const [romanization, setRomanization] = useState(profile.romanizationDefault)

  const [theme, setTheme] = useState('Paper')
  const [fontSize, setFontSize] = useState(String(profile.fontSize || 16))
  const [saved, setSaved] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    const isNight = document.documentElement.classList.contains('night-ink')
    setTheme(isNight ? 'Night Ink' : 'Paper')
  }, [])

  const applyTheme = (value: string) => {
    setTheme(value)
    const isNight = value === 'Night Ink'
    document.documentElement.classList.toggle('night-ink', isNight)
    window.localStorage.setItem('marginalia-theme', isNight ? 'night' : 'paper')
    updateProfile({ theme: isNight ? 'night' : 'paper' })
  }

  const handleFontSizeChange = (val: string) => {
    setFontSize(val)
    document.documentElement.style.fontSize = `${val}px`
    updateProfile({ fontSize: Number(val) })
  }

  const exportBackup = () => {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: getStoredLearnerProfile(),
      vocabulary: getStoredVocabulary(),
      activity: getStoredStudyActivity(),
      journal: getStoredJournal(),
      customPassage: getStoredCustomPassage(),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `marginalia-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setToastMsg('Archive downloaded successfully ✓')
    setTimeout(() => setToastMsg(null), 3000)
  }

  const handleImportBackup = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string
        const parsed = JSON.parse(raw)
        if (parsed.vocabulary && Array.isArray(parsed.vocabulary)) {
          saveStoredVocabulary(parsed.vocabulary)
        }
        if (parsed.activity) {
          saveStoredStudyActivity(parsed.activity)
        }
        if (parsed.profile) {
          saveStoredLearnerProfile(parsed.profile)
          setName(parsed.profile.name || 'Rani')
          setTargetLang(parsed.profile.targetLanguage || 'japanese')
          setLevel(parsed.profile.level || 'N4')
        }
        if (parsed.journal && Array.isArray(parsed.journal)) {
          saveStoredJournal(parsed.journal)
        }
        if (parsed.customPassage) {
          saveStoredCustomPassage(parsed.customPassage)
        }
        setToastMsg('Backup archive restored cleanly ✓')
        setTimeout(() => setToastMsg(null), 3500)
      } catch (err) {
        console.error('Failed to parse backup JSON:', err)
        setToastMsg('Could not read backup file. Please verify JSON format.')
        setTimeout(() => setToastMsg(null), 3500)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleResetData = () => {
    resetVocabularyToDefault()
    saveStoredStudyActivity(DEFAULT_STUDY_ACTIVITY)
    saveStoredJournal([])
    saveStoredCustomPassage(null)
    setShowResetConfirm(false)
    setToastMsg('Notebook reset to clean paper ✓')
    setTimeout(() => setToastMsg(null), 3500)
  }

  const handleSaveSettings = (event: FormEvent) => {
    event.preventDefault()
    updateProfile({
      name: name.trim() || 'Rani',
      targetLanguage: targetLang as any,
      level: level.trim() || 'N4',
      dailyGoalMinutes: Number(dailyGoal) || 15,
      weeklyGoalMinutes: Number(weeklyGoal) || 100,
      furiganaDefault: furigana,
      romanizationDefault: romanization,
      fontSize: Number(fontSize) || 16,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3500)
  }

  return (
    <form className="settings-form" onSubmit={handleSaveSettings}>
      <fieldset>
        <legend>LEARNER PROFILE</legend>
        <label>
          <span>
            Learner name<small>How Marginalia addresses your notebook.</small>
          </span>
          <input onChange={(e) => setName(e.target.value)} required type="text" value={name} />
        </label>
        <label>
          <span>
            Target language<small>Active language for daily dashboard and review stack.</small>
          </span>
          <select onChange={(e) => setTargetLang(e.target.value as any)} value={targetLang}>
            <option value="japanese">Japanese (日本語)</option>
            <option value="korean">Korean (한국어)</option>
            <option value="spanish">Spanish (Español)</option>
            <option value="english">English</option>
            <option value="indonesian">Indonesian (Bahasa Indonesia)</option>
          </select>
        </label>
        <label>
          <span>
            Current level<small>Graded reader and review badge reference.</small>
          </span>
          <input
            onChange={(e) => setLevel(e.target.value)}
            placeholder="e.g. N4, Beginner, Intermediate"
            type="text"
            value={level}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>STUDY GOALS</legend>
        <label>
          <span>
            Daily goal<small>Enough to matter, not enough to dread.</small>
          </span>
          <select onChange={(e) => setDailyGoal(e.target.value)} value={dailyGoal}>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
            <option value="30">30 minutes</option>
          </select>
        </label>
        <label>
          <span>
            Weekly goal (minutes)<small>Measured on the pen-line progress bar.</small>
          </span>
          <input
            max="600"
            min="30"
            onChange={(e) => setWeeklyGoal(e.target.value)}
            type="number"
            value={weeklyGoal}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>READING & SOUND</legend>
        <label>
          <span>Show furigana by default</span>
          <input
            checked={furigana}
            onChange={(e) => setFurigana(e.target.checked)}
            type="checkbox"
          />
        </label>
        <label>
          <span>Show romanization</span>
          <input
            checked={romanization}
            onChange={(e) => setRomanization(e.target.checked)}
            type="checkbox"
          />
        </label>
        <label>
          <span>
            Font size: {fontSize}px
            <small>Adjust base reading and display proportion.</small>
          </span>
          <input
            max="22"
            min="14"
            onChange={(e) => handleFontSizeChange(e.target.value)}
            type="range"
            value={fontSize}
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>NOTEBOOK & DATA</legend>
        <label>
          <span>Theme</span>
          <span className="theme-choice">
            {['Paper', 'Night Ink'].map((item) => (
              <button
                className={theme === item ? 'active' : ''}
                key={item}
                onClick={() => applyTheme(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </span>
        </label>
        <label>
          <span>
            Export data archive
            <small>Download your words, review intervals, writing, and profile.</small>
          </span>
          <button className="outline-button" onClick={exportBackup} type="button">
            <Icon name="download" /> Download JSON archive
          </button>
        </label>
        <label>
          <span>
            Restore from archive<small>Upload a previous marginalia-backup.json file.</small>
          </span>
          <button
            className="outline-button"
            onClick={() => fileInputRef.current?.click()}
            type="button"
          >
            <Icon name="upload" /> Restore backup
          </button>
          <input
            accept=".json"
            onChange={handleImportBackup}
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
          />
        </label>
        <label>
          <span>
            Reset notebook<small>Restore initial 13 starter words and clear custom drafts.</small>
          </span>
          <button
            className="outline-button"
            onClick={() => setShowResetConfirm(true)}
            style={{ borderColor: 'var(--vermilion)', color: 'var(--vermilion)' }}
            type="button"
          >
            <Icon name="trash" /> Reset to starter kit
          </button>
        </label>
      </fieldset>

      <button className="primary-button settings-save" type="submit">
        Save settings
      </button>

      {saved && <p className="saved-note">Filed neatly. Your settings are saved.</p>}
      {toastMsg && <p className="saved-note">{toastMsg}</p>}

      {showResetConfirm && (
        <div className="modal-backdrop" onClick={() => setShowResetConfirm(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'var(--vermilion)' }}>
                  CONFIRM NOTEBOOK RESET
                </p>
                <h2>Start from clean paper?</h2>
              </div>
              <button
                aria-label="Close dialog"
                className="modal-close"
                onClick={() => setShowResetConfirm(false)}
                type="button"
              >
                <Icon name="close" size={16} />
              </button>
            </div>
            <p style={{ margin: '16px 0 24px', lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              This will restore the 13 canonical starter vocabulary words and clean recent review
              intervals. Your current notes and drafts will be replaced with clean pages.
            </p>
            <div className="modal-actions">
              <button
                className="outline-button"
                onClick={() => setShowResetConfirm(false)}
                type="button"
              >
                Cancel
              </button>
              <button
                className="primary-button"
                onClick={handleResetData}
                style={{ background: 'var(--vermilion)' }}
                type="button"
              >
                Yes, reset notebook
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
