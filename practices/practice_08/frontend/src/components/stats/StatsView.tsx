import React from 'react'
import { BarChart3, Target, Award, AlertTriangle, RotateCcw } from 'lucide-react'
import type { UserStatsSummary } from '../../types'
import { Card } from '../ui/Card'
import { VirtualKeyboard } from '../keyboard/VirtualKeyboard'
import { weakKeysService } from '../../services/weakKeys'

interface StatsViewProps {
  summary: UserStatsSummary
  onResetStats?: () => void
}

export const StatsView: React.FC<StatsViewProps> = ({
  summary,
  onResetStats
}) => {
  const heatmap = weakKeysService.getKeyHeatmap()
  const weakKeys = weakKeysService.getWeakKeys()

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full animate-fade-in" data-testid="stats-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            Аналитика и тепловая карта
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Метрики скорости слепой печати и персональная карта точности нажатия клавиш.
          </p>
        </div>

        {onResetStats && (
          <button
            onClick={() => {
              weakKeysService.clear()
              onResetStats()
            }}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.16] transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить историю</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4 bg-[#090d16]/90 border border-white/[0.08]">
          <div className="text-[11px] text-slate-500 font-medium mb-1">СРЕДНЯЯ СКОРОСТЬ</div>
          <div className="text-3xl font-extrabold text-sky-400 font-mono" data-testid="stat-avg-wpm">
            {summary.avgWpm} <span className="text-xs font-normal text-slate-400">WPM</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">слов в минуту</div>
        </Card>

        <Card className="text-center p-4 bg-[#090d16]/90 border border-white/[0.08]">
          <div className="text-[11px] text-slate-500 font-medium mb-1">ТОЧНОСТЬ</div>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono" data-testid="stat-avg-acc">
            {summary.avgAccuracy}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">без опечаток</div>
        </Card>

        <Card className="text-center p-4 bg-[#090d16]/90 border border-white/[0.08]">
          <div className="text-[11px] text-slate-500 font-medium mb-1">СЕССИЙ ПРОЙДЕНО</div>
          <div className="text-3xl font-extrabold text-white font-mono" data-testid="stat-total-sessions">
            {summary.totalSessions}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">тренировок</div>
        </Card>

        <Card className="text-center p-4 bg-[#090d16]/90 border border-white/[0.08]">
          <div className="text-[11px] text-slate-500 font-medium mb-1">ВСЕГО ОШИБОК</div>
          <div className="text-3xl font-extrabold text-rose-400 font-mono" data-testid="stat-total-errors">
            {summary.totalErrors}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">исправлено</div>
        </Card>
      </div>

      {/* Weak Keys Alert */}
      <Card className="bg-[#090d16]/90 border border-white/[0.08] space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Проблемные клавиши (ошибки &gt; 12%)
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {weakKeys.length} клавиш требуют внимания
          </span>
        </div>

        {weakKeys.length === 0 ? (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 py-1">
            <Award className="w-4 h-4" />
            <span>Превосходно! В последних тренировках у вас нет критических зон опечаток.</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {weakKeys.map(k => (
              <div
                key={k}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold flex items-center gap-2"
              >
                <span>{k.toUpperCase()}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  (ошибки ~{Math.round((heatmap[k] || 0.15) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Heatmap Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            Тепловая карта клавиатуры (Heatmap)
          </h3>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40"></span> Отлично (&lt;10%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60"></span> Внимание (10-25%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span> Проблемы (&gt;25%)
            </span>
          </div>
        </div>

        <VirtualKeyboard
          heatmapMode={true}
          heatmapData={heatmap}
        />
      </div>
    </div>
  )
}
