import { useState, useEffect, useCallback } from 'react'
import { Keyboard, BookOpen, BarChart3, Sparkles, Trophy, Music } from 'lucide-react'
import type { GrammarTopic, LessonData, SessionStats, UserStatsSummary, VocabularyWord } from './types'
import { api } from './services/api'
import { TopicSelector } from './components/grammar/TopicSelector'
import { TypingEngine } from './components/typing/TypingEngine'
import { VocabularyView } from './components/vocabulary/VocabularyView'
import { StatsView } from './components/stats/StatsView'
import { LeaderboardView } from './components/leaderboard/LeaderboardView'
import { MusicClipsView } from './components/music/MusicClipsView'
import { LoadingState } from './components/states/LoadingState'
import { EmptyState } from './components/states/EmptyState'
import { ErrorState } from './components/states/ErrorState'
import { SuccessResult } from './components/states/SuccessResult'

type ActiveTab = 'PRACTICE' | 'VOCABULARY' | 'STATS' | 'LEADERBOARD' | 'MUSIC'
type PracticeMode = 'TOPICS' | 'TYPING' | 'RESULT'

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('PRACTICE')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('TOPICS')

  // Data states
  const [topics, setTopics] = useState<GrammarTopic[]>([])
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null)
  const [lastStats, setLastStats] = useState<SessionStats | null>(null)
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([])
  const [statsSummary, setStatsSummary] = useState<UserStatsSummary>({
    totalSessions: 0,
    avgWpm: 0,
    avgAccuracy: 0,
    totalErrors: 0,
    weakKeysFrequency: {}
  })

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initial load
  const loadInitialData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [topicsData, vocabData, summaryData] = await Promise.all([
        api.getTopics(),
        api.getVocabulary(),
        api.getStatsSummary()
      ])
      setTopics(topicsData)
      setVocabulary(vocabData)
      setStatsSummary(summaryData)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось связаться с сервером'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // Select standard topic
  const handleSelectTopic = async (topicId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const lesson = await api.getLesson(topicId)
      setCurrentLesson(lesson)
      setPracticeMode('TYPING')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить урок'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Select adaptive weak keys sprint
  const handleSelectAdaptive = async (weakKeys: string[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const lesson = await api.getAdaptiveLesson(weakKeys)
      setCurrentLesson(lesson)
      setPracticeMode('TYPING')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Не удалось загрузить адаптивный урок'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Finish typing session
  const handleFinishTyping = async (stats: SessionStats) => {
    setLastStats(stats)
    try {
      await api.saveStats(stats)
      // Refresh summary
      const updated = await api.getStatsSummary()
      setStatsSummary(updated)
    } catch {
      // Offline fallback
    }
    setPracticeMode('RESULT')
  }

  // Add word to vocabulary
  const handleAddWord = async (word: { word: string; translation: string; phonetic?: string }) => {
    const added = await api.addVocabularyWord(word)
    setVocabulary(prev => [...prev, added])
  }

  // Delete word from vocabulary
  const handleDeleteWord = async (id: string) => {
    await api.deleteVocabularyWord(id)
    setVocabulary(prev => prev.filter(w => w.id !== id))
  }

  // Start practice directly from vocabulary words
  const handleStartVocabularyPractice = (wordsList: string[]) => {
    const sentences = wordsList.slice(0, 5).map((w, idx) => ({
      id: `vocab-${idx}`,
      english: `Mastering the word ${w} requires steady practice.`,
      russian: `Освоение слова ${w} требует регулярной практики.`,
      grammarTip: `Отработка слова ${w}`
    }))

    setCurrentLesson({
      id: 'vocab-sprint',
      title: 'Спринт по трудным словам',
      level: 'Vocabulary',
      description: 'Тренировка слов из вашего личного словаря.',
      sentences
    })
    setActiveTab('PRACTICE')
    setPracticeMode('TYPING')
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Product Name */}
          <div 
            onClick={() => {
              setActiveTab('PRACTICE')
              setPracticeMode('TOPICS')
            }}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-mono font-bold text-slate-950 text-base shadow-lg shadow-emerald-500/20">
              LT
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                LinguaType
              </span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                AI Grammar + Touch Typing
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-medium" aria-label="Основная навигация">
            <button
              onClick={() => {
                setActiveTab('PRACTICE')
                if (practiceMode === 'RESULT') setPracticeMode('TOPICS')
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'PRACTICE'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Тренировка</span>
            </button>

            <button
              onClick={() => setActiveTab('VOCABULARY')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'VOCABULARY'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Словарь ({vocabulary.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('STATS')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'STATS'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Статистика</span>
            </button>

            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'LEADERBOARD'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="tab-leaderboard"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Лидерборд</span>
            </button>

            <button
              onClick={() => setActiveTab('MUSIC')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'MUSIC'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              data-testid="tab-music"
            >
              <Music className="w-3.5 h-3.5" />
              <span>Клипы & Песни</span>
            </button>
          </nav>

          {/* User Score Badge */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{statsSummary.avgWpm} WPM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 flex flex-col justify-center">
        {/* Loading State */}
        {isLoading && <LoadingState message="Синхронизация с сервером..." />}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorState
            message={error}
            onRetry={loadInitialData}
          />
        )}

        {/* Normal Content Flow */}
        {!isLoading && !error && (
          <>
            {/* TAB 1: PRACTICE */}
            {activeTab === 'PRACTICE' && (
              <>
                {practiceMode === 'TOPICS' && (
                  topics.length === 0 ? (
                    <EmptyState
                      title="Список тем пуст"
                      description="Не удалось найти доступные грамматические темы."
                      onAction={loadInitialData}
                    />
                  ) : (
                    <TopicSelector
                      topics={topics}
                      onSelectTopic={handleSelectTopic}
                      onSelectAdaptive={handleSelectAdaptive}
                    />
                  )
                )}

                {practiceMode === 'TYPING' && currentLesson && (
                  <TypingEngine
                    lesson={currentLesson}
                    onFinish={handleFinishTyping}
                  />
                )}

                {practiceMode === 'RESULT' && lastStats && (
                  <SuccessResult
                    stats={lastStats}
                    onRepeat={() => setPracticeMode('TYPING')}
                    onNext={() => setPracticeMode('TOPICS')}
                    onOpenLeaderboard={() => setActiveTab('LEADERBOARD')}
                  />
                )}
              </>
            )}

            {/* TAB 2: VOCABULARY */}
            {activeTab === 'VOCABULARY' && (
              <VocabularyView
                words={vocabulary}
                onAddWord={handleAddWord}
                onDeleteWord={handleDeleteWord}
                onStartVocabularyPractice={handleStartVocabularyPractice}
              />
            )}

            {/* TAB 3: STATS & HEATMAP */}
            {activeTab === 'STATS' && (
              <StatsView
                summary={statsSummary}
                onResetStats={() => {
                  setStatsSummary({
                    totalSessions: 0,
                    avgWpm: 0,
                    avgAccuracy: 0,
                    totalErrors: 0,
                    weakKeysFrequency: {}
                  })
                }}
              />
            )}

            {/* TAB 4: LEADERBOARD */}
            {activeTab === 'LEADERBOARD' && (
              <LeaderboardView
                lastSessionStats={
                  lastStats
                    ? {
                        wpm: lastStats.wpm,
                        accuracy: lastStats.accuracy,
                        topicTitle: currentLesson?.title || 'тренировка',
                        level: currentLesson?.level || 'B1'
                      }
                    : null
                }
              />
            )}

            {/* TAB 5: MUSIC CLIPS & LYRICS LEARNING */}
            {activeTab === 'MUSIC' && (
              <MusicClipsView
                onStartTyping={(songLesson) => {
                  setCurrentLesson(songLesson)
                  setActiveTab('PRACTICE')
                  setPracticeMode('TYPING')
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        LinguaType • AI Touch-Typing & English Grammar Trainer • ИТМО 2026
      </footer>
    </div>
  )
}

export default App
