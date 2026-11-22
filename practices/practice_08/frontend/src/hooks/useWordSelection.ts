import { useState, useCallback } from 'react'
import { normalizeEnglishWord } from '../utils/dictionary'

/**
 * Reusable hook that powers instant word translation via mouse text selection
 * or direct word click across TypingEngine and TopicQuizView.
 */
export function useWordSelection() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection) return

    const rawText = selection.toString().trim()
    if (!rawText) return

    const firstToken = rawText.split(/\s+/)[0]
    const cleaned = normalizeEnglishWord(firstToken)
    if (cleaned.length >= 2) {
      setSelectedWord(cleaned)
    }
  }, [])

  const selectWord = useCallback((rawWord: string) => {
    const cleaned = normalizeEnglishWord(rawWord)
    if (cleaned.length >= 2) {
      setSelectedWord(cleaned)
    }
  }, [])

  const clearSelectedWord = useCallback(() => {
    setSelectedWord(null)
  }, [])

  return {
    selectedWord,
    setSelectedWord,
    handleTextSelection,
    selectWord,
    clearSelectedWord
  }
}
