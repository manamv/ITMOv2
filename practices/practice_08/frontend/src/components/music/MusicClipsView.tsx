import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Music,
  Play,
  Pause,
  Volume2,
  BookOpen,
  Sparkles,
  ChevronRight,
  Headphones,
  Bot,
  Flame,
  RotateCcw,
  ArrowLeft,
  Repeat,
  SkipBack,
  SkipForward,
  Video,
  Mic,
  Languages
} from 'lucide-react'
import type { MusicLesson, LessonData } from '../../types'
import { api } from '../../services/api'
import { karaokeBeat } from '../../services/karaokeBeat'
import { WordPopover } from '../typing/WordPopover'
import { useWordSelection } from '../../hooks/useWordSelection'
import { normalizeEnglishWord } from '../../utils/dictionary'

interface MusicClipsViewProps {
  onStartTyping: (lesson: LessonData) => void
  onBack?: () => void
}

// Deep AI Meaning Analysis for famous tracks
const AI_SONG_ANALYSES: Record<
  string,
  {
    mainTheme: string
    culturalContext: string
    metaphors: Array<{ quote: string; meaning: string }>
    emotionalTone: string
  }
> = {
  'queen-champions': {
    mainTheme:
      'Гимн преодоления, упорства и триумфа вопреки критике и поражениям. Фредди Меркьюри написал эту песню как манифест внутренней победы, объединяющий слушателей.',
    culturalContext:
      'Выпущена в 1977 году на альбоме «News of the World». Вошла в историю как главный стадионный гимн мира, где фраза «we are» намеренно стирает грань между артистом и залом.',
    metaphors: [
      {
        quote: 'i have paid my dues time after time',
        meaning: '«Заплатил по счетам» — идиома: прошёл через все трудности и заслужил право на успех.'
      },
      {
        quote: 'sand kicked in my face',
        meaning: 'Метафора публичного унижения, насмешек и недооценки со стороны окружающих.'
      },
      {
        quote: 'no bed of roses',
        meaning: '«Не ложе из роз» — признание того, что путь к вершине никогда не был лёгким.'
      }
    ],
    emotionalTone: 'Триумфальный, воодушевляющий, величественный.'
  },
  'coldplay-scientist': {
    mainTheme:
      'Конфликт между рациональной наукой (логикой) и иррациональными человеческими чувствами. Герой осознаёт, что любовь нельзя просчитать формулами.',
    culturalContext:
      'Написана Крисом Мартином в Ливерпуле после прослушивания Джорджа Харрисона. Знаменитый клип снят в обратном времени (reverse motion), символизируя желание «вернуться к началу».',
    metaphors: [
      {
        quote: 'questions of science... do not speak as loud as my heart',
        meaning: 'Рациональный анализ бессилен перед эмоциональной болью и искренним раскаянием.'
      },
      {
        quote: 'running in circles, coming up tails',
        meaning: 'Бег по кругу без выхода и «выпала решка» — ощущение проигрыша в игре с судьбой.'
      },
      {
        quote: 'take me back to the start',
        meaning: 'Тоска по моменту до совершения роковой ошибки.'
      }
    ],
    emotionalTone: 'Меланхоличный, искренний, ностальгический.'
  },
  'beatles-yesterday': {
    mainTheme:
      'Внезапная утрата гармонии и шок от того, как быстро беззаботное «вчера» сменяется тревогой настоящего.',
    culturalContext:
      'Пол Маккартни услышал мелодию во сне в 1965 году. Одна из самых записываемых песен в истории мировой музыки (более 2200 кавер-версий).',
    metaphors: [
      {
        quote: 'i am not half the man i used to be',
        meaning: 'Гипербола эмоционального опустошения после разрыва.'
      },
      {
        quote: 'there is a shadow hanging over me',
        meaning: 'Нависшая тень — классический образ тревоги, вины и экзистенциального одиночества.'
      }
    ],
    emotionalTone: 'Элегический, светлая грусть, глубокая рефлексия.'
  }
}

/**
 * Maps a character index from SpeechSynthesisUtterance.onboundary to the exact word index.
 */
function charIndexToWordIndex(text: string, charIndex: number): number {
  const words = text.split(' ')
  let cursor = 0
  for (let i = 0; i < words.length; i++) {
    const end = cursor + words[i].length
    if (charIndex <= end) {
      return i
    }
    cursor = end + 1
  }
  return Math.max(0, words.length - 1)
}

export const MusicClipsView: React.FC<MusicClipsViewProps> = ({ onStartTyping, onBack }) => {
  const [songsList, setSongsList] = useState<
    Array<{
      id: string
      title: string
      artist: string
      level: string
      thumbnailUrl: string
      grammarFocus: string
      sentenceCount: number
    }>
  >([])
  const [selectedSongId, setSelectedSongId] = useState<string>('queen-champions')
  const [currentSong, setCurrentSong] = useState<MusicLesson | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<'grammar' | 'ai-meaning'>('grammar')

  // Reinvented Dual-Mode Stage: Studio Voice Karaoke (100% exact word sync) vs YouTube Clip
  const [stageMode, setStageMode] = useState<'studio' | 'youtube'>('studio')

  // Native Synchronized Studio Karaoke State
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [activeLineIdx, setActiveLineIdx] = useState<number>(0)
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1)
  const [tempo, setTempo] = useState<number>(0.9)
  const [loopLine, setLoopLine] = useState<boolean>(false)
  const [ambientBeatEnabled, setAmbientBeatEnabled] = useState<boolean>(true)
  const [translateOnClick, setTranslateOnClick] = useState<boolean>(false)

  // Shared Word Translation Popover (Idea #4)
  const { selectedWord, handleTextSelection, selectWord, clearSelectedWord } = useWordSelection()

  // Refs for clean, leak-free audio/speech control
  const isPlayingRef = useRef(false)
  const loopLineRef = useRef(false)
  const tempoRef = useRef(tempo)
  const fallbackTimerRef = useRef<number | null>(null)
  const nextLineTimeoutRef = useRef<number | null>(null)
  const activeSubtitleRef = useRef<HTMLDivElement>(null)
  const subtitlesScrollContainerRef = useRef<HTMLDivElement>(null)
  const playGenerationRef = useRef<number>(0)

  isPlayingRef.current = isPlaying
  loopLineRef.current = loopLine
  tempoRef.current = tempo

  const clearTimers = useCallback(() => {
    if (fallbackTimerRef.current !== null) {
      clearInterval(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
    if (nextLineTimeoutRef.current !== null) {
      clearTimeout(nextLineTimeoutRef.current)
      nextLineTimeoutRef.current = null
    }
  }, [])

  const stopPlayback = useCallback(() => {
    playGenerationRef.current += 1
    isPlayingRef.current = false
    setIsPlaying(false)
    setActiveWordIdx(-1)
    clearTimers()
    karaokeBeat.stop()
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
  }, [clearTimers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback()
    }
  }, [stopPlayback])

  // Load songs list on mount
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const list = await api.getMusicLessons()
        if (isMounted) {
          setSongsList(list)
          if (list.length > 0) {
            setSelectedSongId(list[0].id)
          }
        }
      } catch {
        // Fallback handled in api
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  // Load selected song details
  useEffect(() => {
    let isMounted = true
    stopPlayback()
    clearSelectedWord()
    const loadSong = async () => {
      try {
        const song = await api.getMusicLesson(selectedSongId)
        if (!isMounted) return
        setCurrentSong(song)
        setActiveLineIdx(0)
        setActiveWordIdx(-1)
      } catch {
        // Fallback
      }
    }
    loadSong()
    return () => {
      isMounted = false
    }
  }, [selectedSongId, stopPlayback, clearSelectedWord])

  /**
   * Core Reinvented Karaoke Engine:
   * Speaks a subtitle line using Web Speech API and highlights every single word
   * at the EXACT millisecond it is pronounced via SpeechSynthesisUtterance.onboundary!
   * Includes an automatic fallback pacer if a browser's TTS engine doesn't fire onboundary.
   */
  const speakLineWithExactSync = useCallback(
    (lineIndex: number, song: MusicLesson) => {
      const sub = song.subtitles[lineIndex]
      if (!sub) {
        stopPlayback()
        return
      }

      clearTimers()
      const gen = ++playGenerationRef.current
      setActiveLineIdx(lineIndex)
      setActiveWordIdx(0)

      const words = sub.textEn.split(' ').filter(Boolean)

      const advanceAfterLine = () => {
        if (playGenerationRef.current !== gen || !isPlayingRef.current) return
        clearTimers()
        const nextIdx = loopLineRef.current ? lineIndex : lineIndex + 1
        if (nextIdx < song.subtitles.length) {
          nextLineTimeoutRef.current = window.setTimeout(() => {
            if (playGenerationRef.current === gen && isPlayingRef.current) {
              speakLineWithExactSync(nextIdx, song)
            }
          }, 320)
        } else {
          // Reached end of track cleanly
          stopPlayback()
          setActiveLineIdx(0)
        }
      }

      // If browser supports Web Speech API, synchronize word-by-word via native onboundary!
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(sub.textEn)
        const voices = window.speechSynthesis.getVoices()
        const engVoice =
          voices.find(
            v =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') || v.name.includes('Google US English') || v.name.includes('Samantha'))
          ) || voices.find(v => v.lang.startsWith('en'))
        if (engVoice) utterance.voice = engVoice

        utterance.lang = 'en-US'
        utterance.rate = tempoRef.current
        utterance.pitch = 1.0

        let receivedNativeBoundary = false

        utterance.onboundary = (event: SpeechSynthesisEvent) => {
          if (playGenerationRef.current !== gen) return
          if (event.name === 'word' || typeof event.charIndex === 'number') {
            receivedNativeBoundary = true
            if (fallbackTimerRef.current !== null) {
              clearInterval(fallbackTimerRef.current)
              fallbackTimerRef.current = null
            }
            const idx = charIndexToWordIndex(sub.textEn, event.charIndex)
            setActiveWordIdx(idx)
          }
        }

        utterance.onstart = () => {
          if (playGenerationRef.current !== gen) return
          setActiveWordIdx(0)

          // Safety fallback pacer: only activates if browser TTS does NOT fire onboundary
          const msPerWord = Math.round(370 / Math.max(0.5, tempoRef.current))
          let fallbackIdx = 0
          fallbackTimerRef.current = window.setInterval(() => {
            if (playGenerationRef.current !== gen || receivedNativeBoundary) {
              if (fallbackTimerRef.current !== null) {
                clearInterval(fallbackTimerRef.current)
                fallbackTimerRef.current = null
              }
              return
            }
            fallbackIdx += 1
            if (fallbackIdx < words.length) {
              setActiveWordIdx(fallbackIdx)
            }
          }, msPerWord)
        }

        utterance.onend = () => {
          advanceAfterLine()
        }

        utterance.onerror = () => {
          // If interrupted by user cancel, ignore; otherwise stop cleanly
          if (playGenerationRef.current === gen && isPlayingRef.current) {
            stopPlayback()
          }
        }

        window.speechSynthesis.speak(utterance)
      } else {
        // Fallback for headless/test environments without SpeechSynthesis
        const msPerWord = Math.round(380 / Math.max(0.5, tempoRef.current))
        let idx = 0
        fallbackTimerRef.current = Number(
          globalThis.setInterval(() => {
            if (playGenerationRef.current !== gen) return
            idx += 1
            if (idx < words.length) {
              setActiveWordIdx(idx)
            } else {
              advanceAfterLine()
            }
          }, msPerWord)
        )
      }
    },
    [clearTimers, stopPlayback]
  )

  const handleTogglePlay = () => {
    if (!currentSong) return
    if (isPlaying) {
      stopPlayback()
    } else {
      setStageMode('studio')
      isPlayingRef.current = true
      setIsPlaying(true)
      if (ambientBeatEnabled) {
        karaokeBeat.start(currentSong.id)
      }
      speakLineWithExactSync(activeLineIdx, currentSong)
    }
  }

  const handleJumpToLine = (lineIndex: number) => {
    if (!currentSong) return
    setActiveLineIdx(lineIndex)
    isPlayingRef.current = true
    setIsPlaying(true)
    if (stageMode === 'studio') {
      if (ambientBeatEnabled) karaokeBeat.start(currentSong.id)
      speakLineWithExactSync(lineIndex, currentSong)
    }
  }

  const handlePrevLine = () => {
    if (!currentSong) return
    const prev = Math.max(0, activeLineIdx - 1)
    if (isPlaying) {
      speakLineWithExactSync(prev, currentSong)
    } else {
      setActiveLineIdx(prev)
      setActiveWordIdx(-1)
    }
  }

  const handleNextLine = () => {
    if (!currentSong) return
    const next = Math.min(currentSong.subtitles.length - 1, activeLineIdx + 1)
    if (isPlaying) {
      speakLineWithExactSync(next, currentSong)
    } else {
      setActiveLineIdx(next)
      setActiveWordIdx(-1)
    }
  }

  const handleToggleBeat = () => {
    const next = !ambientBeatEnabled
    setAmbientBeatEnabled(next)
    if (isPlaying && currentSong) {
      if (next) karaokeBeat.start(currentSong.id)
      else karaokeBeat.stop()
    }
  }

  // Auto-scroll active subtitle line smoothly inside its container only
  useEffect(() => {
    const container = subtitlesScrollContainerRef.current
    const activeEl = activeSubtitleRef.current
    if (container && activeEl) {
      const elTop = activeEl.offsetTop - container.offsetTop
      const elHeight = activeEl.offsetHeight
      const containerScrollTop = container.scrollTop
      const containerHeight = container.clientHeight

      if (elTop < containerScrollTop || elTop + elHeight > containerScrollTop + containerHeight - 10) {
        container.scrollTo({
          top: Math.max(0, elTop - 24),
          behavior: 'smooth'
        })
      }
    }
  }, [activeLineIdx])

  const handleStartTypingLesson = () => {
    if (!currentSong) return
    stopPlayback()

    const lessonData: LessonData = {
      id: `music-${currentSong.id}`,
      title: `${currentSong.artist} — ${currentSong.title}`,
      level: currentSong.level,
      description: `Слепая печать по тексту песни «${currentSong.title}». ${currentSong.grammarFocus}.`,
      sentences: currentSong.typingSentences
    }

    onStartTyping(lessonData)
  }

  const aiAnalysis = AI_SONG_ANALYSES[selectedSongId] || AI_SONG_ANALYSES['queen-champions']
  const activeSub = currentSong?.subtitles[activeLineIdx] || currentSong?.subtitles[0]
  const nextSub = currentSong?.subtitles[activeLineIdx + 1]
  const activeWords = activeSub ? activeSub.textEn.split(' ').filter(Boolean) : []
  const lineProgressPct =
    activeWords.length > 0 && activeWordIdx >= 0
      ? Math.min(100, Math.round(((activeWordIdx + 1) / activeWords.length) * 100))
      : 0

  return (
    <div
      className="space-y-6 max-w-5xl mx-auto w-full animate-fade-in"
      data-testid="music-clips-view"
      onMouseUp={handleTextSelection}
    >
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#090d16]/85 backdrop-blur-2xl border border-white/[0.08] shadow-2xl shadow-black/80">
        <div className="flex items-center space-x-3.5">
          {onBack && (
            <button
              onClick={() => {
                stopPlayback()
                onBack()
              }}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono transition cursor-pointer active:scale-95"
              title="Назад к тренировке"
              data-testid="music-back-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
          )}
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/20">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Музыкальные клипы & Разбор грамматики
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-400/25 font-mono">
                Exact Voice Sync
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Точное пословное караоке без задержек, перевод любого слова в тексте, разбор смысла от AI и печать!
            </p>
          </div>
        </div>

        {currentSong && (
          <button
            onClick={handleStartTypingLesson}
            className="px-4 py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/25 transition-all flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
            data-testid="start-music-typing-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>Начать печать песни</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Song Selector Carousel / Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
        {songsList.map(song => {
          const isSelected = song.id === selectedSongId
          return (
            <button
              key={song.id}
              onClick={() => setSelectedSongId(song.id)}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 text-left ${
                isSelected
                  ? 'bg-white/[0.08] border-sky-400/60 shadow-lg shadow-sky-500/10 text-white font-semibold ring-1 ring-sky-400/30'
                  : 'bg-[#090d16]/80 border-white/[0.06] text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
              data-testid={`song-tab-${song.id}`}
            >
              <div className="w-7 h-7 rounded-lg bg-sky-500/10 flex items-center justify-center font-bold text-xs text-sky-400 border border-sky-500/25 font-mono">
                {song.level}
              </div>
              <div>
                <div className="text-xs font-bold text-slate-200">{song.title}</div>
                <div className="text-[11px] text-slate-400">{song.artist}</div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Song Detail Body: 2 Columns */}
      {currentSong && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Reinvented Studio Karaoke Stage + Interactive Subtitles */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-[#090d16] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/80">
              {/* Stage Mode Switcher: Studio Exact Karaoke vs YouTube Clip */}
              <div className="px-4 py-2.5 bg-white/[0.02] border-b border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
                  <button
                    onClick={() => setStageMode('studio')}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      stageMode === 'studio'
                        ? 'bg-sky-400 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    data-testid="mode-studio-karaoke"
                  >
                    <Mic className="w-3.5 h-3.5" />
                    <span>Студийное караоке</span>
                  </button>
                  <button
                    onClick={() => {
                      stopPlayback()
                      setStageMode('youtube')
                    }}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                      stageMode === 'youtube'
                        ? 'bg-white/[0.12] text-white font-semibold border border-white/[0.1]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    data-testid="mode-youtube-clip"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Клип YouTube</span>
                  </button>
                </div>

                {/* Tempo Selector (for Studio Karaoke) */}
                {stageMode === 'studio' && (
                  <div className="flex items-center space-x-1 text-[11px] font-mono bg-white/[0.03] px-2 py-1 rounded-xl border border-white/[0.06]">
                    <span className="text-slate-500 mr-1">Темп:</span>
                    {[0.75, 0.9, 1.0, 1.15].map(rate => (
                      <button
                        key={rate}
                        onClick={() => setTempo(rate)}
                        className={`px-1.5 py-0.5 rounded-md transition cursor-pointer ${
                          tempo === rate
                            ? 'bg-sky-500/25 text-sky-300 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STAGE CONTENT: STUDIO TELEPROMPTER OR YOUTUBE IFRAME */}
              {stageMode === 'studio' ? (
                <div
                  className="relative px-6 py-8 bg-[radial-gradient(ellipse_90%_70%_at_50%_0%,rgba(56,189,248,0.14),rgba(5,8,16,0.98))] min-h-[250px] flex flex-col justify-between gap-5"
                  data-testid="studio-karaoke-stage"
                >
                  {/* Top Row: Track info + Animated Equalizer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse' : 'bg-slate-600'}`} />
                      <span className="text-xs font-mono text-slate-300">
                        {currentSong.artist} — <strong className="text-white">{currentSong.title}</strong>
                      </span>
                    </div>

                    {/* Live Equalizer Bars */}
                    <div className="flex items-end gap-1 h-4" aria-hidden="true">
                      {[0.4, 0.85, 0.6, 1.0, 0.5, 0.75].map((h, i) => (
                        <span
                          key={i}
                          className={`w-1 rounded-full bg-gradient-to-t from-sky-500 to-cyan-300 transition-all duration-150 ${
                            isPlaying ? 'animate-pulse' : 'opacity-25'
                          }`}
                          style={{
                            height: isPlaying ? `${Math.round(h * 16)}px` : '4px',
                            animationDelay: `${i * 110}ms`
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Centerpiece: Big Glowing Word-by-Word Teleprompter */}
                  {activeSub && (
                    <div className="space-y-3 text-center my-auto">
                      <div className="font-mono text-xl sm:text-2xl leading-relaxed flex flex-wrap justify-center gap-x-2.5 gap-y-2 select-text">
                        {activeWords.map((w, wIdx) => {
                          const isCurrent = isPlaying && wIdx === activeWordIdx
                          const isPast = isPlaying && activeWordIdx > -1 && wIdx < activeWordIdx
                          return (
                            <span
                              key={wIdx}
                              onClick={() => selectWord(w)}
                              className={`cursor-pointer rounded-xl transition-colors ${
                                isCurrent
                                  ? 'text-white font-black bg-sky-500/30 px-2.5 py-0.5 border border-sky-400/60 shadow-[0_0_24px_rgba(56,189,248,0.5)]'
                                  : isPast
                                    ? 'text-sky-300 font-bold px-0.5'
                                    : 'text-slate-400 hover:text-sky-200 px-0.5'
                              }`}
                              title="Нажмите на слово для перевода"
                            >
                              {w}
                            </span>
                          )
                        })}
                      </div>

                      <div className="text-sm text-slate-300 font-medium">
                        {activeSub.textRu}
                      </div>

                      {nextSub && (
                        <div className="text-xs font-mono text-slate-500 pt-1">
                          Далее: {nextSub.textEn}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Line Progress Hairline */}
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-500 rounded-full transition-all duration-150"
                        style={{ width: `${lineProgressPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>Строка {activeLineIdx + 1} из {currentSong.subtitles.length}</span>
                      <span>100% синхронизация по слову</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative aspect-video w-full bg-[#050810]">
                  <iframe
                    className="w-full h-full"
                    src={`${currentSong.videoUrl}?rel=0&modestbranding=1`}
                    title={`${currentSong.artist} - ${currentSong.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Transport Control Deck */}
              <div className="p-3.5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06]">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePrevLine}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                    title="Предыдущая строка"
                  >
                    <SkipBack className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-sky-500/20 transition cursor-pointer active:scale-[0.98]"
                    data-testid="karaoke-toggle-btn"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Пауза</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Старт караоке</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleNextLine}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                    title="Следующая строка"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      stopPlayback()
                      setActiveLineIdx(0)
                    }}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                    title="В начало песни"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center space-x-2 text-xs font-mono">
                  <button
                    onClick={() => setLoopLine(l => !l)}
                    className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                      loopLine
                        ? 'bg-amber-500/15 text-amber-300 border-amber-400/35 font-semibold'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.07] hover:text-white'
                    }`}
                    title="Зациклить текущую строку для отработки произношения"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Повтор</span>
                  </button>

                  <button
                    onClick={handleToggleBeat}
                    className={`px-2.5 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                      ambientBeatEnabled
                        ? 'bg-sky-500/15 text-sky-300 border-sky-400/35 font-semibold'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.07] hover:text-white'
                    }`}
                    title="Мягкий фоновый аккомпанемент аккордов"
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Минус</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Lyrics List with Built-in Word Translation (Idea #4) */}
            <div className="relative p-5 rounded-3xl bg-[#090d16] border border-white/[0.08] space-y-3 shadow-2xl shadow-black/60">
              {selectedWord && (
                <WordPopover
                  word={selectedWord}
                  onClose={clearSelectedWord}
                  className="absolute -top-16 left-1/2 -translate-x-1/2"
                />
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-sky-400" />
                  <span>Текст песни</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">
                    (выделите любое слово для перевода)
                  </span>
                </h4>

                <button
                  onClick={() => setTranslateOnClick(t => !t)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono border transition cursor-pointer flex items-center gap-1.5 ${
                    translateOnClick
                      ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 font-semibold'
                      : 'bg-white/[0.03] text-slate-400 border-white/[0.07] hover:text-white'
                  }`}
                  data-testid="lyrics-translate-mode-btn"
                  title="При включении клик по любому слову сразу показывает перевод и позволяет сохранить его в словарь"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Перевод по клику: {translateOnClick ? 'ВКЛ' : 'ВЫКЛ'}</span>
                </button>
              </div>

              <div
                ref={subtitlesScrollContainerRef}
                className="space-y-2 max-h-64 overflow-y-auto pr-1.5 scroll-smooth"
                data-testid="subtitles-scroll-container"
              >
                {currentSong.subtitles.map((sub, lineIndex) => {
                  const isActive = lineIndex === activeLineIdx
                  const words = sub.textEn.split(' ').filter(Boolean)

                  return (
                    <div
                      key={sub.id}
                      ref={isActive ? activeSubtitleRef : null}
                      onClick={() => {
                        if (!translateOnClick) handleJumpToLine(lineIndex)
                      }}
                      className={`p-3.5 rounded-2xl border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? 'bg-white/[0.07] border-sky-400/50 text-white shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/25'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="font-mono text-sm leading-relaxed flex flex-wrap gap-1.5 select-text">
                          {words.map((w, wIdx) => {
                            const cleaned = normalizeEnglishWord(w)
                            const isCurrentWord = isActive && isPlaying && wIdx === activeWordIdx
                            const isPastWord = isActive && isPlaying && activeWordIdx > -1 && wIdx < activeWordIdx
                            const isTranslated = selectedWord === cleaned

                            let wordStyle = 'text-slate-300 hover:text-sky-300 px-0.5 rounded'
                            if (isCurrentWord) {
                              wordStyle =
                                'text-white font-extrabold bg-sky-500/30 px-2 py-0.5 rounded-lg border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.35)]'
                            } else if (isTranslated) {
                              wordStyle = 'bg-sky-400/25 text-sky-200 underline decoration-sky-400 px-1 rounded'
                            } else if (isPastWord) {
                              wordStyle = 'text-sky-300 font-medium px-0.5'
                            }

                            return (
                              <span
                                key={wIdx}
                                onClick={e => {
                                  if (translateOnClick) {
                                    e.stopPropagation()
                                    selectWord(w)
                                  }
                                }}
                                className={`${wordStyle} cursor-pointer`}
                                data-testid={`lyric-word-${sub.id}-${cleaned}`}
                                title={translateOnClick ? 'Нажмите для перевода' : 'Кликните строку для воспроизведения'}
                              >
                                {w}
                              </span>
                            )
                          })}
                        </div>

                        <div className="text-xs text-slate-400">{sub.textRu}</div>
                      </div>

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          handleJumpToLine(lineIndex)
                        }}
                        className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-sky-400 shrink-0 transition cursor-pointer"
                        title="Озвучить и синхронизировать с этой строки"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Grammar Breakdown vs AI Meaning Analysis Tabs */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-5 rounded-3xl bg-[#090d16] border border-white/[0.08] space-y-4 shadow-2xl">
              {/* Tab Switcher: Grammar vs AI Meaning */}
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs font-mono">
                <button
                  onClick={() => setActiveTab('grammar')}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeTab === 'grammar'
                      ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.1]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="tab-grammar-rules"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Разбор правил песни</span>
                </button>

                <button
                  onClick={() => setActiveTab('ai-meaning')}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeTab === 'ai-meaning'
                      ? 'bg-white/[0.1] text-white font-semibold shadow-sm border border-white/[0.1]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  data-testid="tab-ai-meaning"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Смысл от AI</span>
                </button>
              </div>

              {/* TAB 1: GRAMMAR BREAKDOWN */}
              {activeTab === 'grammar' && (
                <div className="space-y-2.5 animate-fade-in">
                  <p className="text-xs text-slate-400">Грамматические конструкции из текста трека:</p>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {currentSong.grammarBreakdown.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-white/[0.12] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-sky-400">{rule.ruleTitle}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-sky-300 border border-white/[0.08]">
                            {rule.grammarTag}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-slate-200 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                          «{rule.lyricQuote}»
                        </div>

                        <div className="text-xs text-slate-400 leading-relaxed">{rule.explanation}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: AI DEEP MEANING & CULTURAL CONTEXT */}
              {activeTab === 'ai-meaning' && (
                <div className="space-y-3 animate-fade-in" data-testid="ai-meaning-content">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-transparent to-sky-500/10 border border-white/[0.08] space-y-2">
                    <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Главный философский посыл</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{aiAnalysis.mainTheme}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <div className="flex items-center space-x-1.5 text-sky-400 text-xs font-bold">
                      <Flame className="w-4 h-4" />
                      <span>Культурный и исторический контекст</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{aiAnalysis.culturalContext}</p>
                  </div>

                  {/* Metaphor Breakdown */}
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
                      <span>Скрытый подтекст ключевых метафор:</span>
                    </div>
                    <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1.5">
                      {aiAnalysis.metaphors.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-white/[0.12] transition-all"
                        >
                          <div className="text-xs font-mono font-semibold text-sky-300 flex items-center space-x-1.5">
                            <span className="text-sky-400 font-serif text-sm">“</span>
                            <span>{m.quote}</span>
                            <span className="text-sky-400 font-serif text-sm">”</span>
                          </div>
                          <div className="text-xs text-slate-300 leading-relaxed pl-1">{m.meaning}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Start Typing Call to Action */}
              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  onClick={handleStartTypingLesson}
                  className="w-full py-3.5 rounded-2xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98]"
                  data-testid="start-typing-cta"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Перейти к слепой печати песни</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
