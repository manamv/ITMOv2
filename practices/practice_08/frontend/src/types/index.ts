export interface GrammarTopic {
  id: string
  title: string
  level: string
  description: string
  sentenceCount: number
}

export interface SentenceItem {
  id: string
  english: string
  russian: string
  grammarTip: string
}

export interface LessonData {
  id: string
  title: string
  level: string
  description: string
  sentences: SentenceItem[]
}

export interface SessionStats {
  topicId: string
  wpm: number
  accuracy: number
  errors: number
  durationSeconds: number
  weakKeys: string[]
}

export interface UserStatsSummary {
  totalSessions: number
  avgWpm: number
  avgAccuracy: number
  totalErrors: number
  weakKeysFrequency: Record<string, number>
}

export interface VocabularyWord {
  id: string
  word: string
  translation: string
  phonetic: string
  partOfSpeech: string
  mistakeCount: number
  audioUrl?: string
}

export type FingerType = 
  | 'pinky-l' 
  | 'ring-l' 
  | 'mid-l' 
  | 'index-l' 
  | 'index-r' 
  | 'mid-r' 
  | 'ring-r' 
  | 'pinky-r' 
  | 'thumb'
