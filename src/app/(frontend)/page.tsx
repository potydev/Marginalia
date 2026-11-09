import Link from 'next/link'
import { Icon } from '@/components/icons'
import { LandingDemo } from '@/components/study-widgets'

export default function HomePage() {
  return (
    <main className="landing" id="main">
      <header className="landing-nav">
        <Link className="wordmark" href="/">
          Marginalia<span>＊</span>
        </Link>
        <nav aria-label="Landing navigation">
          <a href="#day">How it works</a>
          <a href="#pricing">Pricing</a>
          <Link href="/today">Sign in</Link>
          <Link className="small-cta" href="/today">
            Open a notebook <Icon name="arrow" size={15} />
          </Link>
        </nav>
      </header>

      <section className="cover">
        <div className="cover-copy">
          <p className="eyebrow">A LANGUAGE NOTEBOOK / EST. FOR THE LONG HAUL</p>
          <h1>
            Learn the words you <em>actually</em> meet.
          </h1>
          <p>
            Read something. Save what catches. Review before it disappears. Marginalia keeps
            language study close to the page and out of your way.
          </p>
          <Link className="primary-button" href="/today">
            Start with Japanese <Icon name="arrow" />
          </Link>
          <span className="cover-footnote">
            NO STREAK PANIC · NO CARTOON OWLS · YOUR NOTES ARE YOURS
          </span>
        </div>
        <LandingDemo />
      </section>

      <section className="day-section" id="day">
        <div className="landing-margin">
          <span>01</span>
          <p>A day, not a dashboard.</p>
        </div>
        <div>
          <p className="eyebrow">HOW A DAY LOOKS</p>
          <h2>Small rituals. Useful repetition.</h2>
          <ol className="day-timeline">
            {[
              ['07:40', 'Morning review', 'Twelve cards. The kettle takes longer.'],
              ['12:15', 'Read one passage', 'Tap unfamiliar words; keep only the useful ones.'],
              ['18:30', 'Write three sentences', 'Corrections in the margin, where they belong.'],
              ['18:42', 'Close the notebook', 'Enough is a complete sentence.'],
            ].map(([time, title, copy]) => (
              <li key={time}>
                <time>{time}</time>
                <span />
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-quote">
        <p>“A dictionary tells you what a word means. A notebook remembers why you cared.”</p>
        <span>MARGINAL NOTE, PAGE 47</span>
      </section>

      <section className="pricing-section" id="pricing">
        <div className="landing-margin">
          <span>02</span>
          <p>One fair page.</p>
        </div>
        <div>
          <p className="eyebrow">PRICING / PRINTED PLAINLY</p>
          <h2>Choose how much desk you need.</h2>
          <div className="pricing-table">
            <div className="pricing-row pricing-head">
              <span>Edition</span>
              <span>For</span>
              <span>Includes</span>
              <span>Price</span>
            </div>
            <div className="pricing-row">
              <strong>Pencil</strong>
              <span>The curious</span>
              <span>1 language · reviews · reading · 300 saved words</span>
              <b>Free</b>
            </div>
            <div className="pricing-row featured">
              <strong>
                Notebook <i>FULL EDITION</i>
              </strong>
              <span>The regulars</span>
              <span>All practice modes · unlimited words · audio · export</span>
              <b>$7 / month</b>
            </div>
            <div className="pricing-row">
              <strong>Library</strong>
              <span>The devoted</span>
              <span>5 languages · family sharing · every future chapter</span>
              <b>$60 / year</b>
            </div>
          </div>
          <Link className="text-link" href="/today">
            Begin with the free edition <Icon name="arrow" />
          </Link>
        </div>
      </section>

      <footer className="colophon">
        <div>
          <Link className="wordmark" href="/">
            Marginalia<span>＊</span>
          </Link>
          <p>Set in Fraunces, Instrument Sans, IBM Plex Mono, and Noto Serif JP.</p>
        </div>
        <p>
          Designed for self-learners, paper people, and anyone who has ever written a translation
          above a line of text.
        </p>
        <nav aria-label="Colophon links">
          <a href="#day">Routine</a>
          <a href="#pricing">Editions</a>
          <Link href="/today">Study Desk</Link>
          <a href="mailto:hello@marginalia.local">Colophon Inquiries</a>
        </nav>
        <span>FIRST PRINTING · MMXXVI</span>
      </footer>
    </main>
  )
}
