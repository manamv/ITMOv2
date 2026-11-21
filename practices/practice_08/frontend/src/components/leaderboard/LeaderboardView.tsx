import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Trophy, Medal, Award, Plus, Filter } from 'lucide-react'
import type { LeaderboardEntry } from '../../types'
import { api } from '../../services/api'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'

interface LeaderboardViewProps {
  lastSessionStats?: {
    wpm: number
    accuracy: number
    topicTitle: string
    level: string
  } | null
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ lastSessionStats }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [nickname, setNickname] = useState('')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submitLockRef = useRef(false)

  const loadLeaderboard = useCallback(async (level?: string) => {
    setIsLoading(true)
    try {
      const data = await api.getLeaderboard(level)
      setEntries(data)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLeaderboard(activeFilter)
  }, [activeFilter, loadLeaderboard])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
  }

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitLockRef.current || isSubmitting) return

    const trimmed = nickname.trim()
    if (!trimmed || trimmed.length < 2) {
      setSubmitError('Никнейм должен содержать как минимум 2 символа.')
      return
    }

    submitLockRef.current = true
    setIsSubmitting(true)
    setSubmitError(null)

    const wpm = lastSessionStats?.wpm || 75
    const accuracy = lastSessionStats?.accuracy || 98.5
    const topicTitle = lastSessionStats?.topicTitle || 'present perfect vs past simple'
    const level = lastSessionStats?.level || 'B1'

    try {
      const newEntry = await api.submitToLeaderboard({
        userName: trimmed,
        wpm,
        accuracy,
        topicTitle,
        level
      })
      setEntries(prev => [newEntry, ...prev].sort((a, b) => b.wpm - a.wpm))
      setIsModalOpen(false)
      setNickname('')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось добавить результат'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
      submitLockRef.current = false
    }
  }

  // Top 3 Podium typists
  const top1 = entries[0]
  const top2 = entries[1]
  const top3 = entries[2]

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in" data-testid="leaderboard-view">
      {/* Header & Action Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Лидерборд скоропечатания</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Рейтинг пользователей по скорости (WPM) и точности набора грамматических текстов
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="primary"
            className="flex items-center space-x-1.5 text-xs py-2 px-3.5 shadow-lg shadow-emerald-500/20"
            data-testid="add-score-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Добавить рекорд</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Фильтр по уровню">
        <div className="flex items-center space-x-1.5 text-xs text-slate-400 mr-2">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          <span>Уровень:</span>
        </div>
        {[
          { id: 'all', label: 'Все уровни' },
          { id: 'A1', label: 'A1 Beginner' },
          { id: 'B1', label: 'B1 Intermediate' },
          { id: 'B2', label: 'B2 Upper-Int' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleFilterChange(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 text-slate-950 font-bold shadow-md shadow-sky-500/20'
                : 'bg-[#0d1527] border border-[#1e2c4a] text-slate-300 hover:text-white hover:border-sky-500/40'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Top 3 Podium (when at least 3 entries exist) */}
      {top1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 2nd Place */}
          {top2 ? (
            <div className="order-2 md:order-1 p-5 rounded-2xl bg-[#0d1527]/90 border border-[#1e2c4a] flex flex-col items-center text-center shadow-lg hover:border-slate-500 transition">
              <div className="w-12 h-12 rounded-full bg-[#101828] border-2 border-slate-400 flex items-center justify-center mb-3 text-slate-300 shadow-md">
                <Medal className="w-6 h-6 text-slate-300" />
              </div>
              <Badge variant="slate" className="mb-2">#2 Серебро</Badge>
              <h3 className="font-bold text-white text-base">{top2.userName}</h3>
              <div className="mt-3 font-mono">
                <span className="text-2xl font-extrabold text-slate-200">{top2.wpm}</span>
                <span className="text-xs text-slate-400 ml-1">WPM</span>
              </div>
              <span className="text-xs text-sky-400 mt-1 font-mono">{top2.accuracy}% точность</span>
              <span className="text-[11px] text-slate-500 mt-2 truncate max-w-full">{top2.topicTitle}</span>
            </div>
          ) : <div className="order-2 md:order-1" />}

          {/* 1st Place (Gold Center) */}
          <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 via-[#0d1527]/95 to-[#0d1527]/95 border-2 border-amber-500/50 flex flex-col items-center text-center shadow-2xl shadow-amber-500/10 scale-105">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center mb-3 text-slate-950 font-bold shadow-lg shadow-amber-500/30">
              <Trophy className="w-7 h-7 text-slate-950" />
            </div>
            <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/40 mb-2">
              🥇 Чемпион #1
            </span>
            <h3 className="font-extrabold text-white text-lg">{top1.userName}</h3>
            <div className="mt-3 font-mono">
              <span className="text-3xl font-extrabold text-amber-400">{top1.wpm}</span>
              <span className="text-xs text-slate-400 ml-1 font-semibold">WPM</span>
            </div>
            <span className="text-xs text-sky-400 mt-1 font-mono font-medium">{top1.accuracy}% точность</span>
            <span className="text-[11px] text-slate-400 mt-2 truncate max-w-full">{top1.topicTitle}</span>
          </div>

          {/* 3rd Place */}
          {top3 ? (
            <div className="order-3 p-5 rounded-2xl bg-[#0d1527]/90 border border-amber-700/50 flex flex-col items-center text-center shadow-lg hover:border-amber-600 transition">
              <div className="w-12 h-12 rounded-full bg-[#101828] border-2 border-amber-600 flex items-center justify-center mb-3 text-amber-500 shadow-md">
                <Award className="w-6 h-6 text-amber-500" />
              </div>
              <Badge variant="amber" className="mb-2">#3 Бронза</Badge>
              <h3 className="font-bold text-white text-base">{top3.userName}</h3>
              <div className="mt-3 font-mono">
                <span className="text-2xl font-extrabold text-amber-500">{top3.wpm}</span>
                <span className="text-xs text-slate-400 ml-1">WPM</span>
              </div>
              <span className="text-xs text-sky-400 mt-1 font-mono">{top3.accuracy}% точность</span>
              <span className="text-[11px] text-slate-500 mt-2 truncate max-w-full">{top3.topicTitle}</span>
            </div>
          ) : <div className="order-3" />}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <Card className="overflow-hidden border-[#1e2c4a]">
        <div className="p-4 border-b border-[#1e2c4a] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Полный список лидеров</span>
          <span className="text-xs font-mono text-slate-500">Всего участников: {entries.length}</span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-400 font-mono text-xs">Загрузка таблицы лидеров...</div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">В данной категории пока нет результатов.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" data-testid="leaderboard-table">
              <thead className="bg-[#0a0f1d] text-slate-400 border-b border-[#1e2c4a] font-mono">
                <tr>
                  <th className="py-3 px-4 w-16">Ранг</th>
                  <th className="py-3 px-4">Участник</th>
                  <th className="py-3 px-4">Скорость</th>
                  <th className="py-3 px-4">Точность</th>
                  <th className="py-3 px-4">Урок / Уровень</th>
                  <th className="py-3 px-4 text-right">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2c4a]/60 font-mono">
                {entries.map((entry, idx) => (
                  <tr key={entry.id || idx} className="hover:bg-[#131f38]/40 transition">
                    <td className="py-3 px-4">
                      {idx === 0 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">1</span>
                      ) : idx === 1 ? (
                        <span className="w-6 h-6 rounded-full bg-slate-300 text-slate-950 font-bold flex items-center justify-center text-xs">2</span>
                      ) : idx === 2 ? (
                        <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs">3</span>
                      ) : (
                        <span className="text-slate-500">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-[10px] text-sky-400 font-bold">
                          {entry.userName.slice(0, 1).toUpperCase()}
                        </div>
                        <span>{entry.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sky-400 font-bold text-sm">{entry.wpm}</span>
                      <span className="text-[10px] text-slate-500 ml-1">WPM</span>
                    </td>
                    <td className="py-3 px-4 text-indigo-400 font-medium">
                      {entry.accuracy}%
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#101828] border border-[#1e2c4a] text-slate-300 mr-2 font-mono">
                        {entry.level}
                      </span>
                      <span className="truncate">{entry.topicTitle}</span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                      {new Date(entry.timestamp).toLocaleDateString('ru-RU')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Submit Score to Leaderboard */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Сохранить свой результат в Лидерборд"
      >
        <form onSubmit={handleSubmitScore} className="space-y-4">
          <div className="p-3 rounded-xl bg-[#0a0f1d] border border-[#1e2c4a] flex items-center justify-between font-mono text-xs">
            <div>
              <span className="text-slate-500 block">Ваш показатель WPM:</span>
              <span className="text-sky-400 font-bold text-lg">{lastSessionStats?.wpm || 75} WPM</span>
            </div>
            <div>
              <span className="text-slate-500 block">Точность:</span>
              <span className="text-indigo-400 font-bold text-lg">{lastSessionStats?.accuracy || 98.5}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Уровень:</span>
              <span className="text-amber-400 font-bold text-base">{lastSessionStats?.level || 'B1'}</span>
            </div>
          </div>

          <div>
            <label htmlFor="nickname-input" className="block text-xs font-medium text-slate-300 mb-1.5">
              Ваш никнейм или имя <span className="text-rose-400">*</span>
            </label>
            <input
              id="nickname-input"
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="Например: linus_speed"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a0f1d] border border-[#1e2c4a] text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
              maxLength={24}
              autoFocus
              required
            />
          </div>

          {submitError && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {submitError}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              data-testid="submit-record-btn"
            >
              {isSubmitting ? 'Сохранение...' : 'Опубликовать'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
