'use client'

import { PageHeader, Stamp } from '@/components/page-parts'
import { useLearnerProfileStore, useStudyActivityStore, useVocabularyStore } from '@/lib/storage'

export function ProgressDashboard() {
  const { words } = useVocabularyStore()
  const { activity } = useStudyActivityStore()
  const { profile } = useLearnerProfileStore()

  // Calculate stats
  const totalWords = words.length
  const languageWords = words.filter((w) => w.language === profile.targetLanguage)
  const knownWords = languageWords.filter((w) => w.status === 'known').length

  // Calculate average session accuracy
  const recentSessions = activity.sessions.slice(0, 10)
  const avgAccuracy =
    recentSessions.length > 0
      ? Math.round(recentSessions.reduce((acc, s) => acc + s.accuracy, 0) / recentSessions.length)
      : 87

  // Collect miss history
  const missEntries = Object.entries(activity.missHistory || {})
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Default fallback misses if empty
  const defaultMisses = [
    { topic: 'は vs が', count: 14, kind: 'Particles' },
    { topic: 'ようになる', count: 9, kind: 'Grammar' },
    { topic: 'transitive pairs', count: 7, kind: 'Verbs' },
    { topic: 'たしかに', count: 5, kind: 'Vocabulary' },
  ]

  const displayMisses =
    missEntries.length > 0
      ? missEntries.map(([topic, count]) => ({
          topic,
          count,
          kind: topic.includes('(') ? 'Grammar' : 'Vocabulary',
        }))
      : defaultMisses

  return (
    <>
      <PageHeader
        description="Not a scoreboard. Just enough evidence to notice what is changing."
        eyebrow={`PROGRESS / FIRST ${activity.streakDays} DAYS`}
        note={
          <>
            <span>LOG BOOK</span>
            <p>
              Measured in words,
              <br />
              not medals.
            </p>
          </>
        }
        title="What is beginning to stick"
      />
      <div className="progress-grid">
        <section className="growth-chart">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">VOCABULARY GROWTH</p>
              <h2>Words in reach</h2>
            </div>
            <strong>{totalWords}</strong>
          </div>
          <svg aria-label="Vocabulary growth from week one to week seven" viewBox="0 0 760 250">
            <path className="gridline" d="M20 210H740M20 150H740M20 90H740M20 30H740" />
            <path
              className="chartline"
              d="M20 220C80 215 102 200 140 197S210 174 260 169s71-38 120-36 73-29 120-35 69-34 120-44 75-24 120-29"
            />
            <g>
              <text x="20" y="242">
                W1
              </text>
              <text x="250" y="242">
                W3
              </text>
              <text x="490" y="242">
                W5
              </text>
              <text x="720" y="242">
                W7
              </text>
            </g>
            <text className="direct-label" x="650" y="42">
              {totalWords} in notebook
            </text>
          </svg>
        </section>

        <section className="stat-ledger">
          <p>
            <span>RETENTION</span>
            <strong>{avgAccuracy}%</strong>
            <small>active accuracy</small>
          </p>
          <p>
            <span>TIME STUDIED</span>
            <strong>{activity.totalHoursLifetime}h</strong>
            <small>lifetime practice</small>
          </p>
          <p>
            <span>MASTERED / {profile.level}</span>
            <strong>{knownWords}</strong>
            <small>of {languageWords.length} saved</small>
          </p>
        </section>

        <section className="forget-list">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">WHAT YOU KEEP FORGETTING</p>
              <h2>The usual suspects</h2>
            </div>
            <span>LAST 30 DAYS</span>
          </div>
          {displayMisses.map((item, i) => (
            <div className="forget-row" key={item.topic}>
              <span>0{i + 1}</span>
              <strong>{item.topic}</strong>
              <small>{item.kind}</small>
              <b>{item.count} misses</b>
            </div>
          ))}
        </section>

        <section className="milestone-list">
          <p className="eyebrow">MILESTONES / STAMPED IN</p>
          <div>
            <Stamp tone="green">100 WORDS</Stamp>
            <span>23 September</span>
          </div>
          <div>
            <Stamp>30 DAYS</Stamp>
            <span>30 September</span>
          </div>
          <div>
            <Stamp tone="green">FIRST STORY</Stamp>
            <span>06 October</span>
          </div>
          <p>No confetti was harmed.</p>
        </section>
      </div>
    </>
  )
}
