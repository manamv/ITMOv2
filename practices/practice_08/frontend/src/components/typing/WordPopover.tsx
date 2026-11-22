import React, { useState, useEffect } from 'react'
import { Volume2, Star, Check, X, Loader2 } from 'lucide-react'
import { soundService } from '../../services/sound'
import { api } from '../../services/api'
import { DICTIONARY_MAP, normalizeEnglishWord } from '../../utils/dictionary'

interface WordPopoverProps {
  word: string
  translation?: string
  phonetic?: string
  onClose: () => void
  className?: string
}

export const WordPopover: React.FC<WordPopoverProps> = ({
  word,
  onClose,
  className = 'absolute -top-20 left-1/2 -translate-x-1/2'
}) => {
  const cleanWord = normalizeEnglishWord(word)
  const localInfo = DICTIONARY_MAP[cleanWord]

  const [translationText, setTranslationText] = useState<string>(
    localInfo ? localInfo.translation : ''
  )
  const [phoneticText, setPhoneticText] = useState<string>(
    localInfo ? localInfo.phonetic : `/${cleanWord}/`
  )
  const [partOfSpeech, setPartOfSpeech] = useState<string>(
    localInfo ? localInfo.partOfSpeech : 'word'
  )
  const [isLoading, setIsLoading] = useState<boolean>(!localInfo)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Reset saved state when switching to a different word
  useEffect(() => {
    setIsSaved(false)
  }, [cleanWord])

  // Asynchronous fallback translation fetch if word is not in local dictionary
  useEffect(() => {
    if (localInfo) {
      setTranslationText(localInfo.translation)
      setPhoneticText(localInfo.phonetic)
      setPartOfSpeech(localInfo.partOfSpeech)
      setIsLoading(false)
      return
    }

    if (!cleanWord || cleanWord.length < 2) {
      setTranslationText('слово слишком короткое')
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 2500)

    fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanWord)}&langpair=en|ru`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId)
        if (!isMounted) return

        const translated = data?.responseData?.translatedText
        if (translated && typeof translated === 'string' && translated.toLowerCase() !== cleanWord) {
          const decoded = translated
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&amp;/g, '&')
          setTranslationText(decoded)
          DICTIONARY_MAP[cleanWord] = {
            translation: decoded,
            phonetic: `/${cleanWord}/`,
            partOfSpeech: 'word'
          }
        } else {
          setTranslationText('перевод: ' + cleanWord)
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslationText('перевод: ' + cleanWord)
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [cleanWord, localInfo])

  const handlePlayAudio = () => {
    soundService.playWordAudio(cleanWord)
  }

  const handleSaveToVocabulary = async () => {
    try {
      setIsSaving(true)
      await api.addVocabularyWord({
        word: cleanWord,
        translation: translationText || 'перевод',
        phonetic: phoneticText,
        partOfSpeech
      })
      setIsSaved(true)
    } catch {
      setIsSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className={`${className} z-50 bg-[#0b1120]/95 backdrop-blur-2xl border border-white/[0.12] ring-1 ring-sky-400/20 rounded-2xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex items-center gap-3 animate-fade-in text-xs min-w-[290px] max-w-[380px]`}
      data-testid="word-popover"
    >
      <button
        onClick={handlePlayAudio}
        className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/25 text-sky-300 transition cursor-pointer shrink-0 active:scale-95"
        title="Прослушать произношение"
        aria-label="Прослушать произношение"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-white text-sm truncate">{cleanWord}</span>
          <span className="text-slate-400 text-[11px] truncate">{phoneticText}</span>
          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-400 border border-white/[0.06] shrink-0">
            {partOfSpeech}
          </span>
        </div>

        <div className="text-sky-300 text-xs font-semibold leading-tight mt-0.5 flex items-center gap-1.5 truncate">
          {isLoading ? (
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin text-sky-400" />
              <span>Загрузка перевода...</span>
            </span>
          ) : (
            <span className="truncate">{translationText || 'перевод'}</span>
          )}
        </div>
      </div>

      <button
        onClick={handleSaveToVocabulary}
        disabled={isSaved || isSaving}
        className={`p-1.5 rounded-xl border transition cursor-pointer shrink-0 active:scale-95 ${
          isSaved
            ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300'
            : 'bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.1] text-slate-300 hover:text-amber-300'
        }`}
        title={isSaved ? 'Сохранено в словарь' : 'Сохранить в словарь трудных слов'}
        aria-label="Сохранить в словарь"
      >
        {isSaved ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4" />}
      </button>

      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition cursor-pointer shrink-0"
        aria-label="Закрыть перевод"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
