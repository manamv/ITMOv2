import React, { useState } from 'react'
import { Trophy, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { SessionStats } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

export interface SuccessResultProps {
  stats: SessionStats
  onRepeat: () => void
  onNext: () => Promise<void> | void
  onOpenLeaderboard?: () => void
}

export const SuccessResult: React.FC<SuccessResultProps> = ({
  stats,
  onRepeat,
  onNext,
  onOpenLeaderboard
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Double-submit prevention on the action button
  const handleNextClick = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onNext()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div 
      className="max-w-2xl mx-auto space-y-6 animate-fade-in my-8"
      data-testid="success-result"
    >
      {/* Trophy & Congrats Header */}
      <div className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 mb-3 shadow-xl shadow-sky-500/15">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-1">Отличная работа!</h2>
        <p className="text-xs text-slate-400">
          Упражнение завершено. Результаты успешно зафиксированы.
        </p>
      </div>

      {/* Stats Scoreboard */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center p-5 bg-[#090d16]/90 border border-white/[0.08] shadow-2xl shadow-black/80">
          <div className="text-xs text-slate-500 font-medium mb-1">СКОРОСТЬ</div>
          <div className="text-4xl font-extrabold text-sky-400 font-mono" data-testid="result-wpm">
            {stats.wpm} <span className="text-sm font-normal text-slate-400">WPM</span>
          </div>
          <div className="text-[11px] text-sky-400/80 mt-1">слов в минуту</div>
        </Card>

        <Card className="text-center p-5 bg-[#090d16]/90 border border-white/[0.08] shadow-2xl shadow-black/80">
          <div className="text-xs text-slate-500 font-medium mb-1">ТОЧНОСТЬ</div>
          <div className="text-4xl font-extrabold text-indigo-400 font-mono" data-testid="result-accuracy">
            {stats.accuracy}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {stats.errors === 0 ? 'Без единой ошибки!' : `Ошибок: ${stats.errors}`}
          </div>
        </Card>

        <Card className="text-center p-5 bg-[#090d16]/90 border border-white/[0.08] shadow-2xl shadow-black/80">
          <div className="text-xs text-slate-500 font-medium mb-1">ВРЕМЯ</div>
          <div className="text-4xl font-extrabold text-white font-mono" data-testid="result-duration">
            {stats.durationSeconds} <span className="text-sm font-normal text-slate-400">сек</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">длительность</div>
        </Card>
      </div>

      {/* Weak Keys Identified */}
      {stats.weakKeys && stats.weakKeys.length > 0 ? (
        <Card className="bg-[#090d16]/90 border border-white/[0.08] shadow-2xl shadow-black/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Клавиши с опечатками в этой сессии:
            </span>
            <span className="text-slate-400 text-[11px]">добавлено в адаптивный трекер</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {stats.weakKeys.map(k => (
              <span
                key={k}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono font-bold text-xs"
              >
                {k.toUpperCase()}
              </span>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="bg-[#090d16]/90 border border-white/[0.08] shadow-2xl shadow-black/80 flex items-center gap-2 text-xs text-sky-400 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Идеальный набор! Ни одной проблемной клавиши не выявлено.</span>
        </Card>
      )}

      {/* Actions (Double-submit prevented) */}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onRepeat}
          variant="secondary"
          size="lg"
          className="flex-1"
          disabled={isSubmitting}
        >
          <RotateCcw className="w-4 h-4" />
          <span>Повторить урок</span>
        </Button>

        {onOpenLeaderboard && (
          <Button
            onClick={onOpenLeaderboard}
            variant="outline"
            size="lg"
            className="flex-1 text-amber-400 border-amber-500/40 hover:bg-amber-500/10"
            disabled={isSubmitting}
            data-testid="view-leaderboard-btn"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Лидерборд</span>
          </Button>
        )}

        <Button
          onClick={handleNextClick}
          variant="primary"
          size="lg"
          className="flex-1"
          isLoading={isSubmitting}
          disabled={isSubmitting}
          data-testid="next-lesson-btn"
        >
          <span>К выбору уроков</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
