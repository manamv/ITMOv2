import React, { useState, useMemo } from 'react'
import {
  Sparkles,
  ArrowRight,
  Zap,
  Target,
  Search,
  X,
  Shuffle,
  Music,
  TrendingUp,
  Clock,
  LayoutGrid,
  List
} from 'lucide-react'
import type { GrammarTopic, UserStatsSummary } from '../../types'
import { Badge } from '../ui/Badge'
import { weakKeysService } from '../../services/weakKeys'

interface TopicSelectorProps {
  topics: GrammarTopic[]
  onSelectTopic: (topicId: string) => void
  onSelectAdaptive: (weakKeys: string[]) => void
  statsSummary?: UserStatsSummary
  onOpenMusic?: () => void
}

const LEVEL_META: Record<
  string,
  {
    label: string
    subtitle: string
    dotClass: string
    badgeVariant: 'sky' | 'cyan' | 'purple'
  }
> = {
  A1: {
    label: 'A1 • Foundation',
    subtitle: 'Базовые конструкции и повседневный английский',
    dotClass: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',
    badgeVariant: 'sky'
  },
  A2: {
    label: 'A2 • Elementary',
    subtitle: 'События в прошлом, предлоги времени и места',
    dotClass: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    badgeVariant: 'cyan'
  },
  B1: {
    label: 'B1 • Intermediate',
    subtitle: 'Времена, пассивный залог, герундий и косвенная речь',
    dotClass: 'bg-blue-400 shadow-[0_0_8px_#60a5fa]',
    badgeVariant: 'sky'
  },
  B2: {
    label: 'B2 • Upper-Intermediate',
    subtitle: 'Условные предложения, фразовые глаголы и модальность',
    dotClass: 'bg-indigo-400 shadow-[0_0_8px_#818cf8]',
    badgeVariant: 'purple'
  },
  C1: {
    label: 'C1 • Advanced',
    subtitle: 'Инверсия, смешанные условные и академический акцент',
    dotClass: 'bg-violet-400 shadow-[0_0_8px_#a78bfa]',
    badgeVariant: 'purple'
  }
}

const LEVEL_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1'] as const

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  onSelectTopic,
  onSelectAdaptive,
  statsSummary,
  onOpenMusic
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid')
  const levels = ['ALL', ...LEVEL_ORDER]

  const weakKeys = weakKeysService.getWeakKeys()
  const displayKeys = weakKeys.length > 0 ? weakKeys.slice(0, 4) : ['r', 't', 'p']
  const history = weakKeysService.getSessionHistory()

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return topics.filter(t => {
      const matchesLevel = selectedLevel === 'ALL' || t.level.toUpperCase() === selectedLevel
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.level.toLowerCase().includes(q)
      return matchesLevel && matchesQuery
    })
  }, [topics, selectedLevel, searchQuery])

  // Group filtered topics by CEFR level for structured curriculum tracks
  const groupedByLevel = useMemo(() => {
    const groups: Array<{ level: string; items: GrammarTopic[] }> = []
    for (const lvl of LEVEL_ORDER) {
      const items = filtered.filter(t => t.level.toUpperCase() === lvl)
      if (items.length > 0) {
        groups.push({ level: lvl, items })
      }
    }
    // Include any non-standard level if present
    const other = filtered.filter(t => !LEVEL_ORDER.includes(t.level.toUpperCase() as typeof LEVEL_ORDER[number]))
    if (other.length > 0) {
      groups.push({ level: 'OTHER', items: other })
    }
    return groups
  }, [filtered])

  // Build mini SVG sparkline points from recent WPM history
  const sparklinePath = useMemo(() => {
    const pts = history.slice(-7)
    if (pts.length < 2) return ''
    const w = 130
    const h = 34
    const vals = pts.map(p => p.wpm)
    const min = Math.min(...vals) - 4
    const max = Math.max(...vals) + 4
    const rng = Math.max(1, max - min)
    return pts
      .map((p, idx) => {
        const x = (idx / (pts.length - 1)) * w
        const y = h - ((p.wpm - min) / rng) * h
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [history])

  const handleRandomTopic = () => {
    const pool = filtered.length > 0 ? filtered : topics
    if (pool.length === 0) return
    const pick = pool[Math.floor(Math.random() * pool.length)]
    onSelectTopic(pick.id)
  }

  const avgWpm = statsSummary?.avgWpm ?? (history.length > 0 ? history[history.length - 1].wpm : 0)
  const avgAcc = statsSummary?.avgAccuracy ?? (history.length > 0 ? history[history.length - 1].accuracy : 100)
  const totalSessions = statsSummary?.totalSessions ?? history.length

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-fade-in" data-testid="topic-selector">
      {/* 1. BENTO HERO COMMAND DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Hero Quick-Start Bento Tile (7 cols) */}
        <div className="lg:col-span-7 relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_110%_90%_at_0%_0%,rgba(56,189,248,0.16),rgba(9,13,22,0.96)_60%)] border border-white/[0.09] p-6 sm:p-7 flex flex-col justify-between gap-6 shadow-2xl shadow-black/80">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400/50 via-cyan-300/20 to-transparent" />

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/25 text-[11px] font-mono text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>AI Touch-Typing & English Studio</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Прокачивай скорость печати и{' '}
              <span className="bg-gradient-to-r from-sky-300 via-cyan-200 to-indigo-300 bg-clip-text text-transparent">
                грамматику одновременно
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Десятипальцевый метод, живая аналитика слабых клавиш и реальные инженерные предложения уровней A1–C1.
            </p>
          </div>

          {/* Weak Keys Mini Keycaps + Primary CTA Row */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-sky-400" />
                Фокус на клавишах:
              </span>
              <div className="flex items-center gap-1.5">
                {displayKeys.map(k => (
                  <kbd
                    key={k}
                    className="w-6 h-6 rounded-lg bg-[#050810] border border-sky-400/35 text-sky-300 font-mono font-bold text-[11px] flex items-center justify-center shadow-[0_2px_0_rgba(56,189,248,0.2)]"
                  >
                    {k.toUpperCase()}
                  </kbd>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => onSelectAdaptive(displayKeys)}
                className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                data-testid="hero-adaptive-btn"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Запустить адаптивный спринт</span>
              </button>

              <button
                onClick={handleRandomTopic}
                className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/[0.09] font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                data-testid="hero-random-btn"
              >
                <Shuffle className="w-3.5 h-3.5 text-sky-400" />
                <span>Случайная тема</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Stacked Bento Column (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Top Tile: Live Progress & Mini WPM Sparkline */}
          <div className="flex-1 rounded-3xl bg-[#090d16]/90 backdrop-blur-xl border border-white/[0.08] p-5 flex flex-col justify-between gap-3 shadow-2xl shadow-black/70">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                <span>Твоя динамика</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-400">
                {totalSessions} сессий
              </span>
            </div>

            <div className="flex items-end justify-between gap-3">
              <div className="flex items-baseline gap-4 font-mono">
                <div>
                  <div className="text-2xl font-black text-white leading-none">
                    {avgWpm}
                    <span className="text-[11px] font-normal text-sky-400 ml-1">WPM</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">средняя скорость</div>
                </div>
                <div className="pl-3 border-l border-white/[0.07]">
                  <div className="text-xl font-bold text-indigo-300 leading-none">{avgAcc}%</div>
                  <div className="text-[10px] text-slate-500 mt-1">точность</div>
                </div>
              </div>

              {sparklinePath && (
                <svg viewBox="0 0 130 38" className="w-28 h-9 overflow-visible shrink-0" aria-hidden="true">
                  <path
                    d={sparklinePath}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>

          {/* Bottom Tile: Karaoke & Songs Quick Jump */}
          <button
            onClick={onOpenMusic}
            disabled={!onOpenMusic}
            className="rounded-3xl bg-[radial-gradient(ellipse_80%_90%_at_100%_0%,rgba(99,102,241,0.18),rgba(9,13,22,0.92)_65%)] border border-white/[0.08] hover:border-sky-400/40 p-5 text-left transition-all group cursor-pointer shadow-xl shadow-black/70 active:scale-[0.99] disabled:cursor-default"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 group-hover:scale-105 transition-transform">
                  <Music className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Студийное караоке</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                      New
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Queen, Coldplay & Beatles с разбором смысла от AI
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          </button>
        </div>
      </div>

      {/* 2. CURRICULUM FILTER BAR (CEFR TRACKS + SEARCH + VIEW TOGGLE) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-white/[0.06]">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Фильтр по уровню языка">
          {levels.map(level => {
            const isCurrent = selectedLevel === level
            const count =
              level === 'ALL'
                ? topics.length
                : topics.filter(t => t.level.toUpperCase() === level).length
            return (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-white/[0.1] text-white shadow-sm border border-sky-400/40 ring-1 ring-sky-400/20'
                    : 'bg-white/[0.025] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{level === 'ALL' ? 'Все треки' : level}</span>
                <span className="text-[10px] font-mono text-slate-500">{count}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Sleek Search Input */}
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск темы..."
              aria-label="Поиск грамматической темы"
              className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/[0.05] transition"
              data-testid="topic-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white cursor-pointer"
                aria-label="Очистить поиск"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Grid / Compact List Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06]">
            <button
              onClick={() => setViewLayout('grid')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewLayout === 'grid' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Плитки по трекам"
              aria-label="Режим плиток"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewLayout('list')}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                viewLayout === 'list' ? 'bg-white/[0.1] text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Компактный список"
              aria-label="Режим списка"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. STRUCTURED CEFR CURRICULUM TRACKS */}
      {groupedByLevel.length === 0 ? (
        <div className="p-10 rounded-3xl bg-[#090d16]/70 border border-dashed border-white/[0.1] text-center space-y-2">
          <p className="text-sm font-semibold text-white">Ничего не найдено по запросу «{searchQuery}»</p>
          <p className="text-xs text-slate-400">Попробуйте сбросить фильтр уровня или изменить поисковый запрос.</p>
        </div>
      ) : (
        <div className="space-y-7">
          {groupedByLevel.map(({ level, items }) => {
            const meta = LEVEL_META[level] || {
              label: level,
              subtitle: 'Грамматическая практика',
              dotClass: 'bg-sky-400',
              badgeVariant: 'sky' as const
            }

            return (
              <section key={level} className="space-y-3">
                {/* Track Section Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${meta.dotClass}`} />
                    <h2 className="text-sm font-bold text-white tracking-tight">{meta.label}</h2>
                    <span className="text-xs text-slate-500 hidden sm:inline">— {meta.subtitle}</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500">
                    {items.length} {items.length === 1 ? 'урок' : items.length < 5 ? 'урока' : 'уроков'}
                  </span>
                </div>

                {/* Topics in this CEFR Track */}
                {viewLayout === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {items.map(topic => (
                      <div
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.id)}
                        className="group relative p-4 sm:p-5 rounded-2xl bg-[#090d16]/85 hover:bg-white/[0.04] border border-white/[0.07] hover:border-sky-400/35 transition-all cursor-pointer flex items-center justify-between gap-4 shadow-lg shadow-black/50 active:scale-[0.99]"
                        data-testid={`topic-card-${topic.id}`}
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant={meta.badgeVariant}>{topic.level}</Badge>
                            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{Math.max(1, Math.round(topic.sentenceCount * 0.6))} мин • {topic.sentenceCount} предл.
                            </span>
                          </div>
                          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-sky-300 transition truncate">
                            {topic.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-1">
                            {topic.description}
                          </p>
                        </div>

                        <div className="w-9 h-9 rounded-xl bg-white/[0.04] group-hover:bg-sky-400 text-slate-400 group-hover:text-slate-950 border border-white/[0.08] group-hover:border-sky-300 flex items-center justify-center shrink-0 transition-all group-hover:translate-x-0.5 shadow-sm">
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#090d16]/85 border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden shadow-lg shadow-black/50">
                    {items.map(topic => (
                      <div
                        key={topic.id}
                        onClick={() => onSelectTopic(topic.id)}
                        className="group px-4 py-3 hover:bg-white/[0.04] transition cursor-pointer flex items-center justify-between gap-4"
                        data-testid={`topic-card-${topic.id}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant={meta.badgeVariant}>{topic.level}</Badge>
                          <span className="font-semibold text-sm text-white group-hover:text-sky-300 transition truncate">
                            {topic.title}
                          </span>
                          <span className="text-xs text-slate-500 truncate hidden md:inline">
                            {topic.description}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[11px] font-mono text-slate-500">
                            {topic.sentenceCount} предл.
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
