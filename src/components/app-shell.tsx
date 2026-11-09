'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from './icons'
import { ThemeToggle } from './theme-toggle'
import { useLearnerProfileStore, useVocabularyStore, useStudyActivityStore } from '@/lib/storage'

const nav: { href: string; label: string; icon: IconName }[] = [
  { href: '/today', label: 'Today', icon: 'notebook' },
  { href: '/review', label: 'Review', icon: 'cards' },
  { href: '/notebook', label: 'Notebook', icon: 'book' },
  { href: '/reading', label: 'Reading', icon: 'book' },
  { href: '/writing', label: 'Writing', icon: 'pen' },
  { href: '/listening', label: 'Listening', icon: 'headphones' },
  { href: '/grammar', label: 'Grammar', icon: 'notebook' },
  { href: '/progress', label: 'Progress', icon: 'chart' },
]

const mobileNav: { href: string; label: string; icon: IconName }[] = [
  { href: '/today', label: 'Today', icon: 'notebook' },
  { href: '/review', label: 'Review', icon: 'cards' },
  { href: '/reading', label: 'Read', icon: 'book' },
  { href: '/notebook', label: 'Notebook', icon: 'book' },
  { href: '/settings', label: 'Me', icon: 'settings' },
]

const languages = [
  { lang: 'japanese', code: 'ja', label: 'Japanese · N4', glyph: '日' },
  { lang: 'korean', code: 'ko', label: 'Korean · Beginner', glyph: '한' },
  { lang: 'spanish', code: 'es', label: 'Spanish · Intermedio', glyph: 'E' },
  { lang: 'english', code: 'en', label: 'English · Advanced', glyph: 'A' },
  { lang: 'indonesian', code: 'id', label: 'Indonesian · Sastra', glyph: 'I' },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { profile, updateProfile } = useLearnerProfileStore()
  const { words } = useVocabularyStore()
  const { activity } = useStudyActivityStore()

  const currentLang = languages.find((l) => l.lang === profile.targetLanguage) || languages[0]
  const dueCount = words.filter(
    (w) => w.language === profile.targetLanguage && w.status !== 'known',
  ).length

  const [showLangMenu, setShowLangMenu] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  return (
    <div className="study-shell">
      <header className="study-topbar">
        <Link className="wordmark" href="/">
          Marginalia<span>＊</span>
        </Link>
        <div className="topbar-actions" style={{ position: 'relative' }}>
          <button
            aria-expanded={showLangMenu}
            aria-haspopup="listbox"
            className="language-switcher"
            onClick={() => {
              setShowLangMenu(!showLangMenu)
              setShowProfile(false)
            }}
            type="button"
          >
            <span className="language-glyph">{currentLang.glyph}</span>
            <span>{currentLang.label}</span>
            <Icon name="chevron" size={13} />
          </button>

          {showLangMenu && (
            <div
              className="word-popover"
              role="listbox"
              style={{
                position: 'absolute',
                top: '46px',
                right: '50px',
                width: '210px',
                padding: '12px',
                zIndex: 40,
              }}
            >
              <p className="eyebrow" style={{ marginBottom: '8px' }}>
                ACTIVE NOTEBOOK
              </p>
              {languages.map((l) => (
                <button
                  className="nav-item"
                  key={l.code}
                  onClick={() => {
                    updateProfile({
                      targetLanguage: l.lang as any,
                      level: l.label.split('·')[1]?.trim() || profile.level,
                    })
                    setShowLangMenu(false)
                  }}
                  role="option"
                  aria-selected={l.lang === profile.targetLanguage}
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    background:
                      l.lang === profile.targetLanguage ? 'var(--paper-dark)' : 'transparent',
                    border: 0,
                    cursor: 'pointer',
                    padding: '8px',
                    fontSize: '11px',
                  }}
                  type="button"
                >
                  <span
                    className="language-glyph"
                    style={{ width: '18px', height: '18px', fontSize: '11px' }}
                  >
                    {l.glyph}
                  </span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}

          <ThemeToggle />

          <button
            aria-expanded={showProfile}
            aria-label={`Open ${profile.name}’s profile`}
            className="profile-mark"
            onClick={() => {
              setShowProfile(!showProfile)
              setShowLangMenu(false)
            }}
            type="button"
          >
            {profile.name.charAt(0).toUpperCase() || 'R'}
          </button>

          {showProfile && (
            <div
              className="word-popover"
              style={{
                position: 'absolute',
                top: '46px',
                right: '0',
                width: '230px',
                padding: '16px',
                zIndex: 40,
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <p className="eyebrow">LEARNER PROFILE</p>
                <button
                  aria-label="Close profile menu"
                  onClick={() => setShowProfile(false)}
                  style={{
                    border: 0,
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--ink-soft)',
                  }}
                  type="button"
                >
                  ×
                </button>
              </div>
              <strong style={{ fontSize: '20px', marginTop: '6px' }}>{profile.name}</strong>
              <span className="word-popover-reading" style={{ marginTop: '2px' }}>
                Day {activity.streakDays} · Level {profile.level}{' '}
                {currentLang.label.split('·')[0].trim()}
              </span>
              <div
                style={{
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid var(--rule)',
                  fontSize: '11px',
                }}
              >
                <p style={{ margin: '4px 0', color: 'var(--ink-soft)' }}>
                  {words.length} words filed in notebook
                </p>
                <p style={{ margin: '4px 0', color: 'var(--ink-soft)' }}>
                  {dueCount} reviews waiting today
                </p>
              </div>
              <Link
                className="outline-button"
                href="/settings"
                onClick={() => setShowProfile(false)}
                style={{ marginTop: '14px', width: '100%', justifyContent: 'center' }}
              >
                <Icon name="settings" size={14} /> Open settings
              </Link>
            </div>
          )}
        </div>
      </header>
      <aside className="study-sidebar">
        <p className="margin-label">Study desk</p>
        <nav aria-label="Study navigation">
          {nav.map((item) => (
            <Link
              className={`nav-item ${pathname === item.href ? 'active' : ''}`}
              href={item.href}
              key={item.href}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="sidebar-foot">
          <Link className={`nav-item ${pathname === '/settings' ? 'active' : ''}`} href="/settings">
            <Icon name="settings" />
            <span>Settings</span>
          </Link>
          <p>
            DAY 47
            <br />
            Keep the pencil moving.
          </p>
        </div>
      </aside>
      <main className="study-main" id="main">
        {children}
      </main>
      <nav aria-label="Mobile navigation" className="mobile-tabbar">
        {mobileNav.map((item) => (
          <Link
            aria-current={pathname === item.href ? 'page' : undefined}
            className={pathname === item.href ? 'active' : ''}
            href={item.href}
            key={item.href}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
