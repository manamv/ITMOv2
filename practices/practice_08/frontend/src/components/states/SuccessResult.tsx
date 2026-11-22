import React, { useState } from 'react'
import { Trophy, ArrowRight, RotateCcw, AlertTriangle, CheckCircle2, Bot, Zap } from 'lucide-react'
import type { SessionStats } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { weakKeysService } from '../../services/weakKeys'

export interface SuccessResultProps {
  stats: SessionStats
  onRepeat: () => void
  onNext: () => Promise<void> | void
  onOpenLeaderboard?: () => void
  onStartErrorSprint?: (weakKeys: string[], weakBigrams: string[]) => void
}

export const SuccessResult: React.FC<SuccessResultProps> = ({
  stats,
  onRepeat,
  onNext,
  onOpenLeaderboard,
  onStartErrorSprint
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const weakBigrams = weakKeysService.getWeakBigrams(4)
  const sessionWeakKeys = stats.weakKeys || []

  // Build smart AI coaching feedback from session metrics + bigrams
  const getAiCoachAdvice = (): string => {
    if (stats.errors === 0 && stats.wpm >= 70) {
      return 'Безупречный ритм и точность! Ваши пальцы уверенно держат домашний ряд. Попробуйте уровень C1 или режим скрытого текста (диктант на слух) для следующего скачка.'
    }
    if (weakBigrams.length > 0) {
      const top = weakBigrams[0].bigram.toUpperCase()
      return `AI зафиксировал частые сбои на сочетании «${top}» (${weakBigrams[0].errors} ош.). Рекомендуем 60-секундный спринт на это сочетание в спокойном темпе, чтобы закрепить мышечную память перехода.`
    }
    if (stats.accuracy < 94) {
      return 'Сейчас скорость опережает точность. Сбавьте темп на 10–15% на следующем уроке — ровная печать без исправлений даст больший итоговый WPM.'
    }
    if (sessionWeakKeys.length > 0) {
      const letters = sessionWeakKeys.slice(0, 3).map(k => k.toUpperCase()).join(', ')
      return `Хороший темп! Точечные промахи пришлись на клавиши [${letters}]. Короткий целевой спринт уберёт эти микро-паузы.`
    }
    return 'Стабильный результат! Продолжайте ежедневные 5-минутные сессии — мышечная память закрепляется быстрее всего при регулярном ритме.'
  }

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
      className="max-w-2xl mx-auto space-y-5 animate-fade-in my-6"
      data-testid="success-result"
    >
      {/* Trophy & Congrats Header */}
      <div className="text-center">
        <div className="inline-flex p-3 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 mb-3 shadow-xl shadow-sky-500/15">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-1">Отличная работа!</h2>
        <p className="text-xs text-slate-400">
          Упражнение завершено. Результаты сохранены в график прогресса.
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

      {/* Smart AI Error Analysis & Bigrams Breakdown */}
      <Card
        className="bg-gradient-to-br from-[#090d16] via-[#0a1020] to-[#090d16] border border-sky-400/20 shadow-2xl shadow-black/80 space-y-3"
        data-testid="ai-error-analysis"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <div className="w-7 h-7 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Bot className="w-4 h-4" />
            </div>
            <span>AI-разбор ошибок и рекомендации</span>
          </div>
          {onStartErrorSprint && (sessionWeakKeys.length > 0 || weakBigrams.length > 0) && (
            <button
              onClick={() =>
                onStartErrorSprint(
                  sessionWeakKeys,
                  weakBigrams.map(b => b.bigram)
                )
              }
              className="px-3 py-1.5 rounded-xl bg-sky-400/15 hover:bg-sky-400/25 text-sky-300 border border-sky-400/35 text-[11px] font-mono font-semibold transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              data-testid="start-error-sprint-btn"
            >
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>Мини-спринт на мои ошибки</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{getAiCoachAdvice()}</p>

        {/* Weak Keys & Bigrams Pills */}
        {(sessionWeakKeys.length > 0 || weakBigrams.length > 0) ? (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
            {sessionWeakKeys.length > 0 && (
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[11px] text-slate-400">Клавиши:</span>
                {sessionWeakKeys.slice(0, 5).map(k => (
                  <span
                    key={k}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 font-mono font-bold text-[11px]"
                  >
                    {k.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {weakBigrams.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Биграммы:</span>
                {weakBigrams.map(b => (
                  <span
                    key={b.bigram}
                    className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-400/25 text-amber-300 font-mono font-bold text-[11px]"
                  >
                    {b.bigram.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1 border-t border-white/[0.06]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Идеальный набор! Ни одной проблемной клавиши не выявлено.</span>
          </div>
        )}
      </Card>

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
