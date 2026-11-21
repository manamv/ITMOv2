import type { GrammarTopic, LeaderboardEntry, LessonData, SessionStats, UserStatsSummary, VocabularyWord, MusicLesson } from '../types'

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
  },
  {
    id: 'past-continuous',
    title: 'past continuous vs past simple',
    level: 'A2',
    description: 'параллельные и прерванные действия в прошлом без пунктуации',
    sentenceCount: 3
  },
  {
    id: 'future-forms',
    title: 'future forms will going to present continuous',
    level: 'B1',
    description: 'разница между спонтанными решениями планами и точными договоренностями',
    sentenceCount: 3
  },
  {
    id: 'modal-deduction',
    title: 'modals of deduction must cannot might',
    level: 'B2',
    description: 'выражение уверенности и предположений в настоящем и прошлом',
    sentenceCount: 3
  },
  {
    id: 'phrasal-tech',
    title: 'essential phrasal verbs in software engineering',
    level: 'B2',
    description: 'ключевые фразовые глаголы в разработке и системной инженерии',
    sentenceCount: 3
  },
  {
    id: 'c1-inversion',
    title: 'advanced inversion and fronting',
    level: 'C1',
    description: 'эмфатическая инверсия порядка слов после отрицательных наречий',
    sentenceCount: 3
  },
  {
    id: 'reported-speech',
    title: 'reported speech in technical discussions',
    level: 'B1',
    description: 'косвенная речь и согласование времен в командных обсуждениях',
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

const FALLBACK_MUSIC_LESSONS: MusicLesson[] = [
  {
    id: 'queen-champions',
    title: 'We Are the Champions',
    artist: 'Queen',
    level: 'B1',
    videoUrl: 'https://www.youtube.com/embed/04854XqcfCY',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    grammarFocus: 'Present Perfect vs Past Simple, gerunds and colloquial contractions',
    subtitles: [
      { id: 1, startSeconds: 8.5, endSeconds: 14.0, textEn: 'i have paid my dues time after time', textRu: 'я платил по счетам снова и снова' },
      { id: 2, startSeconds: 14.0, endSeconds: 19.5, textEn: 'i did my sentence but committed no crime', textRu: 'я отбыл свой срок но не совершал преступления' },
      { id: 3, startSeconds: 19.5, endSeconds: 25.0, textEn: 'and bad mistakes i have made a few', textRu: 'и тяжких ошибок я совершил немного' },
      { id: 4, startSeconds: 25.0, endSeconds: 37.0, textEn: 'i have had my share of sand kicked in my face but i have come through', textRu: 'мне тоже швыряли песок в лицо но я выстоял' },
      { id: 5, startSeconds: 37.0, endSeconds: 50.0, textEn: 'we are the champions my friends and we will keep on fighting till the end', textRu: 'мы чемпионы друзья мои и мы продолжим бороться до конца' },
      { id: 6, startSeconds: 50.0, endSeconds: 64.0, textEn: 'we are the champions no time for losers because we are the champions of the world', textRu: 'мы чемпионы не время для проигравших потому что мы чемпионы мира' }
    ],
    grammarBreakdown: [
      { ruleTitle: 'Present Perfect for Life Experience', lyricQuote: 'i have paid my dues time after time', explanation: 'have paid (V3) выражает жизненный опыт до момента речи с фокусом на результат в настоящем.', grammarTag: 'present-perfect' },
      { ruleTitle: 'Past Simple for Definite Events', lyricQuote: 'i did my sentence but committed no crime', explanation: 'did и committed в Past Simple выражают завершенные действия в прошлом.', grammarTag: 'past-simple' },
      { ruleTitle: 'Keep on + Gerund', lyricQuote: 'we will keep on fighting till the end', explanation: 'фразовый глагол keep on в сочетании с герундием fighting означает непрерывное продолжение действия.', grammarTag: 'phrasal-verbs' },
      { ruleTitle: 'Colloquial Contraction', lyricQuote: 'no time for losers because we are the champions', explanation: 'в песне часто используется cause как разговорное сокращение от because.', grammarTag: 'informal-english' }
    ],
    typingSentences: [
      { id: 'qc-1', english: 'i have paid my dues time after time and i did my sentence but committed no crime', russian: 'я платил по счетам снова и снова и я отбыл свой срок но не совершал преступления', grammarTip: 'контраст present perfect have paid и past simple did committed' },
      { id: 'qc-2', english: 'and bad mistakes i have made a few i have had my share of sand kicked in my face', russian: 'и тяжких ошибок я совершил немного мне тоже швыряли песок в лицо', grammarTip: 'present perfect have made have had для жизненного опыта' },
      { id: 'qc-3', english: 'we are the champions my friends and we will keep on fighting till the end', russian: 'мы чемпионы друзья мои и мы продолжим бороться до конца', grammarTip: 'keep on fighting конструкция продолжения действия' },
      { id: 'qc-4', english: 'we are the champions no time for losers because we are the champions of the world', russian: 'мы чемпионы не время для проигравших потому что мы чемпионы мира', grammarTip: 'утвердительные конструкции и ритм песни' }
    ]
  },
  {
    id: 'coldplay-scientist',
    title: 'The Scientist',
    artist: 'Coldplay',
    level: 'B1',
    videoUrl: 'https://www.youtube.com/embed/RB-RcX5DS5A',
    thumbnailUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    grammarFocus: 'Infinitive of purpose, modal verbs and expressions of regret',
    subtitles: [
      { id: 1, startSeconds: 15.5, endSeconds: 23.0, textEn: 'come up to meet you tell you i am sorry', textRu: 'прийти чтобы встретиться с тобой сказать что мне жаль' },
      { id: 2, startSeconds: 23.0, endSeconds: 31.0, textEn: 'you do not know how lovely you are', textRu: 'ты даже не знаешь насколько ты прекрасна' },
      { id: 3, startSeconds: 31.0, endSeconds: 39.0, textEn: 'i had to find you tell you i need you', textRu: 'я должен был найти тебя сказать что ты мне нужна' },
      { id: 4, startSeconds: 39.0, endSeconds: 47.0, textEn: 'tell you i set you apart', textRu: 'сказать что ты для меня особенная' }
    ],
    grammarBreakdown: [
      { ruleTitle: 'Infinitive of Purpose', lyricQuote: 'come up to meet you tell you i am sorry', explanation: 'Инфинитив с частицей to (to meet, to tell) указывает на цель действия: зачем пришёл.', grammarTag: 'infinitive' },
      { ruleTitle: 'Modal Verb of Obligation in Past', lyricQuote: 'i had to find you tell you i need you', explanation: 'had to это форма прошедшего времени от must/have to выражающая внешнюю необходимость.', grammarTag: 'modals' }
    ],
    typingSentences: [
      { id: 'cs-1', english: 'come up to meet you tell you i am sorry you do not know how lovely you are', russian: 'прийти чтобы встретиться с тобой сказать что мне жаль ты не знаешь как ты прекрасна', grammarTip: 'infinitive of purpose to meet you to tell you' },
      { id: 'cs-2', english: 'i had to find you tell you i need you tell you i set you apart', russian: 'я должен был найти тебя сказать что ты мне нужна сказать что ты особенная', grammarTip: 'had to прошедшее время от must' }
    ]
  }
]

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
  },

  async getMusicLessons(): Promise<Array<{ id: string; title: string; artist: string; level: string; thumbnailUrl: string; grammarFocus: string; sentenceCount: number }>> {
    try {
      const res = await fetch(`${API_BASE}/music-lessons`)
      if (!res.ok) throw new Error(`Failed to load music lessons: ${res.status}`)
      return await res.json()
    } catch {
      return FALLBACK_MUSIC_LESSONS.map(m => ({
        id: m.id,
        title: m.title,
        artist: m.artist,
        level: m.level,
        thumbnailUrl: m.thumbnailUrl,
        grammarFocus: m.grammarFocus,
        sentenceCount: m.typingSentences.length
      }))
    }
  },

  async getMusicLesson(id: string): Promise<MusicLesson> {
    try {
      const res = await fetch(`${API_BASE}/music-lessons/${id}`)
      if (!res.ok) throw new Error(`Failed to load music lesson ${id}: ${res.status}`)
      return await res.json()
    } catch {
      const found = FALLBACK_MUSIC_LESSONS.find(m => m.id === id)
      if (found) return found
      return FALLBACK_MUSIC_LESSONS[0]
    }
  }
}
