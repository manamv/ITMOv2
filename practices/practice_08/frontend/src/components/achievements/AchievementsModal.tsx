import React, { useState } from 'react'
import { Trophy, X, Lock, CheckCircle2, Rocket, Zap, Flame, Target, Award, Headphones, Music, BookOpen, Star } from 'lucide-react'
import { achievementsService } from '../../services/achievements'

interface AchievementsModalProps {
  isOpen: boolean
  onClose: () => void
}

const ICON_MAP: Record<string, React.ElementType> = {
  Rocket,
  Zap,
  Flame,
  Target,
  Award,
  Headphones,
  Music,
  BookOpen,
  Star,
  Trophy
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'speed' | 'accuracy' | 'grammar' | 'special'>('all')

  if (!isOpen) return null

  const achievements = achievementsService.getAchievements()
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const totalCount = achievements.length
  const percent = Math.round((unlockedCount / totalCount) * 100)

  const filtered = filter === 'all' ? achievements : achievements.filter(a => a.category === filter)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="achievements-modal-title"
      data-testid="achievements-modal"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 id="achievements-modal-title" className="text-lg font-bold text-white flex items-center gap-2">
                Достижения & Награды
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                  {unlockedCount} / {totalCount}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Выполняйте задания, бейте рекорды скорости и совершенствуйте грамматику!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            aria-label="Закрыть достижения"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Общий прогресс разблокировки</span>
            <span className="text-amber-400 font-bold">{percent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          {(
            [
              { id: 'all', label: 'Все награды' },
              { id: 'speed', label: '⚡ Скорость' },
              { id: 'accuracy', label: '🎯 Точность' },
              { id: 'grammar', label: '🦉 Грамматика' },
              { id: 'special', label: '✨ Специальные' }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl border transition cursor-pointer shrink-0 ${
                filter === tab.id
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filtered.map(ach => {
            const IconComponent = ICON_MAP[ach.icon] || Trophy
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                  ach.unlocked
                    ? 'bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/30 shadow-md shadow-amber-500/5'
                    : 'bg-slate-950/60 border-slate-800/60 opacity-60'
                }`}
              >
                {/* Icon Badge */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/20'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                >
                  {ach.unlocked ? (
                    <IconComponent className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>

                {/* Body */}
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-bold ${ach.unlocked ? 'text-white' : 'text-slate-400'}`}>
                      {ach.title}
                    </h3>
                    {ach.unlocked && (
                      <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {ach.unlockedAt || 'Открыто'}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {ach.description}
                  </p>

                  {/* Progress bar if present */}
                  {!ach.unlocked && ach.maxProgress && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Прогресс</span>
                        <span>{ach.progress || 0} / {ach.maxProgress}</span>
                      </div>
                      <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${Math.min(100, (((ach.progress || 0) / ach.maxProgress) * 100))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
