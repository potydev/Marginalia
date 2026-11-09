'use client'

import { useEffect, useState } from 'react'
import { Icon } from './icons'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const saved = window.localStorage.getItem('marginalia-theme') === 'night'
    setDark(saved)
    document.documentElement.classList.toggle('night-ink', saved)
  }, [])

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('night-ink', next)
    window.localStorage.setItem('marginalia-theme', next ? 'night' : 'paper')
  }

  return (
    <button
      aria-label={dark ? 'Use Paper theme' : 'Use Night Ink theme'}
      className="icon-button"
      onClick={toggle}
      type="button"
    >
      <Icon name={dark ? 'sun' : 'moon'} />
    </button>
  )
}
