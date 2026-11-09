'use client'

import Link from 'next/link'
import { Icon } from '@/components/icons'
import { PageHeader, Stamp } from '@/components/page-parts'
import { WordOfDayCard } from '@/components/study-widgets'
import { useLearnerProfileStore, useStudyActivityStore, useVocabularyStore } from '@/lib/storage'

const heat = [
  0, 1, 2, 0, 3, 2, 1, 0, 1, 1, 3, 2, 0, 0, 2, 3, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2, 2, 3, 1, 0, 0, 2, 3,
  1, 2, 0, 1, 3, 3, 2, 1, 0, 2, 2, 3, 1, 0, 1, 2, 3, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2, 2, 1, 0, 2,
  3, 3, 1, 0, 1, 2, 3, 2, 0, 1, 2, 3, 1, 0, 2, 2, 1, 3,
]

const greetings: Record<
  string,
  { script: string; romanization: string; translation: string; langLabel: string }
> = {
  japanese: {
    script: 'おはよう',
    romanization: 'OHAYŌ',
    translation: 'GOOD MORNING',
    langLabel: 'Japanese',
  },
  korean: {
    script: '좋은 아침',
    romanization: 'JOEUN ACHIM',
    translation: 'GOOD MORNING',
    langLabel: 'Korean',
  },
  spanish: {
    script: 'Buenos días',
    romanization: 'BUENOS DÍAS',
    translation: 'GOOD MORNING',
    langLabel: 'Spanish',
  },
  english: {
    script: 'Good morning',
    romanization: 'GOOD MORNING',
    translation: 'FRESH PAGE',
    langLabel: 'English',
  },
  indonesian: {
    script: 'Selamat pagi',
    romanization: 'SELAMAT PAGI',
    translation: 'LEMBAR BARU',
    langLabel: 'Indonesian',
  },
}

export function TodayDashboard() {
  const { words } = useVocabularyStore()
  const { activity } = useStudyActivityStore()
  const { profile } = useLearnerProfileStore()

  // Filter words by user's active language
  const languageWords = words.filter((w) => w.language === profile.targetLanguage)
  const dueWords = languageWords.filter((w) => w.status !== 'known')
  const newWords = languageWords.filter((w) => w.status === 'new')

  // Top miss analysis
  const missEntries = Object.entries(activity.missHistory || {})
  missEntries.sort((a, b) => b[1] - a[1])
  const topMiss = missEntries.length > 0 && missEntries[0][1] > 0 ? missEntries[0] : null

  // Date formatting
  const today = new Date()
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()
  const monthName = today.toLocaleDateString('en-US', { month: 'long' }).toUpperCase()
  const dayNumber = today.getDate()

  const greeting = greetings[profile.targetLanguage] || greetings.japanese
  const weeklyGoal = profile.weeklyGoalMinutes || 100
  const minutesDone = activity.totalMinutesThisWeek || 0
  const minutesLeft = Math.max(0, weeklyGoal - minutesDone)
  const progressPercent = Math.min(100, Math.round((minutesDone / weeklyGoal) * 100))

  return (
    <>
      <PageHeader
        description={`Good morning, ${profile.name}. A little ${greeting.langLabel} before the day gets loud.`}
        eyebrow={`${dayName} · ${dayNumber} ${monthName} · DAY ${activity.streakDays}`}
        note={
          <>
            <span>{greeting.script}</span>
            <p>
              {greeting.romanization}
              <br />
              {greeting.translation}
            </p>
          </>
        }
        title="Today’s page"
      />
      <div className="today-grid">
        <section className="due-block">
          <div>
            <p className="eyebrow">DUE TODAY</p>
            <strong className="due-number">{dueWords.length}</strong>
            <p>
              {dueWords.length === 0 ? (
                <>
                  all words caught up
                  <br />
                  stack is clear
                </>
              ) : (
                <>
                  reviews waiting
                  <br />
                  {newWords.length} are new
                </>
              )}
            </p>
          </div>
          <Link
            className="primary-button"
            href={dueWords.length === 0 ? '/review?mode=all' : '/review'}
          >
            {dueWords.length === 0 ? 'Review stack anyway' : 'Begin review'} <Icon name="arrow" />
          </Link>
          <Stamp tone={dueWords.length === 0 ? 'green' : undefined}>
            {dueWords.length === 0 ? 'ALL FILED' : 'DUE TODAY'}
          </Stamp>
        </section>

        <aside className="personal-note">
          <p className="eyebrow">IN THE MARGIN</p>
          {topMiss ? (
            <>
              <p>You tend to hesitate on {topMiss[0]}.</p>
              <strong>{topMiss[1]} misses recorded.</strong>
            </>
          ) : (
            <>
              <p>The ink is steady today.</p>
              <strong>Zero misses in queue.</strong>
            </>
          )}
          <svg aria-hidden="true" viewBox="0 0 80 30">
            <path d="M3 6c26 0 45 7 70 18m-9-8 9 8-11 2" />
          </svg>
        </aside>

        <section className="streak-block">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">{monthName}</p>
              <h2>Practice marks</h2>
            </div>
            <span>{activity.tallyDaysThisMonth.length} DAYS THIS MONTH</span>
          </div>
          <div className="tally-calendar">
            {Array.from({ length: 31 }, (_, i) => (
              <div className={activity.tallyDaysThisMonth.includes(i + 1) ? 'marked' : ''} key={i}>
                <span>{i + 1}</span>
                <i />
              </div>
            ))}
          </div>
          <p className="dry-note">
            {activity.streakDays >= 30
              ? 'A steady discipline leaves a dark mark.'
              : 'A modest streak is still a streak.'}
          </p>
        </section>

        <WordOfDayCard />

        <section className="heatmap-block">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">LAST 12 WEEKS</p>
              <h2>Ink on the page</h2>
            </div>
            <span>{activity.totalHoursLifetime} HOURS TOTAL</span>
          </div>
          <div className="study-heatmap" aria-label="Study activity for the last twelve weeks">
            {heat.map((value, i) => (
              <i className={`heat-${value}`} key={i} />
            ))}
          </div>
          <div className="heat-labels">
            <span>JUL</span>
            <span>AUG</span>
            <span>SEP</span>
            <span>OCT</span>
          </div>
        </section>

        <section className="weekly-goal">
          <p className="eyebrow">WEEKLY GOAL</p>
          <div>
            <strong>{minutesDone}</strong>
            <span>/ {weeklyGoal} minutes</span>
          </div>
          <div className="pen-progress">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <p>
            {minutesLeft === 0
              ? 'Weekly goal completed. Quietly carry on or close the book.'
              : `${minutesLeft} minutes left. One short reading would do it.`}
          </p>
        </section>
      </div>
    </>
  )
}
