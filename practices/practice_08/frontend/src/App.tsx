import { useState, useEffect, useCallback } from 'react'
import { Keyboard, BookOpen, BarChart3, Sparkles, Trophy, Music } from 'lucide-react'
import type { GrammarTopic, LessonData, SessionStats, UserStatsSummary, VocabularyWord } from './types'
import { api } from './services/api'
import { TopicSelector } from './components/grammar/TopicSelector'
import { TopicQuizView } from './components/grammar/TopicQuizView'
import { TypingEngine } from './components/typing/TypingEngine'
import { VocabularyView } from './components/vocabulary/VocabularyView'
import { StatsView } from './components/stats/StatsView'
import { LeaderboardView } from './components/leaderboard/LeaderboardView'
import { MusicClipsView } from './components/music/MusicClipsView'
import { AchievementsModal } from './components/achievements/AchievementsModal'
import { achievementsService } from './services/achievements'
import { weakKeysService } from './services/weakKeys'
import { LoadingState } from './components/states/LoadingState'
import { EmptyState } from './components/states/EmptyState'
import { ErrorState } from './components/states/ErrorState'
import { SuccessResult } from './components/states/SuccessResult'
import { Logo } from './components/ui/Logo'

type ActiveTab = 'PRACTICE' | 'VOCABULARY' | 'STATS' | 'LEADERBOARD' | 'MUSIC'
type PracticeMode = 'TOPICS' | 'TYPING' | 'QUIZ' | 'RESULT'

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('PRACTICE')
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('TOPICS')

  // Data states
  const [topics, setTopics] = useState<GrammarTopic[]>([])
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null)
  const [lastStats, setLastStats] = useState<SessionStats | null>(null)
  const [isNewSpeedRecord, setIsNewSpeedRecord] = useState<boolean>(false)
  const [previousBestWpm, setPreviousBestWpm] = useState<number>(0)
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

  // Achievements states
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false)
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null)

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

  // Back to topics or previous view
  const handleBackFromTyping = () => {
    if (currentLesson?.id.startsWith('music-')) {
      setActiveTab('MUSIC')
    }
    setPracticeMode('TOPICS')
  }

  // Finish typing session
  const handleFinishTyping = async (stats: SessionStats) => {
    const prevBest = weakKeysService.getBestWpm()
    setPreviousBestWpm(prevBest)
    setIsNewSpeedRecord(stats.wpm > prevBest)
    setLastStats(stats)
    weakKeysService.recordSession({
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      topicTitle: currentLesson?.title || stats.topicId
    })
    try {
      await api.saveStats(stats)
      // Refresh summary
      const updated = await api.getStatsSummary()
      setStatsSummary(updated)
    } catch {
      // Offline fallback
    }

    // Check achievements
    const newlyUnlocked = achievementsService.checkAndUnlock({
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      topicId: stats.topicId,
      isMusic: stats.topicId.startsWith('music-'),
      vocabCount: vocabulary.length
    })
    if (newlyUnlocked.length > 0) {
      setUnlockedToast(newlyUnlocked.map(a => a.title).join(', '))
      setTimeout(() => setUnlockedToast(null), 5000)
    }

    setPracticeMode('QUIZ')
  }

  // Add word to vocabulary
  const handleAddWord = async (word: { word: string; translation: string; phonetic?: string }) => {
    const added = await api.addVocabularyWord(word)
    setVocabulary(prev => [...prev, added])

    // Check vocabulary achievements
    const newly = achievementsService.checkAndUnlock({ vocabCount: vocabulary.length + 1 })
    if (newly.length > 0) {
      setUnlockedToast(newly.map(a => a.title).join(', '))
      setTimeout(() => setUnlockedToast(null), 5000)
    }
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
    <div className="min-h-screen flex flex-col bg-[#060911] bg-[radial-gradient(ellipse_85%_55%_at_50%_-10%,rgba(56,189,248,0.15),rgba(6,9,17,0)),radial-gradient(ellipse_60%_40%_at_85%_95%,rgba(99,102,241,0.06),rgba(6,9,17,0))] text-slate-100">
      {/* Top Navbar */}
      <header className="border-b border-white/[0.07] bg-[#060911]/85 backdrop-blur-2xl sticky top-0 z-40 px-6 py-2.5 shrink-0 shadow-2xl shadow-black/80">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Product Name */}
          <div 
            onClick={() => {
              setActiveTab('PRACTICE')
              setPracticeMode('TOPICS')
            }}
          >
            <Logo size="md" />
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center bg-white/[0.03] p-1 rounded-2xl border border-white/[0.06] text-xs font-medium backdrop-blur-md" aria-label="Основная навигация">
            <button
              onClick={() => {
                setActiveTab('PRACTICE')
                if (practiceMode === 'RESULT') setPracticeMode('TOPICS')
              }}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'PRACTICE'
                  ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.12]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {activeTab === 'PRACTICE' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />}
              <Keyboard className="w-3.5 h-3.5" />
              <span>Тренировка</span>
            </button>

            <button
              onClick={() => setActiveTab('VOCABULARY')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'VOCABULARY'
                  ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.12]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {activeTab === 'VOCABULARY' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />}
              <BookOpen className="w-3.5 h-3.5" />
              <span>Словарь ({vocabulary.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('STATS')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'STATS'
                  ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.12]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {activeTab === 'STATS' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />}
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Статистика</span>
            </button>

            <button
              onClick={() => setActiveTab('LEADERBOARD')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'LEADERBOARD'
                  ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.12]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              data-testid="tab-leaderboard"
            >
              {activeTab === 'LEADERBOARD' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />}
              <Trophy className="w-3.5 h-3.5" />
              <span>Лидерборд</span>
            </button>

            <button
              onClick={() => setActiveTab('MUSIC')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'MUSIC'
                  ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.12]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              data-testid="tab-music"
            >
              {activeTab === 'MUSIC' && <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />}
              <Music className="w-3.5 h-3.5" />
              <span>Клипы & Песни</span>
            </button>
          </nav>

          {/* User Score Badge & Achievements Button */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <button
              onClick={() => setIsAchievementsOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/[0.08] hover:bg-amber-500/[0.15] text-amber-300 border border-amber-500/25 transition cursor-pointer shadow-sm"
              title="Список достижений"
              data-testid="achievements-btn"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Награды ({achievementsService.getUnlockedCount()}/10)</span>
            </button>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-sky-400 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{statsSummary.avgWpm} WPM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={`w-full mx-auto flex flex-col ${activeTab === 'PRACTICE' && practiceMode === 'TYPING' ? 'flex-1 max-w-5xl px-3 py-2' : 'flex-1 max-w-6xl p-6 justify-center'}`}>
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
                      statsSummary={statsSummary}
                      onOpenMusic={() => setActiveTab('MUSIC')}
                    />
                  )
                )}

                {practiceMode === 'TYPING' && currentLesson && (
                  <TypingEngine
                    lesson={currentLesson}
                    onFinish={handleFinishTyping}
                    onBack={handleBackFromTyping}
                  />
                )}

                {practiceMode === 'QUIZ' && currentLesson && (
                  <TopicQuizView
                    lesson={currentLesson}
                    onComplete={() => setPracticeMode('RESULT')}
                    onSkip={() => setPracticeMode('RESULT')}
                    onBack={handleBackFromTyping}
                  />
                )}

                {practiceMode === 'RESULT' && lastStats && (
                  <SuccessResult
                    stats={lastStats}
                    onRepeat={() => setPracticeMode('TYPING')}
                    onNext={() => setPracticeMode('TOPICS')}
                    onOpenLeaderboard={() => setActiveTab('LEADERBOARD')}
                    isNewRecord={isNewSpeedRecord}
                    previousBestWpm={previousBestWpm}
                    onStartErrorSprint={(weakKeys, weakBigrams) => {
                      const sprintLesson = weakKeysService.buildErrorRecoverySprint(weakKeys, weakBigrams)
                      setCurrentLesson(sprintLesson)
                      setPracticeMode('TYPING')
                    }}
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
                onBack={() => setActiveTab('PRACTICE')}
              />
            )}
          </>
        )}
      </main>

      {/* Achievements Modal Dialog */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      {/* Unlocked Achievement Toast Notification */}
      {unlockedToast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-4 py-3 rounded-2xl shadow-2xl animate-bounce border border-amber-300"
          data-testid="achievement-toast"
        >
          <Trophy className="w-5 h-5 text-slate-950" />
          <div>
            <div className="text-[10px] uppercase tracking-wider font-extrabold">Новая награда!</div>
            <div className="text-xs font-bold">{unlockedToast}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        LinguaType • AI Touch-Typing & English Grammar Trainer • ИТМО 2026
      </footer>
    </div>
  )
}

export default App
