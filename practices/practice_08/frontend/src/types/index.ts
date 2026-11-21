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

export interface LeaderboardEntry {
  id: string
  userName: string
  wpm: number
  accuracy: number
  topicTitle: string
  level: string
  timestamp: string
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

export interface MusicSubtitleLine {
  id: number
  startSeconds: number
  endSeconds: number
  textEn: string
  textRu: string
}

export interface GrammarBreakdownItem {
  ruleTitle: string
  lyricQuote: string
  explanation: string
  grammarTag: string
}

export interface MusicLesson {
  id: string
  title: string
  artist: string
  level: string
  videoUrl: string
  thumbnailUrl: string
  grammarFocus: string
  subtitles: MusicSubtitleLine[]
  grammarBreakdown: GrammarBreakdownItem[]
  typingSentences: SentenceItem[]
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'speed' | 'accuracy' | 'grammar' | 'special'
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}
