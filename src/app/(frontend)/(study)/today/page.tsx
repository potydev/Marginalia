import Link from 'next/link'
import { Icon } from '@/components/icons'
import { PageHeader, Stamp } from '@/components/page-parts'
import { WordOfDayCard } from '@/components/study-widgets'

const heat = [
  0, 1, 2, 0, 3, 2, 1, 0, 1, 1, 3, 2, 0, 0, 2, 3, 3, 1, 0, 2, 1, 3, 2, 0, 1, 2, 2, 3, 1, 0, 0, 2, 3,
  1, 2, 0, 1, 3, 3, 2, 1, 0, 2, 2, 3, 1, 0, 1, 2, 3, 3, 2, 1, 0, 2, 3, 1, 2, 0, 1, 3, 2, 2, 1, 0, 2,
  3, 3, 1, 0, 1, 2, 3, 2, 0, 1, 2, 3, 1, 0, 2, 2, 1, 3,
]

export default function TodayPage() {
  return (
    <>
      <PageHeader
        description="Good morning, Rani. A little Japanese before the day gets loud."
        eyebrow="FRIDAY · 17 OCTOBER · DAY 47"
        note={
          <>
            <span>おはよう</span>
            <p>
              OHAYŌ
              <br />
              GOOD MORNING
            </p>
          </>
        }
        title="Today’s page"
      />
      <div className="today-grid">
        <section className="due-block">
          <div>
            <p className="eyebrow">DUE TODAY</p>
            <strong className="due-number">18</strong>
            <p>
              reviews waiting
              <br />7 are new
            </p>
          </div>
          <Link className="primary-button" href="/review">
            Begin review <Icon name="arrow" />
          </Link>
          <Stamp>DUE TODAY</Stamp>
        </section>
        <aside className="personal-note">
          <p className="eyebrow">IN THE MARGIN</p>
          <p>You tend to forget particles.</p>
          <strong>12 of your last 20 misses.</strong>
          <svg aria-hidden="true" viewBox="0 0 80 30">
            <path d="M3 6c26 0 45 7 70 18m-9-8 9 8-11 2" />
          </svg>
        </aside>
        <section className="streak-block">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">OCTOBER</p>
              <h2>Practice marks</h2>
            </div>
            <span>14 DAYS THIS MONTH</span>
          </div>
          <div className="tally-calendar">
            {Array.from({ length: 31 }, (_, i) => (
              <div
                className={
                  [1, 2, 4, 5, 7, 8, 9, 11, 12, 14, 15, 16, 17, 18].includes(i) ? 'marked' : ''
                }
                key={i}
              >
                <span>{i + 1}</span>
                <i />
              </div>
            ))}
          </div>
          <p className="dry-note">A modest streak is still a streak.</p>
        </section>
        <WordOfDayCard />
        <section className="heatmap-block">
          <div className="section-title-line">
            <div>
              <p className="eyebrow">LAST 12 WEEKS</p>
              <h2>Ink on the page</h2>
            </div>
            <span>42 HOURS TOTAL</span>
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
            <strong>82</strong>
            <span>/ 100 minutes</span>
          </div>
          <div className="pen-progress">
            <span />
          </div>
          <p>Eighteen minutes left. One short reading would do it.</p>
        </section>
      </div>
    </>
  )
}
