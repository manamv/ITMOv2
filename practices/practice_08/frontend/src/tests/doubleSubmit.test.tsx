import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SuccessResult } from '../components/states/SuccessResult'
import { VocabularyView } from '../components/vocabulary/VocabularyView'

describe('Criterion 7: Double-Submit Prevention', () => {
  it('prevents multiple submissions when action button is clicked repeatedly during pending state', async () => {
    let resolveCall: () => void = () => {}
    const slowOnNext = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveCall = resolve
      })
    })

    const dummyStats = {
      topicId: 'test-topic',
      wpm: 75,
      accuracy: 98.5,
      errors: 1,
      durationSeconds: 45,
      weakKeys: ['p']
    }

    render(
      <SuccessResult
        stats={dummyStats}
        onRepeat={vi.fn()}
        onNext={slowOnNext}
      />
    )

    const nextBtn = screen.getByTestId('next-lesson-btn')
    expect(nextBtn).toBeEnabled()

    // First click inside act
    await act(async () => {
      fireEvent.click(nextBtn)
    })
    expect(slowOnNext).toHaveBeenCalledTimes(1)

    // Button should now be disabled while pending
    expect(nextBtn).toBeDisabled()

    // Second and third rapid clicks while request is pending
    await act(async () => {
      fireEvent.click(nextBtn)
      fireEvent.click(nextBtn)
    })

    // Ensure it was still only called ONCE
    expect(slowOnNext).toHaveBeenCalledTimes(1)

    // Resolve pending promise
    await act(async () => {
      resolveCall()
    })
  })

  it('disables submit button and prevents duplicate add-word requests during pending async call', async () => {
    const user = userEvent.setup()
    let resolveAdd: () => void = () => {}
    const slowAdd = vi.fn().mockImplementation(() => {
      return new Promise<void>((resolve) => {
        resolveAdd = resolve
      })
    })

    render(
      <VocabularyView
        words={[]}
        onAddWord={slowAdd}
        onDeleteWord={vi.fn()}
        onStartVocabularyPractice={vi.fn()}
      />
    )

    const wordInput = screen.getByLabelText(/Английское слово/i)
    const translationInput = screen.getByLabelText(/Перевод на русский/i)
    const submitBtn = screen.getByTestId('submit-word-btn')

    await user.type(wordInput, 'thoroughly')
    await user.type(translationInput, 'тщательно')

    // Click submit inside act
    await act(async () => {
      fireEvent.click(submitBtn)
    })
    expect(slowAdd).toHaveBeenCalledTimes(1)

    // Submit button must be disabled during submission
    expect(submitBtn).toBeDisabled()

    // Additional clicks while pending
    await act(async () => {
      fireEvent.click(submitBtn)
      fireEvent.click(submitBtn)
    })

    // Must strictly be called only once
    expect(slowAdd).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveAdd()
    })
  })
})

