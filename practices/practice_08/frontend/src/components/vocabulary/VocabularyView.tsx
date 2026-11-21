import React, { useState } from 'react'
import { Volume2, Plus, Trash2, BookOpen, AlertCircle, Sparkles } from 'lucide-react'
import type { VocabularyWord } from '../../types'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { soundService } from '../../services/sound'

interface VocabularyViewProps {
  words: VocabularyWord[]
  onAddWord: (word: { word: string; translation: string; phonetic?: string }) => Promise<void>
  onDeleteWord: (id: string) => Promise<void>
  onStartVocabularyPractice: (words: string[]) => void
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  words,
  onAddWord,
  onDeleteWord,
  onStartVocabularyPractice
}) => {
  const [newWord, setNewWord] = useState('')
  const [newTranslation, setNewTranslation] = useState('')
  const [newPhonetic, setNewPhonetic] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form submission with strict validation (Criterion 9)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validation: required fields
    if (!newWord.trim()) {
      setErrorMessage('Поле «Английское слово» обязательно для заполнения')
      return
    }

    // Validation: English letters only for the word
    if (!/^[a-zA-Z\s-]+$/.test(newWord.trim())) {
      setErrorMessage('Слово должно содержать только английские буквы')
      return
    }

    if (!newTranslation.trim()) {
      setErrorMessage('Поле «Перевод на русский» обязательно для заполнения')
      return
    }

    try {
      setIsSubmitting(true)
      await onAddWord({
        word: newWord.trim().toLowerCase(),
        translation: newTranslation.trim(),
        phonetic: newPhonetic.trim() || undefined
      })
      // Clear form
      setNewWord('')
      setNewTranslation('')
      setNewPhonetic('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось добавить слово'
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full animate-fade-in" data-testid="vocabulary-view">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Словарь трудных слов
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Слова, в которых вы допускали опечатки или добавили вручную для повторения.
          </p>
        </div>

        {words.length > 0 && (
          <Button
            onClick={() => onStartVocabularyPractice(words.map(w => w.word))}
            variant="primary"
          >
            <Sparkles className="w-4 h-4" />
            <span>Тренировать слова ({words.length})</span>
          </Button>
        )}
      </div>

      {/* Add New Word Form (Validation Form - Criterion 9) */}
      <Card className="bg-slate-900 border border-slate-800">
        <h3 className="text-sm font-semibold text-white mb-3">Добавить слово в личный словарь</h3>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="add-word-form" noValidate>
          {errorMessage && (
            <div 
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2"
              role="alert"
              data-testid="form-error"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="word-input" className="block text-xs text-slate-400 mb-1">
                Английское слово <span className="text-rose-400">*</span>
              </label>
              <input
                id="word-input"
                type="text"
                value={newWord}
                onChange={e => setNewWord(e.target.value)}
                placeholder="например, thoroughly"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              />
            </div>

            <div>
              <label htmlFor="translation-input" className="block text-xs text-slate-400 mb-1">
                Перевод на русский <span className="text-rose-400">*</span>
              </label>
              <input
                id="translation-input"
                type="text"
                value={newTranslation}
                onChange={e => setNewTranslation(e.target.value)}
                placeholder="например, тщательно"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              />
            </div>

            <div>
              <label htmlFor="phonetic-input" className="block text-xs text-slate-400 mb-1">
                Транскрипция (опционально)
              </label>
              <input
                id="phonetic-input"
                type="text"
                value={newPhonetic}
                onChange={e => setNewPhonetic(e.target.value)}
                placeholder="например, /ˈθʌr.ə.li/"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              isLoading={isSubmitting}
              disabled={isSubmitting}
              data-testid="submit-word-btn"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить в словарь</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* Words List */}
      {words.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-dashed border-slate-800 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">Словарь пока пуст. Добавьте новые слова через форму выше или кликайте на слова во время набора текста.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3" data-testid="words-list">
          {words.map(w => (
            <div
              key={w.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
              data-testid={`word-item-${w.word}`}
            >
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => soundService.playWordAudio(w.word, w.audioUrl)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition cursor-pointer"
                  title="Прослушать произношение"
                  aria-label={`Прослушать ${w.word}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-sm font-mono">{w.word}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{w.phonetic}</span>
                  </div>
                  <div className="text-xs text-emerald-400">{w.translation}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-[10px] text-slate-500 font-mono px-2 py-0.5 rounded bg-slate-800">
                  {w.mistakeCount} опечаток
                </span>
                <button
                  onClick={() => onDeleteWord(w.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
                  title="Удалить слово"
                  aria-label={`Удалить ${w.word}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
