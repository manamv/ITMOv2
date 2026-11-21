import React, { useState } from 'react'
import { Sparkles, ArrowRight, Zap, Target } from 'lucide-react'
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
  const levels = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1']

  const weakKeys = weakKeysService.getWeakKeys()

  const filtered = selectedLevel === 'ALL'
    ? topics
    : topics.filter(t => t.level.toUpperCase() === selectedLevel)

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-fade-in" data-testid="topic-selector">
      {/* Hero Headline */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Интеллектуальный тренажер слепой печати
        </h1>
        <p className="text-slate-400 text-xs leading-relaxed">
          Прокачивайте скорость слепой печати десятипальцевым методом, параллельно доводя до автоматизма грамматику английского языка.
        </p>
      </div>

      {/* Level Filter Pills */}
      <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Фильтр по уровню языка">
        {levels.map(level => {
          const isCurrent = selectedLevel === level
          return (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isCurrent
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {level === 'ALL' ? 'Все уровни' : `${level}`}
            </button>
          )
        })}
      </div>

      {/* Recommended Adaptive Card (Weak Keys) */}
      <Card variant="active" className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <Badge variant="cyan">Адаптивный алгоритм</Badge>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Персональная подборка
              </span>
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
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
            className="flex flex-col justify-between group"
            data-testid={`topic-card-${topic.id}`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Badge variant={topic.level === 'A1' ? 'emerald' : topic.level === 'B1' ? 'cyan' : 'purple'}>
                  {topic.level}
                </Badge>
                <span className="text-slate-500 font-mono text-[11px]">
                  {topic.sentenceCount} предложений
                </span>
              </div>
              <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
              <span>Начать тренировку</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
