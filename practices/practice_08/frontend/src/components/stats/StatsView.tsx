import React, { useState } from 'react'
import { BarChart3, Target, Award, AlertTriangle, RotateCcw, TrendingUp, Zap } from 'lucide-react'
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
  const [chartMetric, setChartMetric] = useState<'wpm' | 'accuracy'>('wpm')
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  const heatmap = weakKeysService.getKeyHeatmap()
  const weakKeys = weakKeysService.getWeakKeys()
  const weakBigrams = weakKeysService.getWeakBigrams(6)
  const history = weakKeysService.getSessionHistory()

  // Compute SVG chart geometry (viewBox 640 x 190)
  const chartW = 640
  const chartH = 190
  const padX = 36
  const padTop = 22
  const padBottom = 26
  const plotW = chartW - padX * 2
  const plotH = chartH - padTop - padBottom

  const values = history.map(h => (chartMetric === 'wpm' ? h.wpm : h.accuracy))
  const minVal = chartMetric === 'wpm'
    ? Math.max(0, Math.floor((Math.min(...values, 30) - 10) / 10) * 10)
    : Math.max(70, Math.floor((Math.min(...values, 90) - 5) / 5) * 5)
  const maxVal = chartMetric === 'wpm'
    ? Math.max(60, Math.ceil((Math.max(...values, 60) + 10) / 10) * 10)
    : 100
  const range = Math.max(1, maxVal - minVal)

  const points = history.map((item, idx) => {
    const x = history.length === 1
      ? padX + plotW / 2
      : padX + (idx / (history.length - 1)) * plotW
    const raw = chartMetric === 'wpm' ? item.wpm : item.accuracy
    const y = padTop + plotH - ((raw - minVal) / range) * plotH
    return { x, y, raw, item }
  })

  // Smooth cubic bezier line path
  const linePath = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
    const prev = points[idx - 1]
    const cx = ((prev.x + pt.x) / 2).toFixed(1)
    return `${acc} C ${cx} ${prev.y.toFixed(1)}, ${cx} ${pt.y.toFixed(1)}, ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`
  }, '')

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
    : ''

  const delta = values.length >= 2
    ? Math.round((values[values.length - 1] - values[0]) * 10) / 10
    : 0
  const bestVal = values.length > 0 ? Math.max(...values) : 0

  return (
    <div className="space-y-7 max-w-4xl mx-auto w-full animate-fade-in" data-testid="stats-view">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            Аналитика и тепловая карта
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Динамика скорости слепой печати, проблемные биграммы и персональная карта точности клавиш.
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

      {/* Interactive WPM & Accuracy Progress SVG Chart */}
      <Card className="bg-[#090d16]/90 border border-white/[0.08] space-y-4" data-testid="progress-chart-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>График прогресса по сессиям</span>
                {delta !== 0 && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      delta > 0
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25'
                        : 'bg-rose-500/15 text-rose-300 border-rose-400/25'
                    }`}
                  >
                    {delta > 0 ? '+' : ''}
                    {delta} {chartMetric === 'wpm' ? 'WPM' : '%'}
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                Рекорд: {bestVal} {chartMetric === 'wpm' ? 'WPM' : '%'} • {history.length} сессий
              </p>
            </div>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
            <button
              onClick={() => setChartMetric('wpm')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                chartMetric === 'wpm'
                  ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.1]'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="chart-toggle-wpm"
            >
              <Zap className="w-3 h-3 text-sky-400" />
              <span>WPM</span>
            </button>
            <button
              onClick={() => setChartMetric('accuracy')}
              className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                chartMetric === 'accuracy'
                  ? 'bg-white/[0.1] text-white font-semibold border border-white/[0.1]'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="chart-toggle-accuracy"
            >
              <Target className="w-3 h-3 text-indigo-400" />
              <span>Точность</span>
            </button>
          </div>
        </div>

        {points.length > 0 ? (
          <div className="relative w-full">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto overflow-visible">
              <defs>
                <linearGradient id="progressAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartMetric === 'wpm' ? '#38bdf8' : '#818cf8'}
                    stopOpacity="0.32"
                  />
                  <stop
                    offset="100%"
                    stopColor={chartMetric === 'wpm' ? '#38bdf8' : '#818cf8'}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Horizontal dashed grid lines */}
              {[0, 0.5, 1].map(frac => {
                const y = padTop + plotH * (1 - frac)
                const labelVal = Math.round(minVal + range * frac)
                return (
                  <g key={frac}>
                    <line
                      x1={padX}
                      y1={y}
                      x2={chartW - padX}
                      y2={y}
                      stroke="rgba(255,255,255,0.06)"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padX - 8}
                      y={y + 3}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {labelVal}
                    </text>
                  </g>
                )
              })}

              {/* Area fill */}
              {points.length > 1 && <path d={areaPath} fill="url(#progressAreaGrad)" />}

              {/* Smooth glowing stroke */}
              {points.length > 1 && (
                <path
                  d={linePath}
                  fill="none"
                  stroke={chartMetric === 'wpm' ? '#38bdf8' : '#818cf8'}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive data points */}
              {points.map((pt, idx) => {
                const isHovered = hoveredIdx === idx
                return (
                  <g
                    key={pt.item.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 12 : 8}
                      fill={chartMetric === 'wpm' ? 'rgba(56,189,248,0.18)' : 'rgba(129,140,248,0.18)'}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3.5}
                      fill="#060911"
                      stroke={chartMetric === 'wpm' ? '#38bdf8' : '#818cf8'}
                      strokeWidth="2.2"
                    />
                    <text
                      x={pt.x}
                      y={chartH - 6}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9.5"
                      fontFamily="monospace"
                    >
                      #{idx + 1}
                    </text>
                  </g>
                )
              })}
            </svg>

            {/* Hover Tooltip */}
            {hoveredIdx !== null && points[hoveredIdx] && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-[#050810] border border-white/[0.1] flex flex-wrap items-center justify-between gap-2 text-xs font-mono animate-fade-in">
                <span className="text-slate-300">
                  Сессия #{hoveredIdx + 1}: <strong className="text-white">{points[hoveredIdx].item.topicTitle}</strong>
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-sky-400 font-bold">{points[hoveredIdx].item.wpm} WPM</span>
                  <span className="text-indigo-400 font-bold">{points[hoveredIdx].item.accuracy}%</span>
                  <span className="text-rose-400">Ошибок: {points[hoveredIdx].item.errors}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 text-center py-6">
            Пройдите хотя бы одну тренировку, чтобы увидеть график роста скорости.
          </div>
        )}
      </Card>

      {/* Weak Keys & Problematic Bigrams Alert */}
      <Card className="bg-[#090d16]/90 border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Проблемные клавиши и биграммы
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {weakKeys.length} клавиш • {weakBigrams.length} сочетаний
          </span>
        </div>

        {weakKeys.length === 0 && weakBigrams.length === 0 ? (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5 py-1">
            <Award className="w-4 h-4" />
            <span>Превосходно! В последних тренировках у вас нет критических зон опечаток.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {weakKeys.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {weakKeys.map(k => (
                  <div
                    key={k}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold flex items-center gap-2"
                  >
                    <span>{k.toUpperCase()}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      (~{Math.round((heatmap[k] || 0.15) * 100)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {weakBigrams.length > 0 && (
              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <div className="text-[11px] text-slate-400 font-mono">Частые опечатки в сочетаниях (биграммах):</div>
                <div className="flex flex-wrap gap-2">
                  {weakBigrams.map(b => (
                    <span
                      key={b.bigram}
                      className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-400/25 text-amber-300 font-mono text-xs font-bold"
                    >
                      {b.bigram.toUpperCase()}{' '}
                      <span className="text-[10px] text-slate-400 font-normal">({b.errors} ош.)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
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

        <VirtualKeyboard heatmapMode={true} heatmapData={heatmap} />
      </div>
    </div>
  )
}
