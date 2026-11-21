import type { GrammarTopic, LeaderboardEntry, LessonData, SessionStats, UserStatsSummary, VocabularyWord } from '../types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb-1', userName: 'alex_speed', wpm: 104, accuracy: 99.4, topicTitle: 'present perfect vs past simple', level: 'B1', timestamp: new Date().toISOString() },
  { id: 'lb-2', userName: 'elena_code', wpm: 96, accuracy: 98.8, topicTitle: 'second and third conditionals', level: 'B2', timestamp: new Date().toISOString() },
  { id: 'lb-3', userName: 'cyber_typer', wpm: 88, accuracy: 97.5, topicTitle: 'passive voice in tech contexts', level: 'B1', timestamp: new Date().toISOString() },
  { id: 'lb-4', userName: 'dev_master', wpm: 82, accuracy: 99.0, topicTitle: 'present simple and daily routines', level: 'A1', timestamp: new Date().toISOString() },
  { id: 'lb-5', userName: 'ninja_keys', wpm: 78, accuracy: 96.2, topicTitle: 'defining and non defining relative clauses', level: 'B2', timestamp: new Date().toISOString() }
]

// Fallback data for offline/standalone execution
const FALLBACK_TOPICS: GrammarTopic[] = [
  {
    id: 'pres-perf',
    title: 'present perfect vs past simple',
    level: 'B1',
    description: 'разница между результатом в настоящем и завершенным действием в прошлом',
    sentenceCount: 5
  },
  {
    id: 'cond-2',
    title: 'second and third conditionals',
    level: 'B2',
    description: 'нереальные условия в настоящем и прошлом без знаков препинания',
    sentenceCount: 4
  },
  {
    id: 'pass-voice',
    title: 'passive voice in tech contexts',
    level: 'B1',
    description: 'страдательный залог объект действия важнее исполнителя',
    sentenceCount: 3
  },
  {
    id: 'a1-basics',
    title: 'present simple and daily routines',
    level: 'A1',
    description: 'базовые утверждения отрицания и вопросы о повседневных привычках',
    sentenceCount: 3
  }
]

const FALLBACK_LESSONS: Record<string, LessonData> = {
  'pres-perf': {
    id: 'pres-perf',
    title: 'present perfect vs past simple',
    level: 'B1',
    description: 'отработка временных маркеров without uppercase and punctuation',
    sentences: [
      {
        id: 's1',
        english: 'she has already completed this difficult engineering report on time and the lead architect has verified all database schema changes with the entire team',
        russian: 'она уже завершила этот сложный инженерный отчёт вовремя и главный архитектор проверил все изменения схемы базы данных со всей командой',
        grammarTip: 'already указывает на результат в настоящем have или has плюс v3'
      },
      {
        id: 's2',
        english: 'they went to the international tech conference in berlin last tuesday and presented their new automated deployment pipeline to many distributed backend developers',
        russian: 'они поехали на международную технологическую конференцию в берлин в прошлый вторник и представили свой новый автоматизированный пайплайн деплоя разработчикам',
        grammarTip: 'last tuesday указывает на конкретный момент в прошлом past simple'
      },
      {
        id: 's3',
        english: 'we have never observed such an innovative microservice architecture before in any enterprise software system because the latency was always extremely low',
        russian: 'мы никогда раньше не наблюдали столь инновационной микросервисной архитектуры ни в одной корпоративной системе потому что задержка была низкой',
        grammarTip: 'never в контексте жизненного опыта до настоящего момента present perfect'
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
        title: `тренировка слабых клавиш: [${keys.map(k => k.toLowerCase()).join(', ')}]`,
        level: 'Adaptive',
        description: 'предложения с высокой концентрацией проблемных букв без знаков препинания',
        sentences: [
          {
            id: 'ad-1',
            english: 'rapid prototyping requires proper practice and continuous testing to ensure that all critical software components perform reliably under heavy network load',
            russian: 'быстрое прототипирование требует правильной практики и непрерывного тестирования чтобы гарантировать надежную работу всех компонентов под нагрузкой',
            grammarTip: 'повышенная концентрация букв r p t'
          },
          {
            id: 'ad-2',
            english: 'senior programmers write clean structured code and optimize database queries to achieve the lowest possible response latency across all backend services',
            russian: 'сеньор программисты пишут чистый структурированный код и оптимизируют запросы к базе данных для минимальной задержки ответа сервисов',
            grammarTip: 'тренировка пальцев правой и левой руки'
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
  },

  async getLeaderboard(level?: string): Promise<LeaderboardEntry[]> {
    try {
      const url = level && level !== 'all' ? `${API_BASE}/leaderboard?level=${encodeURIComponent(level)}` : `${API_BASE}/leaderboard`
      const res = await fetch(url)
      if (!res.ok) throw new Error(`Failed to load leaderboard: ${res.status}`)
      return await res.json()
    } catch {
      if (level && level !== 'all') {
        return FALLBACK_LEADERBOARD.filter(e => e.level.toLowerCase() === level.toLowerCase())
      }
      return FALLBACK_LEADERBOARD
    }
  },

  async submitToLeaderboard(entry: { userName: string; wpm: number; accuracy: number; topicTitle: string; level: string }): Promise<LeaderboardEntry> {
    const res = await fetch(`${API_BASE}/leaderboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Ошибка при отправке в лидерборд')
    }
    return await res.json()
  }
}
