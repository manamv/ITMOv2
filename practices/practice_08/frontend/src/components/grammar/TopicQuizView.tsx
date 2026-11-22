import React, { useState } from 'react'
import { CheckCircle2, XCircle, ArrowRight, Sparkles, BookOpen, SkipForward, ArrowLeft, Languages } from 'lucide-react'
import type { LessonData } from '../../types'
import { QUIZ_BANKS, DEFAULT_QUIZ_QUESTIONS } from '../../data/quizBanks'
import { WordPopover } from '../typing/WordPopover'
import { useWordSelection } from '../../hooks/useWordSelection'
import { normalizeEnglishWord } from '../../utils/dictionary'

interface TopicQuizViewProps {
  lesson: LessonData
  onComplete: (quizScore: { correct: number; total: number }) => void
  onSkip: () => void
  onBack?: () => void
}

export const TopicQuizView: React.FC<TopicQuizViewProps> = ({
  lesson,
  onComplete,
  onSkip,
  onBack
}) => {
  const questions = QUIZ_BANKS[lesson.id] || DEFAULT_QUIZ_QUESTIONS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [isQuizFinished, setIsQuizFinished] = useState(false)

  const { selectedWord, handleTextSelection, selectWord, clearSelectedWord } = useWordSelection()

  const currentQ = questions[currentIndex]

  const handleSelectOption = (index: number) => {
    if (isAnswered) return
    setSelectedOption(index)
    setIsAnswered(true)

    if (index === currentQ.correctIndex) {
      setCorrectAnswersCount(prev => prev + 1)
    }
  }

  const handleNext = () => {
    clearSelectedWord()
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setIsQuizFinished(true)
    }
  }

  // Render English sentence with clickable words for instant translation
  const renderInteractiveSentence = (sentence: string) => {
    const tokens = sentence.split(/(\s+)/)
    return tokens.map((token, idx) => {
      if (/^\s+$/.test(token)) {
        return <span key={idx}>{token}</span>
      }
      if (token.includes('___')) {
        return (
          <span
            key={idx}
            className="inline-block px-2 mx-0.5 rounded-lg bg-sky-500/10 border border-sky-400/30 text-sky-400 font-bold"
          >
            {token}
          </span>
        )
      }
      const cleaned = normalizeEnglishWord(token)
      const isClickable = cleaned.length >= 2
      const isHighlighted = selectedWord === cleaned

      if (!isClickable) {
        return <span key={idx}>{token}</span>
      }

      return (
        <span
          key={idx}
          onClick={(e) => {
            e.stopPropagation()
            selectWord(token)
          }}
          className={`cursor-pointer rounded px-0.5 transition-colors ${
            isHighlighted
              ? 'bg-sky-400/25 text-sky-200 underline decoration-sky-400'
              : 'hover:bg-white/[0.08] hover:text-sky-300'
          }`}
          title="Нажмите, чтобы посмотреть перевод"
          data-testid={`quiz-word-${cleaned}`}
        >
          {token}
        </span>
      )
    })
  }

  return (
    <div
      className="relative w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090d16]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80 space-y-6 animate-fade-in"
      data-testid="topic-quiz-view"
      onMouseUp={handleTextSelection}
    >
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer active:scale-95"
              title="Вернуться к темам"
              data-testid="quiz-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 font-bold">
              Проверочный тест по грамматике • {lesson.level}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {lesson.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition cursor-pointer"
          title="Пропустить тест"
          data-testid="skip-quiz-btn"
        >
          <span>Пропустить</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </div>

      {!isQuizFinished ? (
        <>
          {/* Progress Indicator */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono text-slate-400">
              <span>Вопрос {currentIndex + 1} из {questions.length}</span>
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-sans">
                <Languages className="w-3.5 h-3.5 text-sky-400/80" />
                <span>Нажмите на любое слово для перевода</span>
              </span>
              <span className="text-sky-400 font-semibold">Правильно: {correctAnswersCount}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Prompt Card with Inline Word Popover */}
          <div className="relative p-5 rounded-2xl bg-[#050810] border border-white/[0.08] space-y-2.5 shadow-inner">
            {selectedWord && (
              <WordPopover
                word={selectedWord}
                onClose={clearSelectedWord}
                className="absolute -top-20 left-1/2 -translate-x-1/2"
              />
            )}

            <div
              className="font-mono text-base sm:text-lg font-semibold text-white leading-relaxed select-text"
              data-testid="quiz-question-sentence"
            >
              {renderInteractiveSentence(currentQ.sentence)}
            </div>
            <div className="text-xs text-slate-400">
              «{currentQ.translation}»
            </div>
          </div>

          {/* Multiple Choice Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx
              const isCorrect = idx === currentQ.correctIndex

              let btnStyle =
                'bg-white/[0.03] border-white/[0.07] text-slate-200 hover:border-sky-400/40 hover:bg-white/[0.06]'
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle =
                    'bg-emerald-500/15 border-emerald-400/50 text-emerald-300 font-semibold shadow-lg shadow-emerald-500/10'
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/15 border-rose-400/50 text-rose-300 font-semibold'
                } else {
                  btnStyle = 'bg-white/[0.015] border-white/[0.04] text-slate-500 opacity-50'
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-xl border text-left font-mono text-sm transition-all flex items-center justify-between cursor-pointer active:scale-[0.99] ${btnStyle}`}
                  data-testid={`quiz-option-${idx}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#050810] border border-white/[0.08] text-xs flex items-center justify-center font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="select-text">{opt}</span>
                  </div>

                  {isAnswered && (
                    <div>
                      {isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isSelected ? (
                        <XCircle className="w-5 h-5 text-rose-400" />
                      ) : null}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Rule Feedback & Next Button */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-[#050810] border border-white/[0.08] space-y-3 animate-fade-in">
              <div className="text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Правило:</strong> {currentQ.ruleExplanation}
                </span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-lg shadow-sky-500/20 transition-all flex items-center space-x-1.5 cursor-pointer active:scale-[0.98]"
                  data-testid="quiz-next-btn"
                >
                  <span>{currentIndex + 1 < questions.length ? 'Следующий вопрос' : 'Посмотреть результат'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Quiz Finished Scoreboard */
        <div className="text-center py-6 space-y-5 animate-fade-in" data-testid="quiz-summary">
          <div className="w-16 h-16 rounded-3xl bg-sky-500/15 border border-sky-400/30 text-sky-400 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Тест успешно завершён!</h3>
            <p className="text-xs text-slate-400">
              Вы ответили правильно на{' '}
              <strong className="text-sky-400">
                {correctAnswersCount} из {questions.length}
              </strong>{' '}
              вопросов ({Math.round((correctAnswersCount / questions.length) * 100)}%).
            </p>
          </div>

          <button
            onClick={() => onComplete({ correct: correctAnswersCount, total: questions.length })}
            className="px-6 py-3 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all inline-flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
            data-testid="quiz-finish-btn"
          >
            <span>Перейти к итоговому скорборду скорости</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}
