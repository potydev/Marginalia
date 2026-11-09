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
import { Icon } from './icons'
import { Stamp } from './page-parts'
import { Button, IndexCard, Input, Table, Tabs, Tag, WordPopover } from './ui'
import {
  useVocabularyStore,
  addVocabularyItem,
  updateVocabularyItem,
  deleteVocabularyItem,
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
  const [added, setAdded] = useState(false)
  const [playing, setPlaying] = useState(false)

  const handlePlayAudio = () => {
    setPlaying(true)
    playSpeech('よりみち')
    setTimeout(() => setPlaying(false), 1200)
  }

  const handleAdd = () => {
    addVocabularyItem({
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
          className={added ? 'ink-button' : 'outline-button'}
          onClick={handleAdd}
          type="button"
        >
          {added ? (
            <>
              <Icon name="book" /> Added to notebook ✓
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

const reviewCards = [
  {
    prompt: '木漏れ日',
    reading: 'こもれび · komorebi',
    meaning: 'sunlight filtering through trees',
    sentence: '窓から木漏れ日が入ってきた。',
  },
  {
    prompt: '寄り道',
    reading: 'よりみち · yorimichi',
    meaning: 'a detour; stopping somewhere on the way',
    sentence: '帰りに本屋へ寄り道した。',
  },
  {
    prompt: 'たしかに',
    reading: 'たしかに · tashika ni',
    meaning: 'certainly; that is true',
    sentence: 'たしかに、その考え方もありますね。',
  },
  {
    prompt: '雨宿り',
    reading: 'あまやどり · amayadori',
    meaning: 'sheltering from the rain',
    sentence: '軒先で雨宿りしながら待った。',
  },
  {
    prompt: '勉強',
    reading: 'べんきょう · benkyō',
    meaning: 'to study, diligence',
    sentence: '毎朝、少しずつ勉強を重ねる。',
  },
]

export function ReviewSession() {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [finished, setFinished] = useState(false)
  const [mode, setMode] = useState<'recognition' | 'recall' | 'listening'>('recognition')
  const [answer, setAnswer] = useState('')
  const [dragX, setDragX] = useState(0)
  const touchStart = useRef<number | null>(null)
  const card = reviewCards[index]

  const rate = (_recall?: 'Again' | 'Hard' | 'Good' | 'Easy') => {
    if (index === reviewCards.length - 1) {
      setFinished(true)
    } else {
      setIndex(index + 1)
      setFlipped(false)
      setAnswer('')
      setDragX(0)
    }
  }

  const playCardAudio = () => {
    playSpeech(card.prompt)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' && mode === 'recognition') {
        event.preventDefault()
        setFlipped((value) => !value)
      } else if (event.key.toLowerCase() === 'a') {
        playCardAudio()
      } else if (event.key === 'Escape') {
        setFlipped(false)
      } else if (flipped && ['1', '2', '3', '4'].includes(event.key)) {
        const rates: ('Again' | 'Hard' | 'Good' | 'Easy')[] = ['Again', 'Hard', 'Good', 'Easy']
        const pick = rates[Number(event.key) - 1]
        rate(pick)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (finished) {
    return (
      <section className="session-summary">
        <Stamp tone="green">SESSION FILED</Stamp>
        <p className="eyebrow">TEACHER’S NOTE · 08:42</p>
        <h2>Good work. 木漏れ日 still needs another meeting.</h2>
        <div className="summary-stats">
          <p>
            <strong>87%</strong>
            <span>accuracy</span>
          </p>
          <p>
            <strong>6:14</strong>
            <span>time</span>
          </p>
          <p>
            <strong>2</strong>
            <span>words to revisit</span>
          </p>
        </div>
        <Button
          onClick={() => (setFinished(false), setIndex(0), setFlipped(false))}
          type="button"
          variant="ink"
        >
          Return to the stack
        </Button>
      </section>
    )
  }

  return (
    <div className="review-workspace">
      <div className="review-progress">
        <span style={{ width: `${((index + 1) / reviewCards.length) * 100}%` }} />
      </div>
      <div className="review-meta">
        <span>
          {String(index + 1).padStart(2, '0')} / {String(reviewCards.length).padStart(2, '0')}
        </span>
        <Tabs
          items={['recognition', 'recall', 'listening'] as const}
          label="Card type"
          onChange={(item) => {
            setMode(item)
            setFlipped(false)
          }}
          value={mode}
        />
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
              <p className="eyebrow">{mode.toUpperCase()} · JAPANESE</p>
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
                  <p className="card-instruction">Listen, then write what you hear.</p>
                </>
              ) : (
                <>
                  <p className="review-word">{mode === 'recall' ? card.meaning : card.prompt}</p>
                  <p className="card-instruction">
                    {mode === 'recall' ? 'Write the Japanese.' : 'Space or tap to turn the card.'}
                  </p>
                </>
              )}
              {mode !== 'recognition' && (
                <span className="answer-wrap">
                  <Input
                    aria-label="Your answer"
                    onChange={(event) => setAnswer(event.target.value)}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.stopPropagation()
                        setFlipped(true)
                      }
                    }}
                    placeholder="Write your answer…"
                    value={answer}
                  />
                  <button
                    className="ink-button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setFlipped(true)
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
              <p className="review-example">{card.sentence}</p>
              <button
                className="audio-label"
                onClick={(e) => {
                  e.stopPropagation()
                  playCardAudio()
                }}
                style={{ background: 'transparent', border: 0, cursor: 'pointer' }}
                type="button"
              >
                <Icon name="audio" /> Hear it
              </button>
            </div>
          )}
        </IndexCard>
      </div>
      {flipped && (
        <div className="rating-row">
          {[
            ['Again', '10 min'],
            ['Hard', '2 days'],
            ['Good', '6 days'],
            ['Easy', '3 weeks'],
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
  const [passageKey, setPassageKey] = useState<'daily' | 'culture' | 'easy'>('daily')
  const [furigana, setFurigana] = useState(true)
  const [translation, setTranslation] = useState(false)
  const [selectedWord, setSelectedWord] = useState<{ word: string; reading: string } | null>(null)
  const [savedStatus, setSavedStatus] = useState<string | null>(null)

  const passage = readingPassages[passageKey]

  const handleSaveToNotebook = () => {
    if (!selectedWord) return
    const parts = selectedWord.reading.split('·')
    const readingClean = (parts[0] || selectedWord.word).trim()
    const meaningClean = (parts[1] || selectedWord.reading).trim()

    addVocabularyItem({
      word: selectedWord.word,
      reading: readingClean,
      meaning: meaningClean,
      language: 'japanese',
      status: 'learning',
      level: passage.level.split('·')[0].trim(),
      source: passage.titleJp,
      tags: [{ label: 'reading' }, { label: 'graded-reader' }],
      examples: [
        {
          sentence: `文章「${passage.titleJp}」の中で出会った言葉。`,
          translation: `Found in "${passage.titleEn}"`,
        },
      ],
    })

    setSavedStatus(`Added “${selectedWord.word}” to notebook ✓`)
    setTimeout(() => {
      setSavedStatus(null)
      setSelectedWord(null)
    }, 1500)
  }

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
            setPassageKey(e.target.value as any)
            setSelectedWord(null)
          }}
          value={passageKey}
        >
          <option value="daily">N4 · Daily life (Café)</option>
          <option value="culture">N4 · Culture (Bookshop)</option>
          <option value="easy">N5 · Easy (Morning walk)</option>
        </select>
      </aside>
      <article className="reading-paper">
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
      </article>
    </div>
  )
}

export function WritingPad() {
  const [text, setText] = useState(
    '朝はトーストとコーヒーを食べました。それから、いそがしい駅に行きました。',
  )
  const [reviewed, setReviewed] = useState(false)
  const [savedNote, setSavedNote] = useState(false)

  const handleSaveCorrected = () => {
    setSavedNote(true)
    setTimeout(() => setSavedNote(false), 2500)
  }

  return (
    <div className="writing-grid">
      <aside className="prompt-slip">
        <p className="eyebrow">PROMPT 14 · DAILY LIFE</p>
        <h2>Describe your breakfast using three new words.</h2>
        <p>Try: 香り · 焼く · やっぱり</p>
        <span>80–120 characters. Imperfection permitted.</span>
      </aside>
      <div className="writing-sheet">
        <div className="writing-toolbar">
          <span>{text.length} CHARACTERS</span>
          <button className="primary-button" onClick={() => setReviewed(true)} type="button">
            Review my writing <Icon name="arrow" />
          </button>
        </div>
        <textarea
          aria-label="Japanese writing practice"
          onChange={(e) => setText(e.target.value)}
          value={text}
        />
        {reviewed && (
          <div className="correction-layer">
            <span className="red-edit edit-one">飲みました</span>
            <span className="margin-comment comment-one">
              Coffee is drunk, not eaten. Japanese agrees with the cup.
            </span>
            <span className="red-edit edit-two">にぎやかな</span>
            <span className="margin-comment comment-two">
              いそがしい describes a person or schedule. A station is lively.
            </span>
            <button className="outline-button" onClick={handleSaveCorrected} type="button">
              {savedNote ? 'Saved to notebook ✓' : 'Save corrected version'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AudioStudio() {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState<'1×' | '0.75×'>('1×')
  const [loop, setLoop] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [hasVoiceTake, setHasVoiceTake] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const sentenceText = '雨が降っていたので、喫茶店に入りました。'

  const togglePlay = () => {
    if (!playing) {
      setPlaying(true)
      const rate = speed === '0.75×' ? 0.75 : 1
      playSpeech(sentenceText, 'ja-JP', rate)
      setTimeout(
        () => {
          setPlaying(false)
          if (loop) {
            setTimeout(togglePlay, 500)
          }
        },
        speed === '0.75×' ? 4000 : 3000,
      )
    } else {
      setPlaying(false)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }

  const toggleRecord = () => {
    if (!recording) {
      setRecording(true)
      setRecordSeconds(0)
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1)
      }, 1000)
    } else {
      setRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
      setHasVoiceTake(true)
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="audio-studio">
      <section className="audio-card">
        <p className="eyebrow">SHADOWING · SENTENCE 03 OF 08</p>
        <p className="audio-sentence">{sentenceText}</p>
        <p className="audio-reading">Ame ga futte ita node, kissaten ni hairimashita.</p>
        <div className={`waveform ${playing ? 'playing' : ''}`} aria-hidden="true">
          {Array.from({ length: 48 }, (_, i) => (
            <i key={i} style={{ height: `${7 + ((i * 17) % 30)}px` }} />
          ))}
        </div>
        <div className="player-controls">
          <button
            aria-label={playing ? 'Pause audio' : 'Play audio'}
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
          onClick={toggleRecord}
          type="button"
        >
          <Icon name="record" size={28} />
          <span>{recording ? 'Stop recording' : 'Record your voice'}</span>
        </button>
        {recording && (
          <p className="record-status">
            RECORDING · 00:{String(recordSeconds).padStart(2, '0')} · THE RED DOT IS EARNEST
          </p>
        )}
        {hasVoiceTake && !recording && (
          <div className="comparison">
            <span>ORIGINAL</span>
            <div className="mini-wave" />
            <span>YOUR TAKE</span>
            <div className="mini-wave" style={{ opacity: 0.85 }} />
          </div>
        )}
        {!hasVoiceTake && !recording && (
          <div className="comparison">
            <span>ORIGINAL</span>
            <div className="mini-wave" />
            <span>YOUR TAKE</span>
            <div className="mini-wave quiet" />
          </div>
        )}
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
  const [theme, setTheme] = useState('Paper')
  const [fontSize, setFontSize] = useState('16')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const isNight = document.documentElement.classList.contains('night-ink')
    setTheme(isNight ? 'Night Ink' : 'Paper')
  }, [])

  const applyTheme = (value: string) => {
    setTheme(value)
    const isNight = value === 'Night Ink'
    document.documentElement.classList.toggle('night-ink', isNight)
    window.localStorage.setItem('marginalia-theme', isNight ? 'night' : 'paper')
  }

  const handleFontSizeChange = (val: string) => {
    setFontSize(val)
    document.documentElement.style.fontSize = `${val}px`
  }

  const exportBackup = () => {
    const backup = {
      profile: { user: 'Rani', targetLanguage: 'Japanese', level: 'N4', day: 47 },
      settings: { theme, fontSize, dailyGoal: '20 minutes', newCardsPerDay: 7 },
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'marginalia-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <form
      className="settings-form"
      onSubmit={(event) => {
        event.preventDefault()
        setSaved(true)
        setTimeout(() => setSaved(false), 3500)
      }}
    >
      <fieldset>
        <legend>STUDY</legend>
        <label>
          <span>
            Language & level<small>The notebook you’re currently using.</small>
          </span>
          <select defaultValue="Japanese · N4">
            <option>Japanese · N4</option>
            <option>Korean · Beginner</option>
            <option>Spanish · Intermediate</option>
            <option>English · Advanced</option>
            <option>Indonesian · Native / Literary</option>
          </select>
        </label>
        <label>
          <span>
            Daily goal<small>Enough to matter, not enough to dread.</small>
          </span>
          <select defaultValue="20 minutes">
            <option>10 minutes</option>
            <option>20 minutes</option>
            <option>30 minutes</option>
          </select>
        </label>
        <label>
          <span>New cards per day</span>
          <input defaultValue="7" max="50" min="0" type="number" />
        </label>
        <label>
          <span>Review order</span>
          <select defaultValue="Mixed">
            <option>Mixed</option>
            <option>Due first</option>
            <option>New first</option>
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>READING & SOUND</legend>
        <label>
          <span>Show furigana by default</span>
          <input defaultChecked type="checkbox" />
        </label>
        <label>
          <span>Show romanization</span>
          <input type="checkbox" />
        </label>
        <label>
          <span>Audio voice</span>
          <select defaultValue="Aoi · Tokyo">
            <option>Aoi · Tokyo</option>
            <option>Haruto · Tokyo</option>
          </select>
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
        <legend>NOTEBOOK</legend>
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
          <span>Reminder time</span>
          <input defaultValue="08:15" type="time" />
        </label>
        <label>
          <span>
            Export your data<small>Words, reviews, writing, and settings archive.</small>
          </span>
          <button className="outline-button" onClick={exportBackup} type="button">
            <Icon name="download" /> Download archive
          </button>
        </label>
      </fieldset>
      <button className="primary-button settings-save" type="submit">
        Save settings
      </button>
      {saved && <p className="saved-note">Filed neatly. Your settings are saved.</p>}
    </form>
  )
}
