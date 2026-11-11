'use client'

import { useEffect, useState, createContext, useContext, useCallback } from 'react'
import { ArrowLeft, BookOpen, ArrowUpRight, Mail, ZoomIn, X } from 'lucide-react'

/* ───────────────────────── NAVIGATION ───────────────────────── */

export type View = 'landing' | 'about' | 'insights'

const NavCtx = createContext<{
  view: View
  navigate: (to: View) => void
}>({
  view: 'landing',
  navigate: () => {},
})

export function useNav() {
  return useContext(NavCtx)
}

/* ───────────────────────── THEME ───────────────────────── */

type Theme = 'dark' | 'light'

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({ theme: 'light', toggle: () => {} })

function useTheme() {
  return useContext(ThemeCtx)
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return (localStorage.getItem('ui-theme') as Theme) || 'light'
  })

  useEffect(() => {
    localStorage.setItem('ui-theme', theme)
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>
}

function v(theme: Theme) {
  const d = theme === 'dark'
  return {
    // Nordic palette: black, deep navy blue, crisp white
    bg:          d ? '#040711' : '#FFFFFF',
    surface:     d ? '#080E1C' : '#F7F9FA',
    text:        d ? '#FFFFFF' : '#0B132B',
    muted:       d ? 'rgba(255,255,255,0.60)' : 'rgba(11,19,43,0.55)',
    faint:       d ? 'rgba(255,255,255,0.32)' : 'rgba(11,19,43,0.30)',
    ghost:       d ? 'rgba(255,255,255,0.15)' : 'rgba(11,19,43,0.12)',
    divider:     d ? 'rgba(255,255,255,0.10)' : 'rgba(11,19,43,0.08)',
    navBg:       d ? 'rgba(4,7,17,0.92)' : 'rgba(255,255,255,0.92)',
    // Sophisticated sage green
    sage:        d ? '#8FA89B' : '#456655',
    sageFaint:   d ? 'rgba(143,168,155,0.18)' : 'rgba(69,102,85,0.12)',
    forestHome:  d ? 'rgba(130, 165, 145, 0.40)' : 'rgba(55, 95, 75, 0.32)',
    forestAbout: d ? 'rgba(115, 155, 135, 0.38)' : 'rgba(45, 85, 65, 0.28)',
  }
}

/* ───────────────────────── TOGGLE (top-right) ───────────────────────── */

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const col = v(theme)
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      className="fixed cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        top: '0.85rem',
        right: '1rem',
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: '50%',
        background: 'transparent',
        border: `1px solid ${col.divider}`,
        zIndex: 9999,
      }}
      aria-label="Toggle theme"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke={col.text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {isDark ? (
          <>
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </>
        ) : (
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        )}
      </svg>
    </button>
  )
}

/* ───────────────────────── TOP NAVIGATION ───────────────────────── */

function TopNav() {
  const { view, navigate } = useNav()
  const { theme } = useTheme()
  const s = v(theme)

  const navItems: { id: View; label: string }[] = [
    { id: 'landing', label: 'Home' },
    { id: 'about', label: 'About' },
  ]

  return (
    <header
      className="fixed top-0 left-0 right-0 px-4 sm:px-8 md:px-12 py-3.5 sm:py-4 flex items-center justify-between no-print transition-colors duration-500"
      style={{
        background: s.navBg,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${s.divider}`,
        zIndex: 50,
      }}
    >
      {/* Brand logo as clean words only (no image logo) using the same font */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('landing')}
          className="transition-opacity duration-300 cursor-pointer text-left truncate hover:opacity-80"
          style={{
            color: s.text,
            fontSize: '0.6875rem',
            letterSpacing: '0.2em',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            background: 'none',
            border: 'none',
          }}
        >
          <span className="hidden sm:inline">NSRC Holdings</span>
          <span className="sm:hidden tracking-wider font-semibold">NSRC</span>
        </button>
      </div>

      {/* Primary Navigation: Home, About, Insights (compounders.cc) */}
      <nav className="flex items-center gap-1 sm:gap-2 md:gap-4 pr-12 sm:pr-14" aria-label="Main Navigation">
        {navItems.map(item => {
          const isActive = view === item.id
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className="px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer rounded whitespace-nowrap"
              style={{
                color: isActive ? s.text : s.muted,
                fontWeight: isActive ? 600 : 400,
                borderBottom: isActive ? `2px solid ${s.text}` : '2px solid transparent',
                background: 'transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.color = s.text
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.color = s.muted
              }}
            >
              {item.label}
            </button>
          )
        })}

        {/* Insights external link */}
        <a
          href="http://compounders.cc/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 cursor-pointer rounded whitespace-nowrap inline-flex items-center gap-1 border-b-2 border-transparent"
          style={{
            color: view === 'insights' ? s.text : s.muted,
            fontWeight: 400,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = s.text)}
          onMouseLeave={e => (e.currentTarget.style.color = s.muted)}
        >
          <span>Insights</span>
          <ArrowUpRight size={12} className="opacity-70" />
        </a>
      </nav>
    </header>
  )
}

/* ───────────────────────── NORDIC FOREST TREES ───────────────────────── */

function NordicForest({ color }: { color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
      <svg
        className="absolute bottom-0 left-0 w-full"
        style={{ height: '75vh' }}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMax slice"
        fill="none"
      >
        <g stroke={color} strokeWidth="0.7" opacity="0.45">
          <line x1="60" y1="900" x2="60" y2="580" />
          <polygon points="60,580 42,660 78,660" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="160" y1="900" x2="160" y2="560" />
          <polygon points="160,560 140,645 180,645" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="240" y1="900" x2="240" y2="590" />
          <polygon points="240,590 224,665 256,665" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="320" y1="900" x2="320" y2="570" />
          <polygon points="320,570 302,650 338,650" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="420" y1="900" x2="420" y2="550" />
          <polygon points="420,550 400,640 440,640" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="500" y1="900" x2="500" y2="600" />
          <polygon points="500,600 485,670 515,670" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="580" y1="900" x2="580" y2="565" />
          <polygon points="580,565 562,648 598,648" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="680" y1="900" x2="680" y2="575" />
          <polygon points="680,575 660,655 700,655" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="760" y1="900" x2="760" y2="555" />
          <polygon points="760,555 742,640 778,640" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="860" y1="900" x2="860" y2="585" />
          <polygon points="860,585 844,660 876,660" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="940" y1="900" x2="940" y2="560" />
          <polygon points="940,560 920,645 960,645" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1020" y1="900" x2="1020" y2="595" />
          <polygon points="1020,595 1005,668 1035,668" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1120" y1="900" x2="1120" y2="570" />
          <polygon points="1120,570 1102,652 1138,652" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1200" y1="900" x2="1200" y2="550" />
          <polygon points="1200,550 1180,638 1220,638" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1300" y1="900" x2="1300" y2="580" />
          <polygon points="1300,580 1284,658 1316,658" fill="none" stroke={color} strokeWidth="0.6" />
          <line x1="1380" y1="900" x2="1380" y2="565" />
          <polygon points="1380,565 1362,648 1398,648" fill="none" stroke={color} strokeWidth="0.6" />
        </g>
        <g stroke={color} strokeWidth="1" opacity="0.7">
          <line x1="40" y1="900" x2="40" y2="490" />
          <polygon points="40,490 10,605 70,605" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="40,560 20,640 60,640" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="120" y1="900" x2="120" y2="460" />
          <polygon points="120,460 88,585 152,585" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="120,535 100,625 140,625" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="200" y1="900" x2="200" y2="480" />
          <polygon points="200,480 170,600 230,600" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="200,550 182,635 218,635" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="280" y1="900" x2="280" y2="470" />
          <polygon points="280,470 252,595 308,595" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="280,540 264,625 296,625" fill="none" stroke={color} strokeWidth="0.8" />
          <line x1="360" y1="900" x2="360" y2="500" />
          <polygon points="360,500 335,605 385,605" fill="none" stroke={color} strokeWidth="0.8" />
          <polygon points="360,565 345,635 375,635" fill="none" stroke={color} strokeWidth="0.8" />
        </g>
        <g stroke={color} strokeWidth="1.3" opacity="0.9">
          <line x1="80" y1="900" x2="80" y2="360" />
          <polygon points="80,360 40,500 120,500" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="80,430 55,535 105,535" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="80,500 62,580 98,580" fill="none" stroke={color} strokeWidth="1" />
          <line x1="230" y1="900" x2="230" y2="340" />
          <polygon points="230,340 190,480 270,480" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="230,410 208,520 252,520" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="230,480 215,565 245,565" fill="none" stroke={color} strokeWidth="1" />
          <line x1="360" y1="900" x2="360" y2="375" />
          <polygon points="360,375 325,505 395,505" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="360,445 340,540 380,540" fill="none" stroke={color} strokeWidth="1" />
          <polygon points="360,515 348,585 372,585" fill="none" stroke={color} strokeWidth="1" />
        </g>
      </svg>
    </div>
  )
}

/* ───────────────────────── GRAIN OVERLAY ───────────────────────── */

function Grain() {
  return (
    <div
      className="fixed inset-0 pointer-events-none select-none"
      style={{
        zIndex: 1,
        opacity: 0.018,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
      }}
    />
  )
}

/* ───────────────────────── HOME VIEW ───────────────────────── */

function HomeHero() {
  const { theme } = useTheme()
  const { navigate } = useNav()
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  const s = v(theme)
  const isDark = theme === 'dark'

  const glow = isDark
    ? '0 0 40px rgba(255,255,255,0.15), 0 0 80px rgba(255,255,255,0.08)'
    : '0 0 40px rgba(11,19,43,0.12), 0 0 80px rgba(11,19,43,0.06)'

  const btnGlow = isDark
    ? '0 0 20px rgba(255,255,255,0.08)'
    : '0 0 20px rgba(11,19,43,0.06)'

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 relative transition-colors duration-500"
      style={{ background: s.bg, color: s.text }}
    >
      <NordicForest color={s.forestHome} />
      <Grain />

      <div
        className={`flex flex-col items-center transition-all duration-[2000ms] ease-out relative ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{ zIndex: 2 }}
      >
        {/* Words as logo in the exact same font & tracking */}
        <h1
          className="tracking-[0.35em] uppercase text-center select-none"
          style={{
            fontSize: 'clamp(1.25rem, 3.5vw, 2.25rem)',
            fontWeight: 300,
            letterSpacing: '0.35em',
            lineHeight: 1.4,
            textShadow: glow,
          }}
        >
          NSRC<br />Holdings
        </h1>

        <div className="w-12 my-8" style={{ height: '1px', background: s.divider }} />

        <p
          className="text-center max-w-sm"
          style={{
            color: s.muted,
            fontSize: 'clamp(0.7rem, 1.2vw, 0.8125rem)',
            fontWeight: 300,
            letterSpacing: '0.08em',
            lineHeight: 1.7,
          }}
        >
          New Silk Road Capital Holdings<br />
          <span style={{ color: s.sage, fontWeight: 400 }}>by Silk Road Siblings</span>
        </p>

        {/* Action Buttons in exact original minimalist style */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
          <button
            onClick={() => navigate('about')}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full sm:w-auto cursor-pointer transition-all duration-300"
            style={{
              padding: '0.7rem 1.75rem',
              border: `1px solid ${hovered ? s.text : s.muted}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.text,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
              boxShadow: hovered ? btnGlow : 'none',
            }}
          >
            About NSRC
          </button>

          <a
            href="http://compounders.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto cursor-pointer transition-all duration-300 text-center inline-flex items-center justify-center gap-1.5"
            style={{
              padding: '0.7rem 1.75rem',
              border: `1px solid ${s.divider}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.muted,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = s.text
              e.currentTarget.style.borderColor = s.muted
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = s.muted
              e.currentTarget.style.borderColor = s.divider
            }}
          >
            <span>Insights</span>
            <ArrowUpRight size={12} className="opacity-70" />
          </a>
        </div>

        <div className="mt-8 flex items-center gap-2">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ background: s.sage, animation: 'pulse 2.5s ease-in-out infinite' }}
          />
          <span
            className="uppercase"
            style={{ color: s.faint, fontSize: '0.625rem', letterSpacing: '0.2em', fontWeight: 400 }}
          >
            Rome &bull; Singapore &bull; Jakarta &bull; Helsinki &bull; Tokyo
          </span>
        </div>
      </div>

      <div className="absolute bottom-6" style={{ zIndex: 2 }}>
        <span style={{ color: s.ghost, fontSize: '0.5rem', letterSpacing: '0.15em', fontWeight: 300 }}>&reg;</span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  )
}

/* ───────────────────────── ABOUT (REPLACING WHITE PAPER) ───────────────────────── */

const ABOUT_TOC = [
  { id: 'invisible-compounders', label: 'The Invisible Compounders' },
  { id: 'to-the-companies', label: '1. To the Companies (The IR Sherpa & Storytelling Service)' },
  { id: 'to-capital-providers', label: '2. To the Capital Providers (Research & Education)' },
  { id: 'alignment-engine', label: '3. The Alignment Engine (Skin in the Game)' },
  { id: 'meticulous-curation', label: '4. Meticulous Curation' },
  { id: 'the-partners', label: 'The Partners — Silk Road Siblings' },
  { id: 'architecture-flowchart', label: 'Architecture & Capital Flow Model (Flowchart)' },
  { id: 'partner-bios', label: 'About the Partners (Biographies)' },
]

function AboutView() {
  const { theme } = useTheme()
  const { navigate } = useNav()
  const [ready, setReady] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const s = v(theme)

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
    const timer = setTimeout(() => setReady(true), 50)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`min-h-screen relative transition-colors duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}
      style={{ transitionProperty: 'opacity, background-color, color', background: s.bg, color: s.text }}
    >
      <NordicForest color={s.forestAbout} />
      <Grain />

      {/* Header */}
      <header className="pt-24 pb-8 sm:pt-32 sm:pb-12 md:pt-36 md:pb-16 px-4 sm:px-6 md:px-12 max-w-3xl mx-auto text-center">
        <p
          className="uppercase mb-6 sm:mb-8"
          style={{ color: s.sage, fontSize: '0.625rem', letterSpacing: '0.3em', fontWeight: 600 }}
        >
          New Silk Road Capital Advisory Services
        </p>

        <h1 style={{ fontSize: 'clamp(1.75rem, 6vw, 3.25rem)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          NSRC Holdings
        </h1>

        <p
          className="mt-2 text-xs sm:text-sm uppercase tracking-[0.2em] font-light"
          style={{ color: s.muted }}
        >
          By Silk Road Siblings
        </p>

        <p
          className="mt-4 sm:mt-5 max-w-lg mx-auto px-2"
          style={{ color: s.muted, fontSize: 'clamp(0.8125rem, 2vw, 1rem)', fontWeight: 300, letterSpacing: '0.01em', lineHeight: 1.65 }}
        >
          Connecting small and mid-cap &ldquo;Mini-Berkshire&rdquo; compounders in East Asia and Nordics/Europe with global capital through deep analytical rigor and narrative conviction.
        </p>

        {/* Partners Portraits & Contacts */}
        <div
          className="flex items-center justify-center gap-5 sm:gap-8 mt-8 sm:mt-10 flex-wrap"
          style={{ fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.03em', lineHeight: 1.6, color: s.text }}
        >
          {/* Sagar Tandon */}
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/aistudio/ST_-_Black_Japan_6033a488.png"
              alt="Sagar Tandon"
              className="w-8 h-8 rounded-full object-cover ring-1 shadow-sm"
              style={{ borderColor: s.divider }}
            />
            <div className="text-left">
              <span className="whitespace-nowrap font-medium block">Sagar Tandon</span>
              <a
                href="mailto:sagar@firstfollowers.co"
                className="text-[11px] block transition-opacity hover:opacity-80 underline decoration-dotted"
                style={{ color: s.muted }}
              >
                sagar@firstfollowers.co
              </a>
            </div>
          </div>

          <span style={{ color: s.ghost }}>&bull;</span>

          {/* Patricia Sosrodjojo */}
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/aistudio/image-33_f2e957ce.png"
              alt="Patricia Sosrodjojo"
              className="w-8 h-8 rounded-full object-cover ring-1 shadow-sm"
              style={{ borderColor: s.divider }}
            />
            <div className="text-left">
              <span className="whitespace-nowrap font-medium block">Patricia Sosrodjojo</span>
              <a
                href="mailto:patricia.sosrodjojo@gmail.com"
                className="text-[11px] block transition-opacity hover:opacity-80 underline decoration-dotted"
                style={{ color: s.muted }}
              >
                patricia.sosrodjojo@gmail.com
              </a>
            </div>
          </div>
        </div>

        <p className="mt-3 uppercase" style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300, letterSpacing: '0.12em' }}>
          Rome &bull; Singapore &bull; Jakarta &bull; Helsinki &bull; Tokyo
        </p>

        {/* Action Button Bar */}
        <div className="mt-7 flex items-center justify-center gap-3 sm:gap-4 flex-wrap no-print">
          <a
            href="http://compounders.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded transition-all duration-300"
            style={{
              background: 'transparent',
              color: s.muted,
              border: `1px solid ${s.divider}`,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = s.text
              e.currentTarget.style.color = s.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = s.divider
              e.currentTarget.style.color = s.muted
            }}
          >
            <span>Explore Insights (compounders.cc)</span>
            <ArrowUpRight size={12} className="opacity-70" />
          </a>
        </div>
      </header>

      {/* Table of Contents */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 mb-12 sm:mb-16">
        <div style={{ borderTop: `1px solid ${s.divider}`, borderBottom: `1px solid ${s.divider}` }} className="py-6 sm:py-8">
          <p className="uppercase mb-4 sm:mb-5" style={{ color: s.sage, fontSize: '0.625rem', letterSpacing: '0.2em', fontWeight: 600 }}>
            Index
          </p>
          <ol className="space-y-2 sm:space-y-3">
            {ABOUT_TOC.map((item, i) => (
              <li key={item.id}>
                <button
                  onClick={e => {
                    e.preventDefault()
                    scrollTo(item.id)
                  }}
                  className="transition-colors duration-300 cursor-pointer text-left w-full py-1.5 px-1 rounded sm:rounded-none"
                  style={{
                    color: s.muted,
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    letterSpacing: '0.02em',
                    lineHeight: 1.5,
                    background: 'none',
                    border: 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = s.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = s.muted)}
                >
                  <span style={{ color: s.sage, marginRight: '0.75rem', fontSize: '0.75rem' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Body Content */}
      <article
        className="max-w-2xl mx-auto px-4 sm:px-6 md:px-12 pb-24 sm:pb-32"
        style={{
          fontSize: 'clamp(0.9375rem, 2.2vw, 1.0625rem)',
          fontWeight: 300,
          lineHeight: 1.85,
          color: s.text,
        }}
      >
        {/* The Invisible Compounders */}
        <WPSection id="invisible-compounders" title="The Invisible Compounders">
          <p>
            Sometimes great companies are often invisible to the capital that needs them the most. Small and mid-cap &ldquo;Mini-Berkshire&rdquo; compounders in East Asia and Nordics/Europe build incredible capital allocation machines, but they lack the IR infrastructure, the language skills, and the network to attract global institutional capital.
          </p>
          <p>
            These regions&mdash;the Nordics, Canada, and East Asia (Japan, Taiwan, South Korea)&mdash;are home to societies that prioritize long-term stewardship over quarterly results, and where the real economy of manufacturing, infrastructure, and technology innovation remains the bedrock of prosperity.
          </p>
          <p>
            Conversely, global capital providers&mdash;family offices and corporate treasuries&mdash;are desperate for uncorrelated, high-quality yield, but they don&rsquo;t know how to find or evaluate these hidden gems.
          </p>
          <blockquote className="my-6 pl-5 italic" style={{ borderLeft: `1px solid ${s.sage}`, color: s.muted }}>
            <p>
              <strong>New Silk Road Capital Advisory Services (NSRC Holdings)</strong> sits in the middle, connecting these two worlds through a specialized, two-sided advisory service. We combine deep analytical rigor with compelling storytelling to make these companies visible, investable, and easy to understand.
            </p>
          </blockquote>
        </WPSection>

        {/* 1. To the Companies */}
        <WPSection id="to-the-companies" title="1. To the Companies (The IR Sherpa & Storytelling Service)">
          <p>
            We partner with publicly listed serial <span className="font-normal" style={{ color: s.text }}>acquirers / compounders / mini-berkshires</span> in East Asia and Europe. We act as their outsourced, cross-border IR department.
          </p>
          <p>
            We don&rsquo;t just translate documents; we architect their narrative. We combine deep investment research with storytelling to translate their decentralized capital allocation model into a rigorous, compelling equity story.
          </p>
          <p>
            We provide introductions to institutional capital and help architect paths to dual listings (e.g., bringing a Japanese micro-cap to a Nordic exchange or a European compounder to Asian investors).
          </p>
        </WPSection>

        {/* 2. To the Capital Providers */}
        <WPSection id="to-capital-providers" title="2. To the Capital Providers (Research & Education)">
          <p>
            We act as the trusted filter for family offices, institutions, and corporate treasuries. We provide detailed research memos and deep-dive analysis.
          </p>
          <p>
            Crucially, we don&rsquo;t just send them data; we combine analytical rigor with narrative context so they truly understand the machine they are investing in.
          </p>
          <p>
            We also run educational workshops on the Capital Allocation Platform model, teaching allocators how to evaluate these unique businesses.
          </p>
        </WPSection>

        {/* 3. The Alignment Engine */}
        <WPSection id="alignment-engine" title="3. The Alignment Engine (Skin in the Game)">
          <p>
            We do not operate like a traditional investment bank that takes a fee and walks away. We align our incentives by investing a significant portion of our advisory fees and service revenue directly into our partner companies&rsquo; stock.
          </p>
          <p style={{ fontWeight: 400 }}>
            We literally turn our fees into equity.
          </p>
          <p>
            We are not just advisors; we are permanent shareholders who compound alongside the companies we represent. We only win if they compound.
          </p>
        </WPSection>

        {/* 4. Meticulous Curation */}
        <WPSection id="meticulous-curation" title="4. Meticulous Curation">
          <p>
            We are incredibly selective. We do not take on every company that knocks on our door.
          </p>
          <p>
            We only partner with businesses that pass our strict internal tests for durable capital allocation, frugality, and long-term compounding. If we don&rsquo;t believe in the machine enough to invest our own money in it, we won&rsquo;t represent them.
          </p>
        </WPSection>

        {/* The Partners */}
        <WPSection id="the-partners" title="The Partners — Silk Road Siblings">
          <p>
            Patricia Sosrodjojo and Sagar Tandon lead the firm together, combining Investor Relations expertise with Investment Research. We do not operate in silos&mdash;we both contribute to the analytical rigor and the storytelling, ensuring every partner company is presented with clarity, depth, and conviction.
          </p>
        </WPSection>

        {/* Flowchart Section */}
        <WPSection id="architecture-flowchart" title="Architecture & Capital Flow Model">
          <div className="relative group cursor-pointer" onClick={() => setLightboxOpen(true)}>
            <WPChart src="/charts/nsrc-holdings-flowchart.png" alt="NSRC Holdings Platform Architecture Flowchart" />
            <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[11px] inline-flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn size={12} />
              <span>Expand diagram</span>
            </div>
          </div>
          <figcaption className="text-center text-xs mt-2 italic" style={{ color: s.muted }}>
            NSRC Holdings Two-Sided Platform Architecture: Connecting serial acquirers in East Asia &amp; Europe with Global Family Offices and Treasuries.
          </figcaption>
        </WPSection>

        {/* Partner Biographies */}
        <section id="partner-bios" className="mb-14 sm:mb-20 md:mb-24" style={{ scrollMarginTop: '5rem' }}>
          <h2
            className="mb-6 sm:mb-8"
            style={{ fontSize: 'clamp(1.125rem, 4vw, 1.375rem)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.35 }}
          >
            About the Partners
          </h2>

          <div className="space-y-6 sm:space-y-8">
            {/* Sagar Tandon */}
            <div
              className="p-6 sm:p-7 rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${s.divider}`,
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
              }}
            >
              <div className="flex items-center gap-4 sm:gap-5 mb-4">
                <img
                  src="/assets/aistudio/ST_-_Black_Japan_6033a488.png"
                  alt="Sagar Tandon"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 shadow-md ring-2"
                  style={{ borderColor: s.divider }}
                />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl leading-tight" style={{ color: s.text }}>
                    Sagar Tandon
                  </h3>
                  <a
                    href="mailto:sagar@firstfollowers.co"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm transition-colors hover:underline"
                    style={{ color: s.muted }}
                  >
                    <Mail size={13} className="opacity-70 flex-shrink-0" />
                    <span>sagar@firstfollowers.co</span>
                  </a>
                </div>
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: s.muted }}>
                Sagar Tandon is a capital allocator and investor with over a decade of experience in venture building, governance, and cross-border capital. He has evaluated nearly 100 listed serial acquirers globally and invested in 18 across Japan, Canada, Sweden, and Finland, publishing extensive research on the Capital Allocation Platform model (threadsunite.xyz and compounders.cc). A close observer of the Finnish market, he is dedicated to seeing a Finnish serial acquirer reach the heights of its Swedish, Japanese, and Canadian peers. Beyond his research, he co-founded an edtech venture, helped establish an Australian Government-backed fund, served as an Investor-in-Residence at MIT D-Lab, and is a Partner at Beyond Impact VC, where he leads due diligence and sits on three portfolio boards. He also advises 2X Global and the EIT Community New European Bauhaus Advisory Board.
              </p>
            </div>

            {/* Patricia Sosrodjojo */}
            <div
              className="p-6 sm:p-7 rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${s.divider}`,
                background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
              }}
            >
              <div className="flex items-center gap-4 sm:gap-5 mb-4">
                <img
                  src="/assets/aistudio/image-33_f2e957ce.png"
                  alt="Patricia Sosrodjojo"
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 shadow-md ring-2"
                  style={{ borderColor: s.divider }}
                />
                <div>
                  <h3 className="font-semibold text-lg sm:text-xl leading-tight" style={{ color: s.text }}>
                    Patricia Sosrodjojo
                  </h3>
                  <a
                    href="mailto:patricia.sosrodjojo@gmail.com"
                    className="inline-flex items-center gap-1.5 mt-1.5 text-xs sm:text-sm transition-colors hover:underline"
                    style={{ color: s.muted }}
                  >
                    <Mail size={13} className="opacity-70 flex-shrink-0" />
                    <span>patricia.sosrodjojo@gmail.com</span>
                  </a>
                </div>
              </div>
              <p className="text-sm sm:text-[15px] leading-relaxed" style={{ color: s.muted }}>
                Investor and board leader with 15+ years in private equity and venture capital across emerging markets. Deployed $350 million across Africa, Asia, and Latin America in food systems, climate adaptation, and financial inclusion. Raised $800 million across three funds from DFIs, foundations, family offices, and asset managers.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Back & Navigation Buttons */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
          <button
            onClick={() => navigate('landing')}
            className="w-full sm:w-auto cursor-pointer transition-all duration-300"
            style={{
              padding: '0.7rem 2rem',
              border: `1px solid ${s.muted}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.text,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = s.text)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = s.muted)}
          >
            &larr; Back to Home
          </button>
          <a
            href="http://compounders.cc/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto cursor-pointer transition-all duration-300 text-center inline-flex items-center justify-center gap-1.5"
            style={{
              padding: '0.7rem 2rem',
              border: `1px solid ${s.divider}`,
              borderRadius: '2px',
              background: 'transparent',
              color: s.muted,
              fontSize: '0.6875rem',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase' as const,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = s.text
              e.currentTarget.style.color = s.text
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = s.divider
              e.currentTarget.style.color = s.muted
            }}
          >
            <span>Explore Insights &rarr;</span>
          </a>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8" style={{ borderTop: `1px solid ${s.divider}` }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p style={{ color: s.text, fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em' }}>
                NSRC Holdings
              </p>
              <p style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300 }}>
                New Silk Road Capital Advisory Services
              </p>
              <p className="uppercase mt-0.5" style={{ color: s.faint, fontSize: '0.625rem', fontWeight: 300, letterSpacing: '0.1em' }}>
                Rome &bull; Singapore &bull; Jakarta &bull; Helsinki &bull; Tokyo
              </p>
            </div>
            <p style={{ color: s.faint, fontSize: '0.6875rem', fontWeight: 300, letterSpacing: '0.04em' }}>
              By Silk Road Siblings &bull; Patricia Sosrodjojo &amp; Sagar Tandon
            </p>
          </div>
        </footer>
      </article>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[92vh] overflow-auto rounded-lg border border-white/20 p-2 sm:p-4 bg-zinc-950"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-white/10 mb-3">
              <div>
                <h3 className="text-white text-sm font-semibold">NSRC Holdings — Platform Architecture</h3>
                <p className="text-zinc-400 text-xs">Two-Sided Cross-Border Capital Allocation Platform</p>
              </div>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 cursor-pointer"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex justify-center p-1">
              <img
                src="/charts/nsrc-holdings-flowchart.png"
                alt="NSRC Holdings Flowchart"
                className="w-full h-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ───────────────────────── WHITE PAPER / ABOUT COMPONENTS ───────────────────────── */

function WPChart({ src, alt }: { src: string; alt: string }) {
  const { theme } = useTheme()
  const s = v(theme)
  return (
    <figure className="wp-chart-container my-8 sm:my-10 -mx-2 sm:-mx-4 md:-mx-6">
      <img
        src={src}
        alt={alt}
        className="w-full rounded"
        style={{ border: `1px solid ${s.divider}` }}
        loading="lazy"
      />
    </figure>
  )
}

function WPSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12 sm:mb-16 md:mb-20" style={{ scrollMarginTop: '5rem' }}>
      <h2
        className="mb-6 sm:mb-8"
        style={{ fontSize: 'clamp(1.125rem, 4vw, 1.375rem)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.35 }}
      >
        {title}
      </h2>
      <div className="space-y-4 sm:space-y-5">{children}</div>
    </section>
  )
}

/* ───────────────────────── ROUTER ───────────────────────── */

function getInitialView(): View {
  if (typeof window === 'undefined') return 'landing'
  const path = window.location.pathname.toLowerCase()
  const hash = window.location.hash.toLowerCase()
  if (path.includes('/about') || hash === '#about' || path.includes('/white-paper') || hash === '#white-paper') return 'about'
  return 'landing'
}

export default function Home() {
  const [view, setView] = useState<View>(getInitialView)

  const navigate = useCallback((to: View) => {
    setView(to)
    if (typeof window !== 'undefined') {
      if (to === 'about') {
        window.history.pushState({}, '', '/#about')
      } else {
        window.history.pushState({}, '', '/')
      }
      window.scrollTo(0, 0)
    }
  }, [])

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase()
      const hash = window.location.hash.toLowerCase()
      if (path.includes('/about') || hash === '#about' || path.includes('/white-paper') || hash === '#white-paper') {
        setView('about')
      } else {
        setView('landing')
      }
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
    }
  }, [])

  return (
    <ThemeProvider>
      <NavCtx.Provider value={{ view, navigate }}>
        <TopNav />
        <ThemeToggle />
        {view === 'about' && <AboutView />}
        {view === 'landing' && <HomeHero />}
      </NavCtx.Provider>
    </ThemeProvider>
  )
}
