import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { VirtualKeyboard } from '../components/keyboard/VirtualKeyboard'
import { BlindTypingKeyboard } from '../components/keyboard/BlindTypingKeyboard'
import { TopicSelector } from '../components/grammar/TopicSelector'
import { Modal } from '../components/ui/Modal'
import { WordPopover } from '../components/typing/WordPopover'
import { TypingEngine } from '../components/typing/TypingEngine'
import { HandsVisualizer } from '../components/keyboard/HandsVisualizer'
import { LeaderboardView } from '../components/leaderboard/LeaderboardView'
import { MusicClipsView } from '../components/music/MusicClipsView'
import { AchievementsModal } from '../components/achievements/AchievementsModal'
import { TopicQuizView } from '../components/grammar/TopicQuizView'
import { StatsView } from '../components/stats/StatsView'
import { SuccessResult } from '../components/states/SuccessResult'
import { achievementsService } from '../services/achievements'

describe('Criterion 8: Component Rendering and User Interactions', () => {
  it('renders Virtual Keyboard with finger zones and highlights active character', () => {
    render(<VirtualKeyboard activeChar="R" />)

    // Check that keys are rendered
    expect(screen.getByTestId('key-r')).toBeInTheDocument()
    expect(screen.getByTestId('key-a')).toBeInTheDocument()
    expect(screen.getByTestId('key-space')).toBeInTheDocument()

    // Guidance text for letter R (Left index finger)
    expect(screen.getByText(/Левый указательный/i)).toBeInTheDocument()
  })

  it('renders TopicSelector and handles topic card clicks', () => {
    const handleSelect = vi.fn()
    const handleAdaptive = vi.fn()
    const dummyTopics = [
      {
        id: 'pres-perf',
        title: 'Present Perfect Practice',
        level: 'B1',
        description: 'Test grammar description',
        sentenceCount: 5
      }
    ]

    render(
      <TopicSelector
        topics={dummyTopics}
        onSelectTopic={handleSelect}
        onSelectAdaptive={handleAdaptive}
      />
    )

    // Topic card must be visible
    const card = screen.getByTestId('topic-card-pres-perf')
    expect(card).toBeInTheDocument()
    expect(screen.getByText('Present Perfect Practice')).toBeInTheDocument()

    // Click topic card
    fireEvent.click(card)
    expect(handleSelect).toHaveBeenCalledWith('pres-perf')

    // Click adaptive button
    const adaptiveBtn = screen.getByRole('button', { name: /Запустить адаптивный спринт/i })
    fireEvent.click(adaptiveBtn)
    expect(handleAdaptive).toHaveBeenCalled()
  })

  it('opens and closes WordPopover when requested', () => {
    const handleClose = vi.fn()
    render(<WordPopover word="completed" onClose={handleClose} />)

    // Popover is rendered with translation
    expect(screen.getByTestId('word-popover')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText(/завершила/i)).toBeInTheDocument()

    // Click close button
    const closeBtn = screen.getByLabelText(/Закрыть перевод/i)
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()
  })

  it('renders Modal dialog and responds to close button and Escape key', () => {
    const handleClose = vi.fn()
    const { rerender } = render(
      <Modal isOpen={true} onClose={handleClose} title="Настройки тренировки">
        <div>Modal Content</div>
      </Modal>
    )

    expect(screen.getByText('Настройки тренировки')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()

    // Click close icon
    const closeBtn = screen.getByLabelText(/Закрыть диалог/i)
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(handleClose).toHaveBeenCalledTimes(2)

    // Does not render when isOpen is false
    rerender(
      <Modal isOpen={false} onClose={handleClose} title="Настройки тренировки">
        <div>Modal Content</div>
      </Modal>
    )
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('TypingEngine: tracks stopwatch, highlights mistakes in red, moves cursor forward, and enables manual backspace', () => {
    const dummyLesson = {
      id: 'test-topic',
      title: 'test topic',
      level: 'B1',
      description: 'test description',
      sentences: [
        {
          id: 's1',
          english: 'we write clean code',
          russian: 'мы пишем чистый код',
          grammarTip: 'без знаков препинания'
        }
      ]
    }

    const onFinish = vi.fn()
    render(<TypingEngine lesson={dummyLesson} onFinish={onFinish} />)

    // Check stopwatch and 3-line text container are present
    expect(screen.getByTestId('metric-stopwatch')).toBeInTheDocument()
    expect(screen.getByTestId('typing-text-display')).toBeInTheDocument()

    // 1. Type correct first letter 'w'
    fireEvent.keyDown(window, { key: 'w' })
    expect(screen.queryByTestId('error-char')).not.toBeInTheDocument()

    // 2. Type wrong letter 'x' instead of 'e'
    // Error must light up in RED, typing moves forward!
    fireEvent.keyDown(window, { key: 'x' })
    const errorChar = screen.getByTestId('error-char')
    expect(errorChar).toBeInTheDocument()
    expect(errorChar.className).toContain('text-rose-400')

    // 3. User types further: ' ' (space)
    fireEvent.keyDown(window, { key: ' ' })

    // 4. User presses Backspace twice to erase mistake and space
    fireEvent.keyDown(window, { key: 'Backspace' })
    fireEvent.keyDown(window, { key: 'Backspace' })

    // Red error character is now erased!
    expect(screen.queryByTestId('error-char')).not.toBeInTheDocument()

    // 5. User retypes correct 'e'
    fireEvent.keyDown(window, { key: 'e' })
    expect(screen.queryByTestId('error-char')).not.toBeInTheDocument()
  })

  it('TypingEngine: non-blocking typing with errors completes sentence without requiring Backspace', async () => {
    const dummyLesson = {
      id: 'test-topic-errors',
      title: 'test topic errors',
      level: 'A1',
      description: 'test description',
      sentences: [
        {
          id: 's-err',
          english: 'cat',
          russian: 'кот',
          grammarTip: 'без знаков препинания'
        }
      ]
    }

    const onFinish = vi.fn()
    render(<TypingEngine lesson={dummyLesson} onFinish={onFinish} />)

    // Type with mistakes: 'c', 'x' (wrong!), 't'
    fireEvent.keyDown(window, { key: 'c' })
    fireEvent.keyDown(window, { key: 'x' }) // mistake instead of 'a'
    fireEvent.keyDown(window, { key: 't' })

    // Must automatically complete the lesson even with mistake
    await waitFor(() => {
      expect(onFinish).toHaveBeenCalledTimes(1)
    })
    const stats = onFinish.mock.calls[0][0]
    expect(stats.errors).toBe(1)
  })

  it('HandsVisualizer: renders Left and Right hands, highlighting active finger and target key', () => {
    // Render HandsVisualizer with activeChar 'r' (Left Index finger)
    render(<HandsVisualizer activeChar="r" activeFinger="index-l" />)

    expect(screen.getByTestId('hands-visualizer')).toBeInTheDocument()
    expect(screen.getAllByText(/Левая рука/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Правая рука/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Указательный/i).length).toBeGreaterThan(0)

    // Left index finger must be in the document
    const leftIndexFingers = screen.getAllByTestId('finger-index-l')
    expect(leftIndexFingers.length).toBeGreaterThan(0)
  })

  it('LeaderboardView: renders leaderboard table, podium and opens submit record modal', async () => {
    render(<LeaderboardView lastSessionStats={{ wpm: 85, accuracy: 99.1, topicTitle: 'present perfect', level: 'B1' }} />)

    expect(screen.getByTestId('leaderboard-view')).toBeInTheDocument()
    expect(screen.getByText('Лидерборд скоропечатания')).toBeInTheDocument()

    // Wait for leaderboard table to load
    const table = await screen.findByTestId('leaderboard-table')
    expect(table).toBeInTheDocument()

    // Click "Добавить рекорд" button
    const addBtn = screen.getByTestId('add-score-btn')
    fireEvent.click(addBtn)

    // Modal opens
    expect(screen.getByText('Сохранить свой результат в Лидерборд')).toBeInTheDocument()
    expect(screen.getByLabelText(/Ваш никнейм/i)).toBeInTheDocument()
  })

  it('TypingEngine: controls speech rate and toggles word-by-word dictation mode', () => {
    const dummyLesson = {
      id: 'test-topic',
      title: 'test topic',
      level: 'B1',
      description: 'test description',
      sentences: [
        {
          id: 's1',
          english: 'we write clean code',
          russian: 'мы пишем чистый код',
          grammarTip: 'без знаков препинания'
        }
      ]
    }

    render(<TypingEngine lesson={dummyLesson} onFinish={vi.fn()} />)

    // Check speech rate button
    const rateBtn = screen.getByTestId('speech-rate-btn')
    expect(rateBtn).toBeInTheDocument()
    expect(rateBtn).toHaveTextContent('1x')

    // Click to open rate menu
    fireEvent.click(rateBtn)
    expect(screen.getByText(/1.25x/i)).toBeInTheDocument()

    // Select 1.25x
    fireEvent.click(screen.getByText(/1.25x/i))
    expect(rateBtn).toHaveTextContent('1.25x')

    // Check word-by-word toggle button
    const wordByWordBtn = screen.getByTestId('word-by-word-toggle')
    expect(wordByWordBtn).toBeInTheDocument()
    expect(wordByWordBtn).toHaveTextContent('ВЫКЛ')

    // Toggle ON
    fireEvent.click(wordByWordBtn)
    expect(wordByWordBtn).toHaveTextContent('ВКЛ')

    // Toggle OFF
    fireEvent.click(wordByWordBtn)
    expect(wordByWordBtn).toHaveTextContent('ВЫКЛ')
  })

  it('TypingEngine: handles Esc to pause and resume, showing pause overlay and resume button', () => {
    const dummyLesson = {
      id: 'test-topic-pause',
      title: 'test topic pause',
      level: 'A1',
      description: 'test description',
      sentences: [
        {
          id: 's1',
          english: 'pause test',
          russian: 'тест паузы',
          grammarTip: 'проверка Esc'
        }
      ]
    }

    render(<TypingEngine lesson={dummyLesson} onFinish={vi.fn()} />)

    // Initially not paused
    expect(screen.queryByTestId('pause-overlay')).not.toBeInTheDocument()

    // 1. Press Escape to pause
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByTestId('pause-overlay')).toBeInTheDocument()
    expect(screen.getByText('Тренировка на паузе')).toBeInTheDocument()

    // 2. Press Escape again to resume
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('pause-overlay')).not.toBeInTheDocument()

    // 3. Click pause toggle button
    const pauseToggleBtn = screen.getByTestId('pause-toggle-btn')
    fireEvent.click(pauseToggleBtn)
    expect(screen.getByTestId('pause-overlay')).toBeInTheDocument()

    // 4. Click Resume button inside overlay
    const resumeBtn = screen.getByTestId('resume-btn')
    fireEvent.click(resumeBtn)
    expect(screen.queryByTestId('pause-overlay')).not.toBeInTheDocument()
  })

  it('TypingEngine: toggles text hiding for blind audio dictation mode and masks text', () => {
    const dummyLesson = {
      id: 'test-topic',
      title: 'test topic',
      level: 'B1',
      description: 'test description',
      sentences: [
        {
          id: 's1',
          english: 'listen and type',
          russian: 'слушай и печатай',
          grammarTip: 'слепой набор на слух'
        }
      ]
    }

    render(<TypingEngine lesson={dummyLesson} onFinish={vi.fn()} />)

    // Initially text toggle is visible with 'ВИДЕН'
    const hideBtn = screen.getByTestId('hide-text-toggle')
    expect(hideBtn).toBeInTheDocument()
    expect(hideBtn).toHaveTextContent('ВИДЕН')
    expect(screen.queryByTestId('hidden-text-banner')).not.toBeInTheDocument()

    // Toggle text hidden ON
    fireEvent.click(hideBtn)
    expect(hideBtn).toHaveTextContent('СКРЫТ')
    expect(screen.getByTestId('hidden-text-banner')).toBeInTheDocument()

    // Characters in the display box are masked with '•'
    const displayBox = screen.getByTestId('typing-text-display')
    expect(displayBox.textContent).toContain('•')

    // Toggle text hidden OFF
    fireEvent.click(hideBtn)
    expect(hideBtn).toHaveTextContent('ВИДЕН')
    expect(screen.queryByTestId('hidden-text-banner')).not.toBeInTheDocument()
  })

  it('BlindTypingKeyboard: renders keyboard and moves active finger to highlighted key', () => {
    render(<BlindTypingKeyboard activeChar="T" />)

    expect(screen.getByTestId('virtual-keyboard')).toBeInTheDocument()
    expect(screen.getByTestId('key-t')).toBeInTheDocument()
    expect(screen.getByTestId('key-space')).toBeInTheDocument()

    // Guidance text shows Left Index finger for T
    expect(screen.getByText(/Левый указательный/i)).toBeInTheDocument()
  })

  it('MusicClipsView: renders song lessons, subtitles, grammar breakdown, AI meaning, and starts typing lesson', async () => {
    const handleStartTyping = vi.fn()
    render(<MusicClipsView onStartTyping={handleStartTyping} />)

    expect(screen.getByTestId('music-clips-view')).toBeInTheDocument()
    expect(screen.getByText(/Музыкальные клипы & Разбор грамматики/i)).toBeInTheDocument()

    // Song tab for Queen
    const queenTab = await screen.findByTestId('song-tab-queen-champions')
    expect(queenTab).toBeInTheDocument()

    // Subtitles and grammar section are rendered
    expect(await screen.findByText(/Разбор правил песни/i)).toBeInTheDocument()

    // Switch to AI Meaning tab
    const aiTab = screen.getByTestId('tab-ai-meaning')
    fireEvent.click(aiTab)
    expect(await screen.findByTestId('ai-meaning-content')).toBeInTheDocument()
    expect(screen.getByText(/Главный философский посыл/i)).toBeInTheDocument()

    // Click "Начать печать песни" button
    const startBtn = await screen.findByTestId('start-music-typing-btn')
    fireEvent.click(startBtn)

    expect(handleStartTyping).toHaveBeenCalledTimes(1)
    const passedLesson = handleStartTyping.mock.calls[0][0]
    expect(passedLesson.title).toContain('Queen')
    expect(passedLesson.sentences.length).toBeGreaterThan(0)
  })

  it('TypingEngine: selecting a word in text box triggers inline translation popover', async () => {
    const lesson = {
      id: 'pres-perf',
      title: 'Present Perfect',
      level: 'B1',
      description: 'Practice',
      sentences: [
        {
          id: 's1',
          english: 'she has completed the database report',
          russian: 'Она завершила отчет по базе данных'
        }
      ]
    }

    render(<TypingEngine lesson={lesson} onFinish={vi.fn()} onBack={vi.fn()} />)

    const textDisplay = screen.getByTestId('typing-text-display')
    expect(textDisplay).toBeInTheDocument()

    // Mock window.getSelection returning selected word
    const originalGetSelection = window.getSelection
    window.getSelection = vi.fn().mockReturnValue({
      isCollapsed: false,
      toString: () => 'database'
    } as unknown as Selection)

    fireEvent.mouseUp(textDisplay)

    // WordPopover appears with translated word
    expect(await screen.findByTestId('word-popover')).toBeInTheDocument()
    expect(screen.getByText(/база данных/i)).toBeInTheDocument()

    window.getSelection = originalGetSelection
  })

  it('TopicQuizView: displays grammar checkpoint questions, selects option, shows explanations, and completes quiz', async () => {
    const handleComplete = vi.fn()
    const handleSkip = vi.fn()
    const lesson = {
      id: 'pres-perf',
      title: 'Present Perfect',
      level: 'B1',
      description: 'Practice',
      sentences: [
        {
          id: 's1',
          english: 'she has completed the report',
          russian: 'Она завершила отчет'
        }
      ]
    }

    render(
      <TopicQuizView
        lesson={lesson}
        onComplete={handleComplete}
        onSkip={handleSkip}
      />
    )

    expect(screen.getByTestId('topic-quiz-view')).toBeInTheDocument()
    expect(screen.getByText(/Проверочный тест по грамматике/i)).toBeInTheDocument()

    // Select option 0 (has completed - correct answer)
    const opt0 = screen.getByTestId('quiz-option-0')
    fireEvent.click(opt0)

    // Rule explanation shows up
    expect(screen.getByText(/Правило:/i)).toBeInTheDocument()

    // Next question
    const nextBtn = screen.getByTestId('quiz-next-btn')
    fireEvent.click(nextBtn)

    // Can skip quiz directly to finish
    const skipBtn = screen.getByTestId('skip-quiz-btn')
    fireEvent.click(skipBtn)
    expect(handleSkip).toHaveBeenCalledTimes(1)
  })

  it('AchievementsModal: renders progress bar, categories, and responds to close button', () => {
    const handleClose = vi.fn()
    const { rerender } = render(<AchievementsModal isOpen={true} onClose={handleClose} />)

    expect(screen.getByTestId('achievements-modal')).toBeInTheDocument()
    expect(screen.getByText(/Достижения & Награды/i)).toBeInTheDocument()
    expect(screen.getByText(/Общий прогресс разблокировки/i)).toBeInTheDocument()

    // Filter categories
    expect(screen.getByText(/⚡ Скорость/i)).toBeInTheDocument()
    expect(screen.getByText(/🎯 Точность/i)).toBeInTheDocument()

    // Click close button
    const closeBtn = screen.getByLabelText(/Закрыть достижения/i)
    fireEvent.click(closeBtn)
    expect(handleClose).toHaveBeenCalled()

    // Doesn't render when isOpen is false
    rerender(<AchievementsModal isOpen={false} onClose={handleClose} />)
    expect(screen.queryByTestId('achievements-modal')).not.toBeInTheDocument()
  })

  it('achievementsService: checks and unlocks achievements based on performance', () => {
    const unlocked = achievementsService.checkAndUnlock({
      wpm: 92,
      accuracy: 100,
      errors: 0,
      topicId: 'c1-inversion'
    })

    expect(unlocked.length).toBeGreaterThan(0)
    expect(achievementsService.getUnlockedCount()).toBeGreaterThan(0)
  })

  it('TopicQuizView: clicking any word in the quiz question opens inline WordPopover with translation', async () => {
    const lesson = {
      id: 'pres-perf',
      title: 'present perfect vs past simple',
      level: 'B1',
      description: 'Test',
      sentences: []
    }
    render(<TopicQuizView lesson={lesson} onComplete={vi.fn()} onSkip={vi.fn()} />)

    // Click the word "database" inside the quiz sentence
    const wordEl = screen.getByTestId('quiz-word-database')
    fireEvent.click(wordEl)

    const popover = await screen.findByTestId('word-popover')
    expect(popover).toBeInTheDocument()
    expect(popover).toHaveTextContent('база данных')
  })

  it('TopicSelector: filters topics using instant search input', () => {
    const topics = [
      { id: 'a1-articles', title: 'articles a an the', level: 'A1', description: 'артикли', sentenceCount: 3 },
      { id: 'c1-mixed-cond', title: 'mixed conditionals', level: 'C1', description: 'смешанные условные', sentenceCount: 3 }
    ]
    render(<TopicSelector topics={topics} onSelectTopic={vi.fn()} onSelectAdaptive={vi.fn()} />)

    const searchInput = screen.getByTestId('topic-search-input')
    fireEvent.change(searchInput, { target: { value: 'mixed' } })

    expect(screen.getByTestId('topic-card-c1-mixed-cond')).toBeInTheDocument()
    expect(screen.queryByTestId('topic-card-a1-articles')).not.toBeInTheDocument()
  })

  it('TypingEngine: Back button calls onBack callback', () => {
    const handleBack = vi.fn()
    const lesson = {
      id: 'a1-articles',
      title: 'articles a an the',
      level: 'A1',
      description: 'Test',
      sentences: [{ id: 's1', english: 'clean code', russian: 'чистый код' }]
    }
    render(<TypingEngine lesson={lesson} onFinish={vi.fn()} onBack={handleBack} />)

    fireEvent.click(screen.getByTestId('typing-back-btn'))
    expect(handleBack).toHaveBeenCalledTimes(1)
  })

  it('StatsView: renders WPM/Accuracy progress SVG chart and switches metrics', () => {
    render(
      <StatsView
        summary={{ totalSessions: 5, avgWpm: 68, avgAccuracy: 97.5, totalErrors: 8, weakKeys: ['r'] }}
      />
    )
    expect(screen.getByTestId('progress-chart-card')).toBeInTheDocument()
    const accBtn = screen.getByTestId('chart-toggle-accuracy')
    fireEvent.click(accBtn)
    expect(screen.getByText(/График прогресса по сессиям/i)).toBeInTheDocument()
  })

  it('SuccessResult: renders AI error analysis and triggers one-click error recovery sprint', () => {
    const handleSprint = vi.fn()
    render(
      <SuccessResult
        stats={{ topicId: 'pres-perf', wpm: 64, accuracy: 92, errors: 4, durationSeconds: 45, weakKeys: ['t', 'h'] }}
        onRepeat={vi.fn()}
        onNext={vi.fn()}
        onStartErrorSprint={handleSprint}
      />
    )
    expect(screen.getByTestId('ai-error-analysis')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('start-error-sprint-btn'))
    expect(handleSprint).toHaveBeenCalledTimes(1)
  })

  it('MusicClipsView: enables click-to-translate on karaoke lyrics and opens WordPopover', async () => {
    render(<MusicClipsView onStartTyping={vi.fn()} />)
    const translateToggle = await screen.findByTestId('lyrics-translate-mode-btn')
    fireEvent.click(translateToggle)

    const lyricWord = await screen.findByTestId('lyric-word-1-dues')
    fireEvent.click(lyricWord)

    const popover = await screen.findByTestId('word-popover')
    expect(popover).toBeInTheDocument()
    expect(popover).toHaveTextContent(/долги/i)
  })

  it('SuccessResult: shows new speed record badge and confetti fireworks when personal WPM record is beaten', () => {
    render(
      <SuccessResult
        stats={{ topicId: 'pres-perf', wpm: 95, accuracy: 99, errors: 0, durationSeconds: 32, weakKeys: [] }}
        onRepeat={vi.fn()}
        onNext={vi.fn()}
        isNewRecord={true}
        previousBestWpm={74}
      />
    )
    expect(screen.getByTestId('new-record-badge')).toHaveTextContent(/\+21 WPM/i)
    expect(screen.getByTestId('confetti-celebration')).toBeInTheDocument()
  })

  it('TopicQuizView: wrong answer displays explanation for both wrong and correct options', () => {
    const lesson = {
      id: 'pres-perf',
      title: 'present perfect vs past simple',
      level: 'B1',
      description: 'Test',
      sentences: []
    }
    render(<TopicQuizView lesson={lesson} onComplete={vi.fn()} onSkip={vi.fn()} />)

    // Option 1 ("completed") is wrong for question 1 (correct is option 0 "has completed")
    fireEvent.click(screen.getByTestId('quiz-option-1'))

    const feedback = screen.getByTestId('quiz-feedback-card')
    expect(feedback).toHaveTextContent(/Почему «completed» не подходит/i)
    expect(feedback).toHaveTextContent(/Правильный вариант — «has completed»/i)
  })
})
