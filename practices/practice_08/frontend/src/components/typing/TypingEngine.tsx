import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Volume2, Pause, RotateCcw, AlertCircle } from 'lucide-react'
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
  const [isPaused, setIsPaused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const currentSentence = lesson.sentences[currentSentenceIndex] || lesson.sentences[0]
  const targetText = currentSentence ? currentSentence.english : ''
  const currentChar = targetText[typedChars.length] || ''

  // Double-submit prevention ref
  const submitLockRef = useRef(false)

  // Start timer on first keystroke
  const ensureTimerStarted = useCallback(() => {
    if (!startTime) {
      setStartTime(Date.now())
    }
  }, [startTime])

  // Play audio on sentence switch or button click
  const handlePronounce = useCallback(() => {
    soundService.speakText(targetText)
  }, [targetText])

  // Calculate live WPM
  const calculateWpm = (): number => {
    if (!startTime) return 0
    const minutes = Math.max(0.05, (Date.now() - startTime) / 60000)
    const wordsTyped = (typedChars.length) / 5
    return Math.round(wordsTyped / minutes)
  }

  // Calculate live accuracy
  const calculateAccuracy = (): number => {
    const totalHits = typedChars.length + errorsCount
    if (totalHits === 0) return 100
    const acc = Math.max(0, ((totalHits - errorsCount) / totalHits) * 100)
    return Math.round(acc * 10) / 10
  }

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

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isSubmitting) return

      // Escape toggles pause
      if (e.key === 'Escape') {
        setIsPaused(prev => !prev)
        return
      }

      // Ignore functional keys
      if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || e.key === 'Tab') {
        return
      }

      // Backspace handler
      if (e.key === 'Backspace') {
        e.preventDefault()
        setTypedChars(prev => prev.slice(0, -1))
        return
      }

      if (e.key.length === 1) {
        e.preventDefault()
        ensureTimerStarted()

        const expected = currentChar
        if (e.key === expected) {
          // Correct character
          soundService.playKeyClick(false)
          weakKeysService.recordKey(expected, false)
          const newTyped = typedChars + e.key
          setTypedChars(newTyped)

          // Completed this sentence?
          if (newTyped.length === targetText.length) {
            if (currentSentenceIndex + 1 < lesson.sentences.length) {
              // Advance to next sentence
              setCurrentSentenceIndex(prev => prev + 1)
              setTypedChars('')
              setSelectedWord(null)
            } else {
              // All sentences completed!
              handleCompleteLesson()
            }
          }
        } else {
          // Mistake!
          soundService.playKeyClick(true)
          setErrorsCount(prev => prev + 1)
          weakKeysService.recordKey(expected, true)
          setSessionWeakKeys(prev => new Set(prev).add(expected.toLowerCase()))
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPaused, isSubmitting, typedChars, currentChar, targetText, currentSentenceIndex, lesson.sentences.length, ensureTimerStarted, handleCompleteLesson])

  // Split sentence into words for interactive translation popovers
  const words = targetText.split(' ')

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full animate-fade-in" data-testid="typing-engine">
      {/* Metrics & Control Bar */}
      <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            {lesson.level} • {lesson.title}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {currentSentenceIndex + 1} / {lesson.sentences.length}
          </span>
        </div>

        {/* Live Metrics */}
        <div className="flex items-center space-x-6 font-mono text-sm">
          <div className="flex items-center space-x-1.5" data-testid="metric-wpm">
            <span className="text-slate-500 text-xs">WPM</span>
            <span className="text-emerald-400 font-bold text-lg">{calculateWpm()}</span>
          </div>
          <div className="flex items-center space-x-1.5" data-testid="metric-accuracy">
            <span className="text-slate-500 text-xs">ТОЧНОСТЬ</span>
            <span className="text-cyan-400 font-bold text-lg">{calculateAccuracy()}%</span>
          </div>
          <div className="flex items-center space-x-1.5" data-testid="metric-errors">
            <span className="text-slate-500 text-xs">ОШИБКИ</span>
            <span className="text-rose-400 font-bold text-lg">{errorsCount}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePronounce}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
            title="Озвучить предложение"
            aria-label="Озвучить предложение"
          >
            <Volume2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused(p => !p)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Пауза (Esc)"
            aria-label="Пауза"
          >
            <Pause className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setTypedChars('')
              setSelectedWord(null)
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            title="Сбросить предложение"
            aria-label="Сбросить предложение"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Text Display Box */}
      <div className="relative p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl">
        {/* Word Popover for Translation */}
        {selectedWord && (
          <WordPopover
            word={selectedWord}
            onClose={() => setSelectedWord(null)}
          />
        )}

        {/* Context / Translation Hint */}
        <div className="text-xs font-medium text-slate-400 mb-3 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>Перевод: «{currentSentence.russian}»</span>
        </div>

        {/* Interactive Sentence Words */}
        <div className="font-mono text-2xl tracking-wide select-none leading-relaxed min-h-[70px]">
          {/* Render target with typed states */}
          {targetText.split('').map((char, idx) => {
            let charClass = 'text-slate-500' // Untyped
            let isCurrent = false

            if (idx < typedChars.length) {
              charClass = 'text-emerald-400' // Correctly typed
            } else if (idx === typedChars.length) {
              isCurrent = true
              charClass = 'text-white bg-emerald-500/20 px-0.5 rounded border-b-2 border-emerald-400'
            }

            return (
              <span
                key={idx}
                className={`${charClass} ${isCurrent ? 'animate-pulse' : ''}`}
                data-testid={isCurrent ? 'current-char' : undefined}
              >
                {char}
              </span>
            )
          })}
        </div>

        {/* Word click hint & Grammar Tip */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/80 gap-2">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <AlertCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Правило: {currentSentence.grammarTip}</span>
          </div>

          {/* Clickable word tokens for translation */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 mr-1">Слова:</span>
            {words.map((w, i) => (
              <button
                key={i}
                onClick={() => setSelectedWord(w)}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 transition cursor-pointer"
                aria-label={`Перевод слова ${w}`}
              >
                {w.replace(/[^a-zA-Z]/g, '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Keyboard */}
      <VirtualKeyboard activeChar={currentChar} />

      {/* Double Submit Protection Indicator (when sending to server) */}
      {isSubmitting && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center font-medium animate-pulse" data-testid="submitting-indicator">
          Сохранение результатов на сервере...
        </div>
      )}
    </div>
  )
}
