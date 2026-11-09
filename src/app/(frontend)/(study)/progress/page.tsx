import { PageHeader, Stamp } from '@/components/page-parts'

export default function ProgressPage() {
  return (
    <>
      <PageHeader
        description="Not a scoreboard. Just enough evidence to notice what is changing."
        eyebrow="PROGRESS / FIRST 47 DAYS"
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
            <strong>312</strong>
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
              312 familiar
            </text>
          </svg>
        </section>
        <section className="stat-ledger">
          <p>
            <span>RETENTION</span>
            <strong>87%</strong>
            <small>+4% this month</small>
          </p>
          <p>
            <span>TIME STUDIED</span>
            <strong>42h</strong>
            <small>53 min per day</small>
          </p>
          <p>
            <span>WORDS / N4</span>
            <strong>184</strong>
            <small>of roughly 650</small>
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
          {[
            ['は vs が', '14 misses', 'Particles'],
            ['ようになる', '9 misses', 'Grammar'],
            ['transitive pairs', '7 misses', 'Verbs'],
            ['たしかに', '5 misses', 'Vocabulary'],
          ].map(([topic, misses, kind], i) => (
            <div className="forget-row" key={topic}>
              <span>0{i + 1}</span>
              <strong>{topic}</strong>
              <small>{kind}</small>
              <b>{misses}</b>
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
