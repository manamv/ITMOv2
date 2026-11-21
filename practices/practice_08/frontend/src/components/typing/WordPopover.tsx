import React, { useState } from 'react'
import { Volume2, Star, Check, X } from 'lucide-react'
import { soundService } from '../../services/sound'
import { api } from '../../services/api'

interface WordPopoverProps {
  word: string
  translation?: string
  phonetic?: string
  onClose: () => void
}

// Common dictionary hints for words in our lessons
const DICTIONARY_MAP: Record<string, { translation: string; phonetic: string; partOfSpeech: string }> = {
  she: { translation: 'она (местоимение)', phonetic: '/ʃiː/', partOfSpeech: 'pronoun' },
  has: { translation: 'имеет (вспом. глагол)', phonetic: '/hæz/', partOfSpeech: 'verb' },
  already: { translation: 'уже, ранее', phonetic: '/ɔːlˈrɛd.i/', partOfSpeech: 'adverb' },
  completed: { translation: 'завершила, выполнила', phonetic: '/kəmˈpliːt.ɪd/', partOfSpeech: 'verb' },
  this: { translation: 'этот, эта', phonetic: '/ðɪs/', partOfSpeech: 'determiner' },
  difficult: { translation: 'сложный, трудный', phonetic: '/ˈdɪf.ɪ.kəlt/', partOfSpeech: 'adjective' },
  report: { translation: 'отчёт, доклад', phonetic: '/rɪˈpɔːt/', partOfSpeech: 'noun' },
  database: { translation: 'база данных', phonetic: '/ˈdeɪtəbeɪs/', partOfSpeech: 'noun' },
  on: { translation: 'на, в (предлог)', phonetic: '/ɒn/', partOfSpeech: 'preposition' },
  time: { translation: 'время (on time = вовремя)', phonetic: '/taɪm/', partOfSpeech: 'noun' },
  thoroughly: { translation: 'тщательно, досконально', phonetic: '/ˈθʌr.ə.li/', partOfSpeech: 'adverb' },
  occurrence: { translation: 'происшествие, случай', phonetic: '/əˈkʌr.əns/', partOfSpeech: 'noun' },
  simultaneously: { translation: 'одновременно', phonetic: '/ˌsɪm.əlˈteɪ.ni.əs.li/', partOfSpeech: 'adverb' },
  prototyping: { translation: 'прототипирование', phonetic: '/ˈprəʊ.tə.taɪ.pɪŋ/', partOfSpeech: 'noun' },
  requires: { translation: 'требует, нуждается', phonetic: '/rɪˈkwaɪəz/', partOfSpeech: 'verb' },
  proper: { translation: 'правильный, должный', phonetic: '/ˈprɒp.ər/', partOfSpeech: 'adjective' },
  practice: { translation: 'практика, тренировка', phonetic: '/ˈpræk.tɪs/', partOfSpeech: 'noun' },
  continuous: { translation: 'непрерывный, постоянный', phonetic: '/kənˈtɪn.ju.əs/', partOfSpeech: 'adjective' },
  testing: { translation: 'тестирование', phonetic: '/ˈtes.tɪŋ/', partOfSpeech: 'noun' }
}

export const WordPopover: React.FC<WordPopoverProps> = ({
  word,
  onClose
}) => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
  const info = DICTIONARY_MAP[cleanWord] || {
    translation: 'слово из контекста урока',
    phonetic: `/${cleanWord}/`,
    partOfSpeech: 'word'
  }

  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handlePlayAudio = () => {
    soundService.playWordAudio(cleanWord)
  }

  const handleSaveToVocabulary = async () => {
    try {
      setIsSaving(true)
      await api.addVocabularyWord({
        word: cleanWord,
        translation: info.translation,
        phonetic: info.phonetic,
        partOfSpeech: info.partOfSpeech
      })
      setIsSaved(true)
    } catch {
      // Fallback mark saved anyway in client state
      setIsSaved(true)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div 
      className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-30 bg-slate-800 border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-fade-in text-xs min-w-[260px]"
      data-testid="word-popover"
    >
      <button
        onClick={handlePlayAudio}
        className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-400 transition cursor-pointer"
        title="Прослушать произношение"
        aria-label="Прослушать произношение"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      <div className="flex-1">
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="font-bold text-white text-sm">{cleanWord}</span>
          <span className="text-slate-400 text-[11px]">{info.phonetic}</span>
        </div>
        <div className="text-emerald-400 text-[11px] font-medium leading-tight">
          {info.translation}
        </div>
      </div>

      <button
        onClick={handleSaveToVocabulary}
        disabled={isSaved || isSaving}
        className={`p-1.5 rounded-lg border transition cursor-pointer ${
          isSaved 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
        }`}
        title="Сохранить в словарь трудных слов"
        aria-label="Сохранить в словарь"
      >
        {isSaved ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4" />}
      </button>

      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
        aria-label="Закрыть перевод"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
