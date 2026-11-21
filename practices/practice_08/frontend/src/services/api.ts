import type { GrammarTopic, LessonData, SessionStats, UserStatsSummary, VocabularyWord } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Fallback data for offline/standalone execution
const FALLBACK_TOPICS: GrammarTopic[] = [
  {
    id: 'pres-perf',
    title: 'Present Perfect vs Past Simple',
    level: 'B1',
    description: 'Разница между результатом в настоящем (have/has + V3) и завершённым действием в прошлом.',
    sentenceCount: 5
  },
  {
    id: 'cond-2',
    title: 'Second & Third Conditionals',
    level: 'B2',
    description: 'Нереальные условия в настоящем (If + Past Simple) и прошлом (would have + V3).',
    sentenceCount: 4
  },
  {
    id: 'pass-voice',
    title: 'Passive Voice in Tech Contexts',
    level: 'B1',
    description: 'Страдательный залог: объект действия важнее исполнителя (be + V3).',
    sentenceCount: 3
  },
  {
    id: 'a1-basics',
    title: 'Present Simple & Daily Routines',
    level: 'A1',
    description: 'Базовые утверждения, отрицания и вопросы о повседневных привычках.',
    sentenceCount: 3
  }
]

const FALLBACK_LESSONS: Record<string, LessonData> = {
  'pres-perf': {
    id: 'pres-perf',
    title: 'Present Perfect vs Past Simple',
    level: 'B1',
    description: 'Отработка временных маркеров already, yet, yesterday, last week.',
    sentences: [
      {
        id: 's1',
        english: 'She has already completed this difficult report on time.',
        russian: 'Она уже завершила этот сложный отчёт вовремя.',
        grammarTip: 'already указывает на результат действия к настоящему моменту'
      },
      {
        id: 's2',
        english: 'They went to the conference in Berlin last Tuesday.',
        russian: 'Оны поехали на конференцию в Берлин в прошлый вторник.',
        grammarTip: 'last Tuesday — точный момент в прошлом (Past Simple)'
      },
      {
        id: 's3',
        english: 'I have never seen such an innovative software architecture before.',
        russian: 'Я никогда раньше не видел столь инновационной архитектуры ПО.',
        grammarTip: 'never выражает жизненный опыт до текущего момента'
      }
    ]
  }
}

export const api = {
  async getTopics(level?: string): Promise<GrammarTopic[]> {
    try {
      const url = level ? `${API_BASE}/topics?level=${encodeURIComponent(level)}` : `${API_BASE}/topics`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      return await res.json()
    } catch {
      // Fallback
      if (level) {
        return FALLBACK_TOPICS.filter(t => t.level.toLowerCase() === level.toLowerCase())
      }
      return FALLBACK_TOPICS
    }
  },

  async getLesson(topicId: string): Promise<LessonData> {
    try {
      const res = await fetch(`${API_BASE}/lessons/${topicId}`)
      if (!res.ok) throw new Error(`Failed to load lesson: ${res.status}`)
      return await res.json()
    } catch {
      if (FALLBACK_LESSONS[topicId]) {
        return FALLBACK_LESSONS[topicId]
      }
      return {
        id: topicId,
        title: 'Present Perfect Practice',
        level: 'B1',
        description: 'Отработка грамматики и скорости печати.',
        sentences: FALLBACK_LESSONS['pres-perf'].sentences
      }
    }
  },

  async getAdaptiveLesson(keys: string[]): Promise<LessonData> {
    const keysParam = keys.join(',')
    try {
      const res = await fetch(`${API_BASE}/adaptive/weak-keys?keys=${encodeURIComponent(keysParam)}`)
      if (!res.ok) throw new Error(`Failed to load adaptive lesson`)
      return await res.json()
    } catch {
      return {
        id: 'adaptive-weak-keys',
        title: `Тренировка слабых клавиш: [${keys.map(k => k.toUpperCase()).join(', ')}]`,
        level: 'Adaptive',
        description: 'Предложения с высокой концентрацией проблемных букв.',
        sentences: [
          {
            id: 'ad-1',
            english: 'Rapid prototyping requires proper practice and continuous testing.',
            russian: 'Быстрое прототипирование требует правильной практики и непрерывного тестирования.',
            grammarTip: 'Повышенная концентрация букв R, P, T'
          },
          {
            id: 'ad-2',
            english: 'The report provides reliable performance metrics for the team.',
            russian: 'Отчёт предоставляет надёжные метрики производительности для команды.',
            grammarTip: 'Тренировка пальцев правой и левой руки'
          }
        ]
      }
    }
  },

  async saveStats(stats: SessionStats): Promise<{ success: boolean; recordId: string }> {
    const res = await fetch(`${API_BASE}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats)
    })
    if (!res.ok) throw new Error('Не удалось сохранить статистику')
    return await res.json()
  },

  async getStatsSummary(): Promise<UserStatsSummary> {
    try {
      const res = await fetch(`${API_BASE}/stats`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return await res.json()
    } catch {
      return {
        totalSessions: 12,
        avgWpm: 71.4,
        avgAccuracy: 98.1,
        totalErrors: 14,
        weakKeysFrequency: { p: 5, r: 4, t: 3 }
      }
    }
  },

  async getVocabulary(): Promise<VocabularyWord[]> {
    try {
      const res = await fetch(`${API_BASE}/vocabulary`)
      if (!res.ok) throw new Error('Failed to fetch vocabulary')
      return await res.json()
    } catch {
      return [
        {
          id: 'v1',
          word: 'thoroughly',
          translation: 'тщательно, основательно',
          phonetic: '/ˈθʌr.ə.li/',
          partOfSpeech: 'adverb',
          mistakeCount: 3,
          audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/thoroughly-uk.mp3'
        },
        {
          id: 'v2',
          word: 'occurrence',
          translation: 'случай, происшествие',
          phonetic: '/əˈkʌr.əns/',
          partOfSpeech: 'noun',
          mistakeCount: 2,
          audioUrl: 'https://api.dictionaryapi.dev/media/pronunciations/en/occurrence-uk.mp3'
        }
      ]
    }
  },

  async addVocabularyWord(word: { word: string; translation: string; phonetic?: string; partOfSpeech?: string; audioUrl?: string }): Promise<VocabularyWord> {
    const res = await fetch(`${API_BASE}/vocabulary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(word)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Ошибка при добавлении слова')
    }
    return await res.json()
  },

  async deleteVocabularyWord(id: string): Promise<void> {
    await fetch(`${API_BASE}/vocabulary/${id}`, { method: 'DELETE' })
  }
}
