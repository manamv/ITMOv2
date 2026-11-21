import React, { useState } from 'react'
import { CheckCircle2, XCircle, ArrowRight, Sparkles, BookOpen, SkipForward, ArrowLeft } from 'lucide-react'
import type { LessonData } from '../../types'

interface QuizQuestion {
  id: string
  sentence: string
  translation: string
  options: string[]
  correctIndex: number
  ruleExplanation: string
}

interface TopicQuizViewProps {
  lesson: LessonData
  onComplete: (quizScore: { correct: number; total: number }) => void
  onSkip: () => void
  onBack?: () => void
}

// Curated question banks for grammar topics
const QUIZ_BANKS: Record<string, QuizQuestion[]> = {
  'pres-perf': [
    {
      id: 'pp-1',
      sentence: 'She _____ the quarterly database report already, so the deploy can begin.',
      translation: 'Она уже завершила квартальный отчет по базе данных, так что деплой может начаться.',
      options: ['has completed', 'completed', 'is completing', 'will complete'],
      correctIndex: 0,
      ruleExplanation: 'Маркер «already» указывает на действие с результатом в настоящем: have/has + V3 (Present Perfect).'
    },
    {
      id: 'pp-2',
      sentence: 'The engineers _____ the automated pipeline last Tuesday afternoon.',
      translation: 'Инженеры развернули автоматический пайплайн в прошлый вторник днем.',
      options: ['have launched', 'launched', 'were launched', 'had launched'],
      correctIndex: 1,
      ruleExplanation: 'Точное указание времени в прошлом («last Tuesday») строго требует Past Simple (launched).'
    },
    {
      id: 'pp-3',
      sentence: '_____ you ever refactored a legacy distributed system under high workload?',
      translation: 'Вы когда-нибудь рефакторили распределенную систему под высокой нагрузкой?',
      options: ['Did', 'Were', 'Have', 'Do'],
      correctIndex: 2,
      ruleExplanation: 'Вопрос о жизненном опыте со словом «ever» строится в Present Perfect: Have you ever + V3.'
    }
  ],
  'cond-2': [
    {
      id: 'c2-1',
      sentence: 'If I _____ more free time, I would learn three new programming languages.',
      translation: 'Если бы у меня было больше времени, я бы учил три новых языка.',
      options: ['have', 'had', 'would have', 'had had'],
      correctIndex: 1,
      ruleExplanation: 'Second Conditional (нереальное настоящее): в придаточном с If используется Past Simple (had).'
    },
    {
      id: 'c2-2',
      sentence: 'If we had tested the edge cases yesterday, the outage _____ not have happened.',
      translation: 'Если бы мы протестировали граничные случаи вчера, сбоя бы не произошло.',
      options: ['would', 'will', 'did', 'had'],
      correctIndex: 0,
      ruleExplanation: 'Third Conditional (сожаление о прошлом): формула if + had V3, would + have V3.'
    }
  ],
  'pass-voice': [
    {
      id: 'pv-1',
      sentence: 'All incoming API requests _____ continuously by our security stack.',
      translation: 'Все входящие API запросы непрерывно проверяются стеком безопасности.',
      options: ['are inspected', 'inspected', 'are inspecting', 'have inspected'],
      correctIndex: 0,
      ruleExplanation: 'Present Simple Passive: подлежащее во множественном числе (requests) + are + V3 (inspected).'
    },
    {
      id: 'pv-2',
      sentence: 'The database migration _____ by the release manager yesterday.',
      translation: 'Миграция базы данных была выполнена релиз-менеджером вчера.',
      options: ['was executed', 'is executed', 'executed', 'has executed'],
      correctIndex: 0,
      ruleExplanation: 'Past Simple Passive: событие в прошлом (yesterday) в единственном числе: was executed.'
    }
  ],
  'past-continuous': [
    {
      id: 'pc-1',
      sentence: 'While the team _____ the server, a network timeout suddenly occurred.',
      translation: 'Пока команда настраивала сервер, внезапно произошел тайм-аут сети.',
      options: ['was configuring', 'configured', 'has configured', 'had configured'],
      correctIndex: 0,
      ruleExplanation: 'Длительное фоновое действие в прошлом с союзом While выражается через Past Continuous (was configuring).'
    }
  ],
  'c1-inversion': [
    {
      id: 'inv-1',
      sentence: 'Seldom _____ such an efficient distributed message queue.',
      translation: 'Редко когда мы видели столь эффективную очередь сообщений.',
      options: ['we have seen', 'have we seen', 'we saw', 'did we saw'],
      correctIndex: 1,
      ruleExplanation: 'Инверсия: после отрицательного наречия Seldom вспомогательный глагол выносится перед подлежащим (have we seen).'
    }
  ]
}

// Generic default fallback questions for other topics
const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'def-1',
    sentence: 'Good software architecture _____ long-term maintainability and speed.',
    translation: 'Качественная архитектура ПО обеспечивает долгосрочную поддерживаемость и скорость.',
    options: ['ensures', 'ensure', 'is ensure', 'ensuring'],
    correctIndex: 0,
    ruleExplanation: 'В Present Simple для третьего лица единственного числа к глаголу добавляется окончание -s.'
  },
  {
    id: 'def-2',
    sentence: 'Before deploying the update, the engineers _____ all automated tests.',
    translation: 'Перед деплоем обновления инженеры запустили все автоматические тесты.',
    options: ['had executed', 'executes', 'has executed', 'are executing'],
    correctIndex: 0,
    ruleExplanation: 'Действие, предшествующее другому моменту в прошлом, выражается через Past Perfect (had executed).'
  }
]

export const TopicQuizView: React.FC<TopicQuizViewProps> = ({
  lesson,
  onComplete,
  onSkip,
  onBack
}) => {
  const questions = QUIZ_BANKS[lesson.id] || DEFAULT_QUESTIONS
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0)
  const [isQuizFinished, setIsQuizFinished] = useState(false)

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
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setIsQuizFinished(true)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#090d16]/95 border border-white/[0.08] shadow-2xl shadow-black/80 space-y-6 animate-fade-in" data-testid="topic-quiz-view">
      {/* Quiz Header */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
              title="Вернуться к темам"
              data-testid="quiz-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/10">
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
            <div className="flex justify-between text-xs font-mono text-slate-400">
              <span>Вопрос {currentIndex + 1} из {questions.length}</span>
              <span>Правильно: {correctAnswersCount}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#101828] overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Prompt Card */}
          <div className="p-5 rounded-2xl bg-[#0a0f1d] border border-[#1e2c4a] space-y-2">
            <div className="font-mono text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentQ.sentence}
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

              let btnStyle = 'bg-[#101828] border-[#1e2c4a] text-slate-200 hover:border-sky-500/50 hover:bg-[#142340]'
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 font-semibold shadow-lg shadow-emerald-500/10'
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-300 font-semibold'
                } else {
                  btnStyle = 'bg-[#0a0f1d] border-[#16233d] text-slate-500 opacity-50'
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3.5 rounded-xl border text-left font-mono text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  data-testid={`quiz-option-${idx}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-lg bg-[#0a0f1d] border border-[#1e2c4a] text-xs flex items-center justify-center font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
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
            <div className="p-4 rounded-2xl bg-[#0a0f1d] border border-[#1e2c4a] space-y-3 animate-fade-in">
              <div className="text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span><strong>Правило:</strong> {currentQ.ruleExplanation}</span>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center space-x-1.5 cursor-pointer"
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
          <div className="w-16 h-16 rounded-3xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto shadow-xl shadow-sky-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white">Тест успешно завершён!</h3>
            <p className="text-xs text-slate-400">
              Вы ответили правильно на <strong className="text-sky-400">{correctAnswersCount} из {questions.length}</strong> вопросов ({Math.round((correctAnswersCount / questions.length) * 100)}%).
            </p>
          </div>

          <button
            onClick={() => onComplete({ correct: correctAnswersCount, total: questions.length })}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-600 hover:from-sky-300 hover:to-indigo-500 text-slate-950 font-bold text-sm shadow-xl transition-all inline-flex items-center space-x-2 cursor-pointer"
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
