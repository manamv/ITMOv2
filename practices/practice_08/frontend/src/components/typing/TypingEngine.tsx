import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, Pause, RotateCcw, AlertCircle, Timer, Headphones, Eye, EyeOff } from 'lucide-react'
import type { LessonData, SessionStats } from '../../types'
import { VirtualKeyboard } from '../keyboard/VirtualKeyboard'
import { WordPopover } from './WordPopover'
import { soundService } from '../../services/sound'
import { weakKeysService } from '../../services/weakKeys'

interface TypingEngineProps {
  lesson: LessonData
  onFinish: (stats: SessionStats) => Promise<void>
}

export const TypingEngine: React.FC<TypingEngineProps> = ({
  lesson,
  onFinish
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0)
  const [typedChars, setTypedChars] = useState<string>('')
  const [errorsCount, setErrorsCount] = useState(0)
  const [sessionWeakKeys, setSessionWeakKeys] = useState<Set<string>>(new Set())
  const [startTime, setStartTime] = useState<number | null>(null)
  const [sentenceStartTime, setSentenceStartTime] = useState<number | null>(null)
  const [sentenceElapsedTime, setSentenceElapsedTime] = useState<number>(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  // Speech & Visual options
  const [speechRate, setSpeechRate] = useState<number>(1.0)
  const [wordByWordMode, setWordByWordMode] = useState<boolean>(false)
  const [showRateMenu, setShowRateMenu] = useState<boolean>(false)
  const [isTextHidden, setIsTextHidden] = useState<boolean>(false)

  const currentSentence = lesson.sentences[currentSentenceIndex] || lesson.sentences[0]
  // Normalize target text: strictly lowercase, no punctuation
  const targetText = currentSentence ? currentSentence.english.toLowerCase() : ''
  const targetWords = targetText.split(' ').filter(Boolean)

  // Double-submit prevention ref
  const submitLockRef = useRef(false)

  // Stopwatch timer for current sentence
  useEffect(() => {
    if (!sentenceStartTime || isPaused || isSubmitting) return

    const timer = setInterval(() => {
      setSentenceElapsedTime(Date.now() - sentenceStartTime)
    }, 100)

    return () => clearInterval(timer)
  }, [sentenceStartTime, isPaused, isSubmitting])

  // Word-by-word mode: pronounce the first word when sentence begins or mode activated
  useEffect(() => {
    if (wordByWordMode && typedChars.length === 0 && targetWords.length > 0) {
      soundService.speakWord(targetWords[0], speechRate)
    }
  }, [wordByWordMode, currentSentenceIndex, speechRate, targetText, typedChars.length, targetWords])

  // Format stopwatch ms as MM:SS.s
  const formatStopwatch = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const tenths = Math.floor((ms % 1000) / 100)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${tenths}`
  }

  // Play audio for full sentence
  const handlePronounce = useCallback(() => {
    soundService.speakText(targetText, speechRate)
  }, [targetText, speechRate])

  // Calculate live WPM
  const calculateWpm = (): number => {
    if (!startTime) return 0
    const minutes = Math.max(0.05, (Date.now() - startTime) / 60000)
    const wordsTyped = typedChars.length / 5
    return Math.round(wordsTyped / minutes)
  }

  // Calculate live accuracy
  const calculateAccuracy = (): number => {
    const totalHits = typedChars.length + errorsCount
    if (totalHits === 0) return 100
    const acc = Math.max(0, ((totalHits - errorsCount) / totalHits) * 100)
    return Math.round(acc * 10) / 10
  }

  // Check if there are unfixed red mistakes in typed text
  const hasUnfixedErrors = typedChars.split('').some((char, idx) => char !== targetText[idx])

  // Determine current active character for keyboard guidance
  const currentChar = typedChars.length < targetText.length
    ? targetText[typedChars.length]
    : (hasUnfixedErrors ? 'backspace' : '')

  // Handle lesson finish with strict double-submit guard
  const handleCompleteLesson = useCallback(async () => {
    if (submitLockRef.current || isSubmitting) return
    submitLockRef.current = true
    setIsSubmitting(true)

    const duration = startTime ? Math.round((Date.now() - startTime) / 1000) : 10
    const finalWpm = calculateWpm()
    const finalAccuracy = calculateAccuracy()

    const stats: SessionStats = {
      topicId: lesson.id,
      wpm: Math.max(1, finalWpm),
      accuracy: finalAccuracy,
      errors: errorsCount,
      durationSeconds: Math.max(1, duration),
      weakKeys: Array.from(sessionWeakKeys)
    }

    try {
      await onFinish(stats)
    } finally {
      setIsSubmitting(false)
      submitLockRef.current = false
    }
  }, [startTime, lesson.id, errorsCount, sessionWeakKeys, isSubmitting, onFinish])

  // Global keydown handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isSubmitting) return

      // Escape toggles pause
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev)
        return
      }

      // Ignore functional modifier keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Tab') {
        return
      }

      // Backspace handler: delete character and allow manual correction
      if (e.key === 'Backspace') {
        e.preventDefault()
        if (e.ctrlKey) {
          setTypedChars(prev => prev.replace(/\s*\S*$/, ''))
        } else {
          setTypedChars(prev => prev.slice(0, -1))
        }
        return
      }

      // Printable character
      if (e.key.length === 1) {
        e.preventDefault()
        const typedKey = e.key.toLowerCase()

        // Start stopwatch and session timers
        if (!sentenceStartTime) {
          const now = Date.now()
          setSentenceStartTime(now)
          if (!startTime) {
            setStartTime(now)
          }
        }

        // Advance typing if within sentence length
        if (typedChars.length < targetText.length) {
          const expected = targetText[typedChars.length]
          const isCorrect = typedKey === expected

          if (isCorrect) {
            soundService.playKeyClick(false)
            weakKeysService.recordKey(expected, false)
          } else {
            // Mistake: letter lights up in red, user can continue or erase with Backspace
            soundService.playKeyClick(true)
            setErrorsCount(prev => prev + 1)
            weakKeysService.recordKey(expected, true)
            setSessionWeakKeys(prev => new Set(prev).add(expected))
          }

          const newTyped = typedChars + typedKey
          setTypedChars(newTyped)

          // Word-by-word anticipatory speech: when word completes with a space, pronounce the NEXT word
          if (wordByWordMode && isCorrect && expected === ' ') {
            const finishedWords = newTyped.split(' ').filter(Boolean)
            const nextWordIndex = finishedWords.length
            if (nextWordIndex < targetWords.length) {
              soundService.speakWord(targetWords[nextWordIndex], speechRate)
            }
          }

          // Completed sentence: all characters typed and all errors corrected!
          if (newTyped.length === targetText.length && newTyped === targetText) {
            if (currentSentenceIndex + 1 < lesson.sentences.length) {
              // Advance to next sentence
              const nextIndex = currentSentenceIndex + 1
              setCurrentSentenceIndex(nextIndex)
              setTypedChars('')
              setSelectedWord(null)
              setSentenceStartTime(null)
              setSentenceElapsedTime(0)

              // Word-by-word: pronounce first word of next sentence
              if (wordByWordMode) {
                const nextSentenceObj = lesson.sentences[nextIndex]
                if (nextSentenceObj) {
                  const words = nextSentenceObj.english.toLowerCase().split(' ').filter(Boolean)
                  if (words[0]) soundService.speakWord(words[0], speechRate)
                }
              }
            } else {
              // All sentences completed!
              handleCompleteLesson()
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    isPaused,
    isSubmitting,
    typedChars,
    targetText,
    targetWords,
    currentSentenceIndex,
    lesson.sentences,
    sentenceStartTime,
    startTime,
    wordByWordMode,
    speechRate,
    handleCompleteLesson
  ])

  // Handle word selection directly inside the main text box
  const handleSelectionTranslate = () => {
    if (typeof window === 'undefined') return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const raw = sel.toString().trim().toLowerCase()
    const cleaned = raw.replace(/[^a-zA-Z'-]/g, '')
    if (cleaned.length >= 2) {
      setSelectedWord(cleaned)
    }
  }

  return (
    <div
      className="flex flex-col gap-2 max-w-5xl mx-auto w-full select-none animate-fade-in"
      data-testid="typing-engine"
    >
      {/* 1. Metrics & Control Bar (Compact, 1 Row) */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur p-2.5 rounded-2xl border border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-[11px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            {lesson.level} • {lesson.title}
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {currentSentenceIndex + 1} / {lesson.sentences.length}
          </span>
        </div>

        {/* Live Metrics: Stopwatch, WPM, Accuracy, Errors */}
        <div className="flex items-center space-x-4 font-mono text-xs">
          <div className="flex items-center space-x-1" data-testid="metric-stopwatch">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-500 text-[10px]">ВРЕМЯ</span>
            <span className="text-amber-400 font-bold">{formatStopwatch(sentenceElapsedTime)}</span>
          </div>
          <div className="flex items-center space-x-1" data-testid="metric-wpm">
            <span className="text-slate-500 text-[10px]">WPM</span>
            <span className="text-emerald-400 font-bold text-sm">{calculateWpm()}</span>
          </div>
          <div className="flex items-center space-x-1" data-testid="metric-accuracy">
            <span className="text-slate-500 text-[10px]">ТОЧНОСТЬ</span>
            <span className="text-cyan-400 font-bold text-sm">{calculateAccuracy()}%</span>
          </div>
          <div className="flex items-center space-x-1" data-testid="metric-errors">
            <span className="text-slate-500 text-[10px]">ОШИБКИ</span>
            <span className="text-rose-400 font-bold text-sm">{errorsCount}</span>
          </div>
        </div>

        {/* Controls: Audio, Speech Rate, Word-by-Word, Hide Text, Pause, Reset */}
        <div className="flex items-center space-x-1.5">
          {/* Full Sentence Pronounce */}
          <button
            onClick={handlePronounce}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
            title="Озвучить все предложение"
            aria-label="Озвучить предложение"
            data-testid="audio-pronounce-btn"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>

          {/* Speech Rate Selector */}
          <div className="relative">
            <button
              onClick={() => setShowRateMenu(m => !m)}
              className="px-2 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-emerald-400 border border-slate-700/60 transition cursor-pointer flex items-center space-x-1"
              title="Скорость озвучки"
              data-testid="speech-rate-btn"
            >
              <span>{speechRate}x</span>
            </button>

            {showRateMenu && (
              <div className="absolute top-8 right-0 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl z-50 flex flex-col gap-1 min-w-[120px] font-sans">
                {[0.75, 1.0, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeechRate(rate)
                      setShowRateMenu(false)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono text-left transition cursor-pointer ${
                      speechRate === rate
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {rate}x {rate === 1.0 ? '(обычная)' : rate < 1.0 ? '(медленно)' : '(быстро)'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Word-by-Word Audio Mode Toggle */}
          <button
            onClick={() => {
              const next = !wordByWordMode
              setWordByWordMode(next)
              if (next && typedChars.length === 0 && targetWords.length > 0) {
                soundService.speakWord(targetWords[0], speechRate)
              }
            }}
            className={`px-2 py-1 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center space-x-1 ${
              wordByWordMode
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Озвучивать каждое следующее слово после набора предыдущего"
            data-testid="word-by-word-toggle"
          >
            <Headphones className="w-3 h-3" />
            <span className="hidden sm:inline">По словам:</span>
            <span>{wordByWordMode ? 'ВКЛ' : 'ВЫКЛ'}</span>
          </button>

          {/* Text Hiding Toggle (Blind Audio Dictation Mode) */}
          <button
            onClick={() => setIsTextHidden(h => !h)}
            className={`px-2 py-1 rounded-xl text-xs font-medium border transition cursor-pointer flex items-center space-x-1 ${
              isTextHidden
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/20 font-semibold'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Скрыть текст (слепой ввод на слух / диктант)"
            data-testid="hide-text-toggle"
          >
            {isTextHidden ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
            <span className="hidden sm:inline">Текст:</span>
            <span>{isTextHidden ? 'СКРЫТ' : 'ВИДЕН'}</span>
          </button>

          {/* Pause */}
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Пауза (Esc)"
            aria-label="Пауза"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>

          {/* Reset */}
          <button
            onClick={() => {
              setTypedChars('')
              setSelectedWord(null)
              setSentenceStartTime(null)
              setSentenceElapsedTime(0)
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Сбросить предложение"
            aria-label="Сбросить предложение"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main Text Display Box (Selection-based Word Translation, No-Scroll) */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl shrink-0 space-y-2">
        {/* Word Popover for Selected Word Translation */}
        {selectedWord && (
          <WordPopover
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
          />
        )}

        {/* Russian Translation / Context */}
        <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>Перевод: «{currentSentence.russian}»</span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono hidden md:inline">
            💡 Выделите любое слово курсором мыши для перевода
          </span>
        </div>

        {/* Hidden text banner for audio dictation mode */}
        {isTextHidden && (
          <div
            className="py-1 px-2.5 flex items-center space-x-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/25 rounded-xl animate-fade-in"
            data-testid="hidden-text-banner"
          >
            <Headphones className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Режим слепого набора на слух: буквы замаскированы. Слушайте озвучку слова и печатайте по памяти!</span>
          </div>
        )}

        {/* 3-line height sentence box with text selection enabled */}
        <div
          onMouseUp={handleSelectionTranslate}
          onTouchEnd={handleSelectionTranslate}
          className="font-mono text-lg sm:text-xl tracking-wide select-text cursor-text leading-[2.3rem] min-h-[6.9rem] whitespace-pre-wrap break-words content-start pb-1"
          data-testid="typing-text-display"
        >
          {targetText.split('').map((char, idx) => {
            let charClass = 'text-slate-500' // Untyped
            let isCurrent = false
            let isError = false
            let displayChar: string = char

            if (idx < typedChars.length) {
              if (typedChars[idx] === char) {
                // Correctly typed
                charClass = 'text-emerald-400 font-medium'
                displayChar = char
              } else {
                // Mistake: letter lights up in red, user must erase with backspace to complete
                isError = true
                charClass = 'text-rose-400 bg-rose-500/30 underline decoration-rose-500 decoration-2 font-medium'
                displayChar = char === ' ' ? '␣' : char
              }
            } else if (idx === typedChars.length) {
              isCurrent = true
              charClass = 'text-white'
              displayChar = isTextHidden ? (char === ' ' ? ' ' : '•') : char
            } else {
              if (isTextHidden) {
                displayChar = char === ' ' ? ' ' : '•'
                charClass = 'text-slate-600'
              }
            }

            const isSpace = char === ' '

            return (
              <span
                key={idx}
                className={`relative ${isSpace ? 'inline' : 'inline-block'} ${charClass}`}
                data-testid={isCurrent ? 'current-char' : isError ? 'error-char' : undefined}
              >
                {isCurrent && (
                  <span className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-white animate-pulse pointer-events-none" />
                )}
                {isSpace && isError ? '␣' : (isSpace ? ' ' : displayChar)}
              </span>
            )
          })}
        </div>

        {/* Unfixed errors notice at the end */}
        {hasUnfixedErrors && typedChars.length >= targetText.length && (
          <div
            className="flex items-center space-x-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/30 px-3 py-1 rounded-xl animate-fade-in"
            data-testid="error-backspace-hint"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span>В тексте есть ошибки! Нажмите <strong>Backspace ⌫</strong>, чтобы стереть и исправить красные буквы.</span>
          </div>
        )}

        {/* Grammar Tip Bar (Without redundant bottom word pills) */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Правило: {currentSentence.grammarTip}</span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Backspace: стирание • Esc: пауза
          </span>
        </div>
      </div>

      {/* 3. Anatomical Hands Virtual Keyboard (Compact, No-Scroll) */}
      <div className="w-full shrink-0">
        <VirtualKeyboard activeChar={currentChar} />
      </div>

      {/* Double Submit Protection Indicator (when sending to server) */}
      {isSubmitting && (
        <div
          className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium animate-pulse"
          data-testid="submitting-indicator"
        >
          Сохранение результатов на сервере...
        </div>
      )}
    </div>
  )
}
