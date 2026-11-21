import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { VocabularyView } from '../components/vocabulary/VocabularyView'

describe('Criterion 9: Form Validation and Error Messages', () => {
  it('validates empty required fields and shows clear error messages', async () => {
    const handleAdd = vi.fn()
    render(
      <VocabularyView
        words={[]}
        onAddWord={handleAdd}
        onDeleteWord={vi.fn()}
        onStartVocabularyPractice={vi.fn()}
      />
    )

    const submitBtn = screen.getByTestId('submit-word-btn')

    // Submit with empty inputs
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    // Should display validation error
    const errorAlert = screen.getByTestId('form-error')
    expect(errorAlert).toBeInTheDocument()
    expect(errorAlert).toHaveTextContent(/Поле «Английское слово» обязательно для заполнения/i)
    expect(handleAdd).not.toHaveBeenCalled()
  })

  it('rejects non-English characters in the word field with an error message', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn()

    render(
      <VocabularyView
        words={[]}
        onAddWord={handleAdd}
        onDeleteWord={vi.fn()}
        onStartVocabularyPractice={vi.fn()}
      />
    )

    const wordInput = screen.getByLabelText(/Английское слово/i)
    const submitBtn = screen.getByTestId('submit-word-btn')

    // Type Russian letters into the English word input
    await user.type(wordInput, 'Привет123')
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    const errorAlert = screen.getByTestId('form-error')
    expect(errorAlert).toHaveTextContent(/Слово должно содержать только английские буквы/i)
    expect(handleAdd).not.toHaveBeenCalled()
  })

  it('requires the translation field when the word field is filled', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn()

    render(
      <VocabularyView
        words={[]}
        onAddWord={handleAdd}
        onDeleteWord={vi.fn()}
        onStartVocabularyPractice={vi.fn()}
      />
    )

    const wordInput = screen.getByLabelText(/Английское слово/i)
    const submitBtn = screen.getByTestId('submit-word-btn')

    await user.type(wordInput, 'occurrence')
    await act(async () => {
      fireEvent.click(submitBtn)
    })

    const errorAlert = screen.getByTestId('form-error')
    expect(errorAlert).toHaveTextContent(/Поле «Перевод на русский» обязательно для заполнения/i)
    expect(handleAdd).not.toHaveBeenCalled()
  })

  it('submits successfully when all fields are valid and resets inputs', async () => {
    const user = userEvent.setup()
    const handleAdd = vi.fn().mockResolvedValue(undefined)

    render(
      <VocabularyView
        words={[]}
        onAddWord={handleAdd}
        onDeleteWord={vi.fn()}
        onStartVocabularyPractice={vi.fn()}
      />
    )

    const wordInput = screen.getByLabelText(/Английское слово/i)
    const translationInput = screen.getByLabelText(/Перевод на русский/i)
    const phoneticInput = screen.getByLabelText(/Транскрипция/i)
    const submitBtn = screen.getByTestId('submit-word-btn')

    await user.type(wordInput, 'simultaneously')
    await user.type(translationInput, 'одновременно')
    await user.type(phoneticInput, '/ˌsɪm.əlˈteɪ.ni.əs.li/')

    await act(async () => {
      fireEvent.click(submitBtn)
    })

    expect(handleAdd).toHaveBeenCalledWith({
      word: 'simultaneously',
      translation: 'одновременно',
      phonetic: '/ˌsɪm.əlˈteɪ.ni.əs.li/'
    })
  })
})
