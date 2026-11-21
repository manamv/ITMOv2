import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VirtualKeyboard } from '../components/keyboard/VirtualKeyboard'
import { TopicSelector } from '../components/grammar/TopicSelector'
import { Modal } from '../components/ui/Modal'
import { WordPopover } from '../components/typing/WordPopover'
import { TypingEngine } from '../components/typing/TypingEngine'

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
})
