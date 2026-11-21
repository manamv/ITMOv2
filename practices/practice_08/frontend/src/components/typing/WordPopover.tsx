import React, { useState, useEffect } from 'react'
import { Volume2, Star, Check, X, Loader2 } from 'lucide-react'
import { soundService } from '../../services/sound'
import { api } from '../../services/api'

interface WordPopoverProps {
  word: string
  translation?: string
  phonetic?: string
  onClose: () => void
}

interface DictEntry {
  translation: string
  phonetic: string
  partOfSpeech: string
}

// Comprehensive built-in vocabulary for all lesson exercises and practice sets
const DICTIONARY_MAP: Record<string, DictEntry> = {
  // Practice 8 Core Exercise Words (from blindtyping screen)
  insist: { translation: 'настаивать, утверждать', phonetic: '/ɪnˈsɪst/', partOfSpeech: 'verb' },
  interest: { translation: 'интерес, процент', phonetic: '/ˈɪn.trəst/', partOfSpeech: 'noun' },
  resist: { translation: 'сопротивляться, противостоять', phonetic: '/rɪˈzɪst/', partOfSpeech: 'verb' },
  senator: { translation: 'сенатор', phonetic: '/ˈsen.ə.tər/', partOfSpeech: 'noun' },
  areas: { translation: 'области, районы', phonetic: '/ˈeə.ri.əz/', partOfSpeech: 'noun' },
  area: { translation: 'область, район, сфера', phonetic: '/ˈeə.ri.ə/', partOfSpeech: 'noun' },
  seat: { translation: 'место, сиденье', phonetic: '/siːt/', partOfSpeech: 'noun' },
  shoe: { translation: 'туфля, обувь', phonetic: '/ʃuː/', partOfSpeech: 'noun' },
  season: { translation: 'сезон, время года', phonetic: '/ˈsiː.zən/', partOfSpeech: 'noun' },
  enters: { translation: 'входит, вводит', phonetic: '/ˈen.təz/', partOfSpeech: 'verb' },
  enter: { translation: 'входить, поступать', phonetic: '/ˈen.tər/', partOfSpeech: 'verb' },
  street: { translation: 'улица', phonetic: '/striːt/', partOfSpeech: 'noun' },
  taste: { translation: 'вкус, пробовать на вкус', phonetic: '/teɪst/', partOfSpeech: 'noun/verb' },
  host: { translation: 'хост, ведущий, принимать', phonetic: '/həʊst/', partOfSpeech: 'noun/verb' },
  hiss: { translation: 'шипение, шипеть', phonetic: '/hɪs/', partOfSpeech: 'noun/verb' },
  shirt: { translation: 'рубашка', phonetic: '/ʃɜːt/', partOfSpeech: 'noun' },
  hairs: { translation: 'волоски', phonetic: '/heəz/', partOfSpeech: 'noun' },
  hair: { translation: 'волосы', phonetic: '/heər/', partOfSpeech: 'noun' },
  tease: { translation: 'дразнить, поддразнивать', phonetic: '/tiːz/', partOfSpeech: 'verb' },
  snort: { translation: 'фыркать, храпеть', phonetic: '/snɔːt/', partOfSpeech: 'verb/noun' },
  sat: { translation: 'сидел (прош. от sit)', phonetic: '/sæt/', partOfSpeech: 'verb' },
  assistant: { translation: 'ассистент, помощник', phonetic: '/əˈsɪs.tənt/', partOfSpeech: 'noun' },
  reasons: { translation: 'причины, доводы', phonetic: '/ˈriː.zənz/', partOfSpeech: 'noun' },
  reason: { translation: 'причина, повод, разум', phonetic: '/ˈriː.zən/', partOfSpeech: 'noun' },
  tattoos: { translation: 'татуировки', phonetic: '/tæˈtuːz/', partOfSpeech: 'noun' },
  tattoo: { translation: 'татуировка', phonetic: '/tæˈtuː/', partOfSpeech: 'noun' },
  set: { translation: 'набор, устанавливать', phonetic: '/set/', partOfSpeech: 'noun/verb' },

  // Engineering & Grammar Lesson Words
  she: { translation: 'она (местоимение)', phonetic: '/ʃiː/', partOfSpeech: 'pronoun' },
  he: { translation: 'он (местоимение)', phonetic: '/hiː/', partOfSpeech: 'pronoun' },
  they: { translation: 'они', phonetic: '/ðeɪ/', partOfSpeech: 'pronoun' },
  we: { translation: 'мы', phonetic: '/wiː/', partOfSpeech: 'pronoun' },
  i: { translation: 'я', phonetic: '/aɪ/', partOfSpeech: 'pronoun' },
  you: { translation: 'ты, вы', phonetic: '/juː/', partOfSpeech: 'pronoun' },
  has: { translation: 'имеет (вспом. глагол)', phonetic: '/hæz/', partOfSpeech: 'verb' },
  have: { translation: 'иметь, обладать', phonetic: '/hæv/', partOfSpeech: 'verb' },
  had: { translation: 'имел (прош. от have)', phonetic: '/hæd/', partOfSpeech: 'verb' },
  already: { translation: 'уже, ранее', phonetic: '/ɔːlˈrɛd.i/', partOfSpeech: 'adverb' },
  completed: { translation: 'завершила, выполнила', phonetic: '/kəmˈpliːt.ɪd/', partOfSpeech: 'verb' },
  complete: { translation: 'завершать, полный', phonetic: '/kəmˈpliːt/', partOfSpeech: 'verb/adj' },
  this: { translation: 'этот, эта', phonetic: '/ðɪs/', partOfSpeech: 'determiner' },
  that: { translation: 'тот, та, что', phonetic: '/ðæt/', partOfSpeech: 'determiner' },
  difficult: { translation: 'сложный, трудный', phonetic: '/ˈdɪf.ɪ.kəlt/', partOfSpeech: 'adjective' },
  report: { translation: 'отчёт, доклад', phonetic: '/rɪˈpɔːt/', partOfSpeech: 'noun' },
  database: { translation: 'база данных', phonetic: '/ˈdeɪtəbeɪs/', partOfSpeech: 'noun' },
  schema: { translation: 'схема структуры данных', phonetic: '/ˈskiː.mə/', partOfSpeech: 'noun' },
  changes: { translation: 'изменения', phonetic: '/ˈtʃeɪn.dʒɪz/', partOfSpeech: 'noun' },
  change: { translation: 'изменение, менять', phonetic: '/tʃeɪndʒ/', partOfSpeech: 'noun/verb' },
  entire: { translation: 'весь, целый, полный', phonetic: '/ɪnˈtaɪər/', partOfSpeech: 'adjective' },
  team: { translation: 'команда', phonetic: '/tiːm/', partOfSpeech: 'noun' },
  engineering: { translation: 'инженерия, разработка', phonetic: '/ˌen.dʒɪˈnɪə.rɪŋ/', partOfSpeech: 'noun' },
  architect: { translation: 'архитектор систем', phonetic: '/ˈɑː.kɪ.tekt/', partOfSpeech: 'noun' },
  verified: { translation: 'проверил, верифицировал', phonetic: '/ˈver.ɪ.faɪd/', partOfSpeech: 'verb' },
  verify: { translation: 'проверять, подтверждать', phonetic: '/ˈver.ɪ.faɪ/', partOfSpeech: 'verb' },
  went: { translation: 'поехали, отправились', phonetic: '/went/', partOfSpeech: 'verb' },
  conference: { translation: 'конференция', phonetic: '/ˈkɒn.fər.əns/', partOfSpeech: 'noun' },
  berlin: { translation: 'Берлин (город)', phonetic: '/bɜːˈlɪn/', partOfSpeech: 'noun' },
  last: { translation: 'прошлый, последний', phonetic: '/lɑːst/', partOfSpeech: 'adjective' },
  tuesday: { translation: 'вторник', phonetic: '/ˈtʃuːz.deɪ/', partOfSpeech: 'noun' },
  presented: { translation: 'представили, презентовали', phonetic: '/prɪˈzen.tɪd/', partOfSpeech: 'verb' },
  automated: { translation: 'автоматизированный', phonetic: '/ˈɔː.tə.meɪ.tɪd/', partOfSpeech: 'adjective' },
  deployment: { translation: 'деплой, развёртывание', phonetic: '/dɪˈplɔɪ.mənt/', partOfSpeech: 'noun' },
  pipeline: { translation: 'пайплайн, конвейер сборки', phonetic: '/ˈpaɪp.laɪn/', partOfSpeech: 'noun' },
  distributed: { translation: 'распределённый', phonetic: '/dɪˈstrɪb.juː.tɪd/', partOfSpeech: 'adjective' },
  developers: { translation: 'разработчики', phonetic: '/dɪˈvel.ə.pərz/', partOfSpeech: 'noun' },
  developer: { translation: 'разработчик, создатель', phonetic: '/dɪˈvel.ə.pər/', partOfSpeech: 'noun' },
  never: { translation: 'никогда', phonetic: '/ˈnev.ər/', partOfSpeech: 'adverb' },
  observed: { translation: 'наблюдали, зафиксировали', phonetic: '/əbˈzɜːvd/', partOfSpeech: 'verb' },
  innovative: { translation: 'инновационный', phonetic: '/ˈɪn.ə.və.tɪv/', partOfSpeech: 'adjective' },
  microservice: { translation: 'микросервис', phonetic: '/ˈmaɪ.krəʊˌsɜː.vɪs/', partOfSpeech: 'noun' },
  architecture: { translation: 'архитектура', phonetic: '/ˈɑː.kɪ.tek.tʃər/', partOfSpeech: 'noun' },
  enterprise: { translation: 'корпоративный, предприятие', phonetic: '/ˈen.tə.praɪz/', partOfSpeech: 'noun' },
  system: { translation: 'система', phonetic: '/ˈsɪs.təm/', partOfSpeech: 'noun' },
  latency: { translation: 'задержка, пинг', phonetic: '/ˈleɪ.tən.si/', partOfSpeech: 'noun' },
  low: { translation: 'низкий', phonetic: '/ləʊ/', partOfSpeech: 'adjective' },
  high: { translation: 'высокий', phonetic: '/haɪ/', partOfSpeech: 'adjective' },
  cloud: { translation: 'облако, облачный сервис', phonetic: '/klaʊd/', partOfSpeech: 'noun' },
  service: { translation: 'служба, сервис', phonetic: '/ˈsɜː.vɪs/', partOfSpeech: 'noun' },
  launched: { translation: 'запустили, релизнули', phonetic: '/lɔːntʃt/', partOfSpeech: 'verb' },
  monitored: { translation: 'отслеживали, мониторили', phonetic: '/ˈmɒn.ɪ.təd/', partOfSpeech: 'verb' },
  transaction: { translation: 'транзакция, операция', phonetic: '/trænˈzæk.ʃən/', partOfSpeech: 'noun' },
  continuously: { translation: 'непрерывно, постоянно', phonetic: '/kənˈtɪn.ju.əs.li/', partOfSpeech: 'adverb' },
  production: { translation: 'прод, производство', phonetic: '/prəˈdʌk.ʃən/', partOfSpeech: 'noun' },
  incident: { translation: 'инцидент, сбой', phonetic: '/ˈɪn.sɪ.dənt/', partOfSpeech: 'noun' },
  refactored: { translation: 'отрефакторили, улучшили', phonetic: '/riːˈfæk.təd/', partOfSpeech: 'verb' },
  legacy: { translation: 'устаревший код (легаси)', phonetic: '/ˈleɡ.ə.si/', partOfSpeech: 'noun/adj' },
  workload: { translation: 'нагрузка, объём работы', phonetic: '/ˈwɜːk.ləʊd/', partOfSpeech: 'noun' },
  maintained: { translation: 'поддерживали, сохраняли', phonetic: '/meɪnˈteɪnd/', partOfSpeech: 'verb' },
  backward: { translation: 'обратная (совместимость)', phonetic: '/ˈbæk.wəd/', partOfSpeech: 'adjective' },
  compatibility: { translation: 'совместимость', phonetic: '/kəmˌpæt.əˈbɪl.ə.ti/', partOfSpeech: 'noun' },
  docker: { translation: 'Докер (система контейнеров)', phonetic: '/ˈdɒk.ər/', partOfSpeech: 'noun' },
  containers: { translation: 'контейнеры', phonetic: '/kənˈteɪ.nərz/', partOfSpeech: 'noun' },
  isolate: { translation: 'изолировать, отделять', phonetic: '/ˈaɪ.sə.leɪt/', partOfSpeech: 'verb' },

  // Music Songs Vocabulary
  champions: { translation: 'чемпионы, победители', phonetic: '/ˈtʃæm.pi.ənz/', partOfSpeech: 'noun' },
  champion: { translation: 'чемпион, победитель', phonetic: '/ˈtʃæm.pi.ən/', partOfSpeech: 'noun' },
  friends: { translation: 'друзья', phonetic: '/frendz/', partOfSpeech: 'noun' },
  friend: { translation: 'друг', phonetic: '/frend/', partOfSpeech: 'noun' },
  fighting: { translation: 'борьба, сражаться', phonetic: '/ˈfaɪ.tɪŋ/', partOfSpeech: 'noun/verb' },
  losers: { translation: 'проигравшие, неудачники', phonetic: '/ˈluː.zərz/', partOfSpeech: 'noun' },
  world: { translation: 'мир, вселенная', phonetic: '/wɜːld/', partOfSpeech: 'noun' },
  crime: { translation: 'преступление', phonetic: '/kraɪm/', partOfSpeech: 'noun' },
  sentence: { translation: 'приговор, предложение', phonetic: '/ˈsen.təns/', partOfSpeech: 'noun' },
  dues: { translation: 'долги, взносы (paid dues = отстрадал своё)', phonetic: '/djuːz/', partOfSpeech: 'noun' },
  mistakes: { translation: 'ошибки', phonetic: '/mɪˈsteɪks/', partOfSpeech: 'noun' },
  mistake: { translation: 'ошибка', phonetic: '/mɪˈsteɪk/', partOfSpeech: 'noun' },
  yesterday: { translation: 'вчера, прошлое', phonetic: '/ˈjes.tə.deɪ/', partOfSpeech: 'noun/adverb' },
  troubles: { translation: 'неприятности, тревоги', phonetic: '/ˈtrʌb.əlz/', partOfSpeech: 'noun' },
  seemed: { translation: 'казались', phonetic: '/siːmd/', partOfSpeech: 'verb' },
  away: { translation: 'прочь, далеко', phonetic: '/əˈweɪ/', partOfSpeech: 'adverb' },
  shadow: { translation: 'тень', phonetic: '/ˈʃæd.əʊ/', partOfSpeech: 'noun' },
  suddenly: { translation: 'внезапно, вдруг', phonetic: '/ˈsʌd.ən.li/', partOfSpeech: 'adverb' },

  // Common prepositions & connectives
  on: { translation: 'на, в (предлог)', phonetic: '/ɒn/', partOfSpeech: 'preposition' },
  in: { translation: 'в, внутри', phonetic: '/ɪn/', partOfSpeech: 'preposition' },
  at: { translation: 'у, возле, в', phonetic: '/æt/', partOfSpeech: 'preposition' },
  to: { translation: 'к, в сторону', phonetic: '/tuː/', partOfSpeech: 'preposition' },
  for: { translation: 'для, ради', phonetic: '/fɔːr/', partOfSpeech: 'preposition' },
  with: { translation: 'с, вместе с', phonetic: '/wɪð/', partOfSpeech: 'preposition' },
  by: { translation: 'посредством, около', phonetic: '/baɪ/', partOfSpeech: 'preposition' },
  from: { translation: 'от, из', phonetic: '/frɒm/', partOfSpeech: 'preposition' },
  time: { translation: 'время (on time = вовремя)', phonetic: '/taɪm/', partOfSpeech: 'noun' },
  practice: { translation: 'практика, тренировка', phonetic: '/ˈpræk.tɪs/', partOfSpeech: 'noun' }
}

export const WordPopover: React.FC<WordPopoverProps> = ({
  word,
  onClose
}) => {
  const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase()

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

    // Query free open translation API
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
          // Clean up HTML entities if any
          const decoded = translated.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
          setTranslationText(decoded)
          // Cache in local dictionary map for instant re-lookup
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
        partOfSpeech: partOfSpeech
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
      className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-800 border border-slate-700/80 rounded-2xl p-3 shadow-2xl flex items-center gap-3 animate-fade-in text-xs min-w-[280px]"
      data-testid="word-popover"
    >
      <button
        onClick={handlePlayAudio}
        className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-emerald-400 transition cursor-pointer shrink-0"
        title="Прослушать произношение"
        aria-label="Прослушать произношение"
      >
        <Volume2 className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1.5 font-mono">
          <span className="font-bold text-white text-sm truncate">{cleanWord}</span>
          <span className="text-slate-400 text-[11px] truncate">{phoneticText}</span>
        </div>

        <div className="text-emerald-400 text-xs font-semibold leading-tight mt-0.5 flex items-center gap-1.5 truncate">
          {isLoading ? (
            <span className="text-slate-400 flex items-center gap-1 text-[11px]">
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              <span>Загрузка перевода...</span>
            </span>
          ) : (
            <span>{translationText || 'перевод'}</span>
          )}
        </div>
      </div>

      <button
        onClick={handleSaveToVocabulary}
        disabled={isSaved || isSaving}
        className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
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
        className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer shrink-0"
        aria-label="Закрыть перевод"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
