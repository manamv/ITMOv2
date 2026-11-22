import React, { useState, useMemo } from 'react'
import { Sparkles, ArrowRight, Zap, Target, Search, X } from 'lucide-react'
import type { GrammarTopic } from '../../types'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { weakKeysService } from '../../services/weakKeys'

interface TopicSelectorProps {
  topics: GrammarTopic[]
  onSelectTopic: (topicId: string) => void
  onSelectAdaptive: (weakKeys: string[]) => void
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  onSelectTopic,
  onSelectAdaptive
}) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const levels = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1']

  const weakKeys = weakKeysService.getWeakKeys()

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

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-fade-in" data-testid="topic-selector">
      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          Интеллектуальный тренажер слепой печати
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          Прокачивайте скорость слепой печати десятипальцевым методом, параллельно доводя до автоматизма грамматику английского языка.
        </p>
      </div>

      {/* Level Filter Pills + Instant Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap justify-center gap-1.5" role="group" aria-label="Фильтр по уровню языка">
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
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-white/[0.1] text-white shadow-sm border border-sky-400/40 ring-1 ring-sky-400/20'
                    : 'bg-white/[0.03] border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                <span>{level === 'ALL' ? 'Все уровни' : level}</span>
                <span className="text-[10px] font-mono text-slate-500">{count}</span>
              </button>
            )
          })}
        </div>

        {/* Sleek Search Input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Поиск темы..."
            aria-label="Поиск грамматической темы"
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400/50 focus:bg-white/[0.05] transition"
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
      </div>

      {/* Recommended Adaptive Card (Weak Keys) */}
      <Card variant="active" className="relative overflow-hidden bg-[#090d16]/90 border border-white/[0.08]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Badge variant="sky">Адаптивный алгоритм</Badge>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                Персональная подборка
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" />
              Тренировка слабых букв: {weakKeys.length > 0 ? `[${weakKeys.slice(0, 4).map(k => k.toUpperCase()).join(', ')}]` : '[R, T, P]'}
            </h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Система анализирует опечатки ваших предыдущих сессий и генерирует предложения с максимальной концентрацией проблемных клавиш.
            </p>
          </div>
          <Button
            onClick={() => onSelectAdaptive(weakKeys.length > 0 ? weakKeys : ['r', 't', 'p'])}
            className="w-full md:w-auto"
          >
            <span>Запустить адаптивный спринт</span>
            <Zap className="w-4 h-4 fill-current" />
          </Button>
        </div>
      </Card>

      {/* Grammar Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(topic => (
          <Card
            key={topic.id}
            variant="interactive"
            onClick={() => onSelectTopic(topic.id)}
            className="flex flex-col justify-between group hover:border-white/[0.18]"
            data-testid={`topic-card-${topic.id}`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant={topic.level === 'A1' ? 'sky' : topic.level === 'B1' ? 'cyan' : 'purple'}>
                  {topic.level}
                </Badge>
                <span className="text-slate-500 font-mono text-[11px]">
                  {topic.sentenceCount} предложений
                </span>
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between text-xs text-sky-400 font-medium group-hover:translate-x-1 transition-transform">
              <span>Начать тренировку</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
