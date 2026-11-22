// Weak Keys, Bigram Error Analytics, Keyboard Heatmap & Session Progress Tracker
import type { LessonData } from '../types'

export interface KeyStats {
  hits: number
  errors: number
}

export interface SessionHistoryPoint {
  id: string
  wpm: number
  accuracy: number
  errors: number
  topicTitle: string
  timestamp: string
}

const STORAGE_KEY = 'linguatype_key_stats'
const BIGRAMS_KEY = 'linguatype_bigram_stats'
const HISTORY_KEY = 'linguatype_session_history'

const DEFAULT_SEED_HISTORY: SessionHistoryPoint[] = [
  { id: 'seed-1', wpm: 48, accuracy: 93.4, errors: 6, topicTitle: 'present simple', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'seed-2', wpm: 54, accuracy: 95.1, errors: 4, topicTitle: 'past continuous', timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'seed-3', wpm: 61, accuracy: 96.8, errors: 3, topicTitle: 'passive voice', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'seed-4', wpm: 68, accuracy: 98.2, errors: 2, topicTitle: 'present perfect', timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 'seed-5', wpm: 74, accuracy: 99.0, errors: 1, topicTitle: 'conditionals', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
]

class WeakKeysService {
  private stats: Record<string, KeyStats> = {}
  private bigrams: Record<string, KeyStats> = {}
  private history: SessionHistoryPoint[] = []

  constructor() {
    this.load()
  }

  private load() {
    if (typeof window === 'undefined') {
      this.history = [...DEFAULT_SEED_HISTORY]
      return
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) this.stats = JSON.parse(data)

      const bigramData = localStorage.getItem(BIGRAMS_KEY)
      if (bigramData) this.bigrams = JSON.parse(bigramData)

      const histData = localStorage.getItem(HISTORY_KEY)
      if (histData) {
        const parsed = JSON.parse(histData)
        this.history = Array.isArray(parsed) && parsed.length > 0 ? parsed : [...DEFAULT_SEED_HISTORY]
      } else {
        this.history = [...DEFAULT_SEED_HISTORY]
      }
    } catch {
      this.stats = {}
      this.bigrams = {}
      this.history = [...DEFAULT_SEED_HISTORY]
    }
  }

  private save() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats))
      localStorage.setItem(BIGRAMS_KEY, JSON.stringify(this.bigrams))
      localStorage.setItem(HISTORY_KEY, JSON.stringify(this.history.slice(-20)))
    } catch {
      // Ignore storage errors
    }
  }

  recordKey(key: string, isError: boolean) {
    const k = key.toLowerCase()
    if (!k || k.length > 1) return

    if (!this.stats[k]) {
      this.stats[k] = { hits: 0, errors: 0 }
    }

    this.stats[k].hits += 1
    if (isError) {
      this.stats[k].errors += 1
    }

    this.save()
  }

  /**
   * Track 2-letter sequence accuracy (bigrams like "th", "re", "in", "qu")
   */
  recordBigram(prevChar: string, currChar: string, isError: boolean) {
    const a = prevChar.toLowerCase()
    const b = currChar.toLowerCase()
    if (!/^[a-z]$/.test(a) || !/^[a-z]$/.test(b)) return

    const pair = a + b
    if (!this.bigrams[pair]) {
      this.bigrams[pair] = { hits: 0, errors: 0 }
    }
    this.bigrams[pair].hits += 1
    if (isError) {
      this.bigrams[pair].errors += 1
    }
    this.save()
  }

  /**
   * Persist completed session into progress chart history
   */
  recordSession(entry: Omit<SessionHistoryPoint, 'id' | 'timestamp'>) {
    const point: SessionHistoryPoint = {
      id: `sess-${Date.now()}`,
      wpm: entry.wpm,
      accuracy: entry.accuracy,
      errors: entry.errors,
      topicTitle: entry.topicTitle,
      timestamp: new Date().toISOString()
    }
    this.history = [...this.history, point].slice(-20)
    this.save()
  }

  getSessionHistory(): SessionHistoryPoint[] {
    return this.history
  }

  getBestWpm(): number {
    if (this.history.length === 0) return 0
    return Math.max(...this.history.map(h => h.wpm))
  }

  /**
   * Returns list of keys with error rate > 12% (minimum 3 hits)
   */
  getWeakKeys(): string[] {
    return Object.entries(this.stats)
      .filter(([_, data]) => data.hits >= 3 && data.errors / data.hits >= 0.12)
      .sort((a, b) => b[1].errors / b[1].hits - a[1].errors / a[1].hits)
      .map(([key]) => key)
  }

  /**
   * Returns top problematic 2-character bigrams (minimum 1 error)
   */
  getWeakBigrams(limit: number = 5): Array<{ bigram: string; errorRate: number; errors: number }> {
    return Object.entries(this.bigrams)
      .filter(([_, data]) => data.errors >= 1 && data.hits >= 1)
      .sort((a, b) => {
        const rateDiff = b[1].errors / b[1].hits - a[1].errors / a[1].hits
        if (Math.abs(rateDiff) > 0.05) return rateDiff
        return b[1].errors - a[1].errors
      })
      .slice(0, limit)
      .map(([bigram, data]) => ({
        bigram,
        errors: data.errors,
        errorRate: Math.round((data.errors / data.hits) * 100)
      }))
  }

  /**
   * Returns key error rate from 0 (perfect) to 1.0 (all errors)
   */
  getKeyHeatmap(): Record<string, number> {
    const result: Record<string, number> = {}
    for (const [key, data] of Object.entries(this.stats)) {
      if (data.hits >= 2) {
        result[key] = Math.min(1.0, data.errors / data.hits)
      }
    }
    return result
  }

  /**
   * Dynamically builds a targeted 3-sentence AI error-recovery sprint focused on weak keys & bigrams
   */
  buildErrorRecoverySprint(weakKeys: string[], weakBigrams: string[]): LessonData {
    const keysLabel = weakKeys.length > 0 ? weakKeys.slice(0, 4).map(k => k.toUpperCase()).join(', ') : 'R, T, H'
    const bigramPool: Record<string, { en: string; ru: string; tip: string }> = {
      th: {
        en: 'the thoughtful architect thoroughly verified that this threshold works smoothly through the entire platform',
        ru: 'вдумчивый архитектор тщательно проверил что этот порог плавно работает по всей платформе',
        tip: 'отработка сочетания th переход правого указательного на левый указательный'
      },
      re: {
        en: 'the reliable release required repeated regression reviews before engineers restored the remote replica',
        ru: 'надежный релиз потребовал повторных проверок регрессии прежде чем инженеры восстановили реплику',
        tip: 'отработка сочетания re быстрый переход левого указательного и среднего пальцев'
      },
      in: {
        en: 'initializing independent indexing pipelines inside distributed infrastructure increases throughput instantly',
        ru: 'инициализация независимых пайплайнов индексации внутри распределенной инфраструктуры мгновенно ускоряет систему',
        tip: 'отработка сочетания in синхронизация правой руки средний и указательный'
      },
      qu: {
        en: 'quick quality queries quietly queued requests requiring equal quota allocation across clusters',
        ru: 'быстрые качественные запросы тихо выстроили очередь требующую равного выделения квот в кластерах',
        tip: 'отработка сочетания qu левый мизинец и правый указательный'
      },
      st: {
        en: 'strict static analysis stops subtle state mistakes before staging deployments start automatically',
        ru: 'строгий статический анализ останавливает тонкие ошибки состояния до запуска тестового деплоя',
        tip: 'отработка сочетания st быстрый переход безымянного и указательного левой руки'
      }
    }

    const sentences: LessonData['sentences'] = []
    for (const bg of weakBigrams) {
      const match = bigramPool[bg.toLowerCase()]
      if (match && sentences.length < 2) {
        sentences.push({
          id: `ai-bg-${bg}`,
          english: match.en,
          russian: match.ru,
          grammarTip: match.tip
        })
      }
    }

    // Add general precision drill tailored to weak letters
    const fallbackDrills = [
      {
        id: 'ai-drill-1',
        english: 'practicing precise finger placement prevents repeated typing errors during rapid technical writing',
        russian: 'практика точной постановки пальцев предотвращает повторяющиеся опечатки при быстром техническом письме',
        grammarTip: `фокус на проблемных клавишах: ${keysLabel}`
      },
      {
        id: 'ai-drill-2',
        english: 'senior engineers review every pull request carefully to ensure clean architecture and zero regressions',
        russian: 'сеньор инженеры внимательно проверяют каждый пулл реквест чтобы гарантировать чистую архитектуру без регрессий',
        grammarTip: 'ритмичный слепой набор без рывков и пауз'
      },
      {
        id: 'ai-drill-3',
        english: 'consistent daily rhythm builds lasting muscle memory across every row of the modern keyboard',
        russian: 'постоянный ежедневный ритм формирует прочную мышечную память на каждом ряду современной клавиатуры',
        grammarTip: 'закрепление точности после AI-разбора ошибок'
      }
    ]

    for (const drill of fallbackDrills) {
      if (sentences.length < 3) sentences.push(drill)
    }

    return {
      id: 'ai-error-sprint',
      title: `AI-спринт по ошибкам (${keysLabel})`,
      level: 'AI Drill',
      description: 'Персональная тренировка, собранная AI на основе ваших опечаток и проблемных биграмм.',
      sentences
    }
  }

  clear() {
    this.stats = {}
    this.bigrams = {}
    this.history = []
    this.save()
  }
}

export const weakKeysService = new WeakKeysService()
