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
  Crosshair,
  Languages
} from 'lucide-react'
import type { MusicLesson, LessonData } from '../../types'
import { api } from '../../services/api'
import { soundService } from '../../services/sound'
import { WordPopover } from '../typing/WordPopover'
import { useWordSelection } from '../../hooks/useWordSelection'
import { normalizeEnglishWord } from '../../utils/dictionary'

interface YTPlayerInstance {
  playVideo?: () => void
  pauseVideo?: () => void
  seekTo?: (seconds: number, allowSeekAhead?: boolean) => void
  getCurrentTime?: () => number
  getPlayerState?: () => number
  cueVideoById?: (videoId: string) => void
  loadVideoById?: (videoId: string) => void
  destroy?: () => void
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: {
      Player: new (
        element: HTMLElement | string,
        options: {
          width?: string | number
          height?: string | number
          videoId?: string
          playerVars?: Record<string, string | number>
          events?: {
            onReady?: () => void
            onStateChange?: (event: { data: number }) => void
          }
        }
      ) => YTPlayerInstance
    }
  }
}

interface MusicClipsViewProps {
  onStartTyping: (lesson: LessonData) => void
  onBack?: () => void
}

function extractYouTubeId(url: string): string {
  const match = url.match(/embed\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : '04854XqcfCY'
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

  // Real-time YouTube Clip Karaoke State (only updates on line/word changes -> 0 lag!)
  const [isKaraokePlaying, setIsKaraokePlaying] = useState<boolean>(false)
  const [isYtConnected, setIsYtConnected] = useState<boolean>(false)
  const [activeSubtitleId, setActiveSubtitleId] = useState<number>(1)
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1)
  const [isInIntro, setIsInIntro] = useState<boolean>(false)
  const [timingOffset, setTimingOffset] = useState<number>(0.0)
  const [syncFlashMsg, setSyncFlashMsg] = useState<string | null>(null)
  const [translateOnClick, setTranslateOnClick] = useState<boolean>(false)

  // Shared Word Translation Popover (Idea #4)
  const { selectedWord, handleTextSelection, selectWord, clearSelectedWord } = useWordSelection()

  // Direct DOM refs for silky 60-FPS updates without React re-render churn
  const ytHostRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null)
  const ytPlayerReadyRef = useRef<boolean>(false)
  const activeSubtitleRef = useRef<HTMLDivElement>(null)
  const subtitlesScrollContainerRef = useRef<HTMLDivElement>(null)
  const activeProgressBarRef = useRef<HTMLDivElement>(null)
  const spotlightProgressRef = useRef<HTMLDivElement>(null)
  const timeDisplayRef = useRef<HTMLSpanElement>(null)
  const introCountdownRef = useRef<HTMLSpanElement>(null)

  // Dual-source YouTube clock refs (YT.Player API + passive postMessage infoDelivery)
  const currentTimeRef = useRef<number>(0)
  const ytMsgTimeRef = useRef<number>(-1)
  const ytMsgPerfRef = useRef<number>(0)
  const seekingUntilRef = useRef<number>(0)
  const activeSubIdRef = useRef<number>(1)
  const activeWordIdxRef = useRef<number>(-1)
  const isInIntroRef = useRef<boolean>(false)
  const timingOffsetRef = useRef<number>(0)

  timingOffsetRef.current = timingOffset
  activeSubIdRef.current = activeSubtitleId
  activeWordIdxRef.current = activeWordIdx
  isInIntroRef.current = isInIntro

  // Passive YouTube postMessage listener (zero setState on time ticks -> zero lag, 100% reliable fallback clock!)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMessage = (event: MessageEvent) => {
      if (!event.data) return
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number' && !isNaN(data.info.currentTime)) {
            ytMsgTimeRef.current = data.info.currentTime
            ytMsgPerfRef.current = performance.now()
            if (!ytPlayerReadyRef.current) {
              setIsYtConnected(true)
            }
          }
          if (data.info.playerState === 1) {
            setIsKaraokePlaying(true)
          } else if (data.info.playerState === 2 || data.info.playerState === 0) {
            setIsKaraokePlaying(false)
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

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
    clearSelectedWord()
    const loadSong = async () => {
      try {
        const song = await api.getMusicLesson(selectedSongId)
        if (!isMounted) return

        setCurrentSong(song)
        currentTimeRef.current = 0
        ytMsgTimeRef.current = -1
        setTimingOffset(0)
        setIsKaraokePlaying(false)
        setActiveWordIdx(-1)
        setIsInIntro(false)
        if (timeDisplayRef.current) {
          timeDisplayRef.current.textContent = '0.0 сек'
        }
        if (song.subtitles.length > 0) {
          setActiveSubtitleId(song.subtitles[0].id)
        }

        // Switch video cleanly on existing YT.Player instance without detaching API
        const videoId = extractYouTubeId(song.videoUrl)
        if (ytPlayerRef.current && ytPlayerReadyRef.current && typeof ytPlayerRef.current.cueVideoById === 'function') {
          try {
            ytPlayerRef.current.cueVideoById(videoId)
          } catch {
            // safe fallback
          }
        }
      } catch {
        // Fallback
      }
    }
    loadSong()
    return () => {
      isMounted = false
    }
  }, [selectedSongId, clearSelectedWord])

  // Initialize official YouTube IFrame Player API once host div is mounted (!isLoading && currentSong)
  useEffect(() => {
    if (typeof window === 'undefined' || !currentSong || isLoading) return
    if (ytPlayerRef.current) return

    let cancelled = false
    const videoId = extractYouTubeId(currentSong.videoUrl)

    const mountPlayer = () => {
      if (cancelled || !window.YT?.Player || !ytHostRef.current || ytPlayerRef.current) return

      try {
        ytHostRef.current.innerHTML = ''
        const slot = document.createElement('div')
        slot.style.width = '100%'
        slot.style.height = '100%'
        ytHostRef.current.appendChild(slot)

        ytPlayerRef.current = new window.YT.Player(slot, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1
          },
          events: {
            onReady: () => {
              if (!cancelled) {
                ytPlayerReadyRef.current = true
                setIsYtConnected(true)
              }
            },
            onStateChange: event => {
              if (cancelled) return
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
              if (event.data === 1) {
                setIsKaraokePlaying(true)
              } else if (event.data === 2 || event.data === 0) {
                setIsKaraokePlaying(false)
              }
            }
          }
        })
      } catch {
        // Safe fallback for environments where YT API is unavailable
      }
    }

    if (window.YT?.Player) {
      mountPlayer()
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.()
        mountPlayer()
      }

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
      }
    }

    let attempts = 0
    const poll = setInterval(() => {
      attempts++
      if (ytPlayerRef.current || attempts > 40) {
        clearInterval(poll)
        return
      }
      if (window.YT?.Player && ytHostRef.current) {
        mountPlayer()
        clearInterval(poll)
      }
    }, 150)

    return () => {
      cancelled = true
      clearInterval(poll)
    }
  }, [currentSong, isLoading])

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      try {
        ytPlayerRef.current?.destroy?.()
      } catch {
        // ignore cleanup errors
      }
      ytPlayerRef.current = null
      ytPlayerReadyRef.current = false
    }
  }, [])

  // 60-FPS Zero-Lag YouTube Clock Sync Loop with Sub-Tick Interpolation
  useEffect(() => {
    if (!isKaraokePlaying || !currentSong || currentSong.subtitles.length === 0) return

    let rafId = 0
    let lastYtReading = -1
    let anchorYtTime = currentTimeRef.current
    let anchorPerfTime = performance.now()

    const tick = (now: number) => {
      if (Date.now() < seekingUntilRef.current) {
        rafId = requestAnimationFrame(tick)
        return
      }

      let ytReading = -1

      // Source 1: Direct YT.Player API getCurrentTime()
      if (ytPlayerRef.current && ytPlayerReadyRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const t = ytPlayerRef.current.getCurrentTime()
          if (typeof t === 'number' && !isNaN(t) && t >= 0) {
            ytReading = t
          }
        } catch {
          // try passive source below
        }
      }

      // Source 2: Passive YouTube postMessage infoDelivery clock (backup if YT.Player getter unavailable)
      if (ytReading < 0 && ytMsgTimeRef.current >= 0) {
        const age = Math.min(0.35, (now - ytMsgPerfRef.current) / 1000)
        ytReading = ytMsgTimeRef.current + age
      }

      let liveTime = currentTimeRef.current
      if (ytReading >= 0) {
        if (Math.abs(ytReading - lastYtReading) > 0.005) {
          lastYtReading = ytReading
          anchorYtTime = ytReading
          anchorPerfTime = now
          liveTime = ytReading
        } else {
          // Smooth 60-FPS interpolation between YouTube's 250ms clock updates (capped at 0.35s)
          liveTime = anchorYtTime + Math.min(0.35, (now - anchorPerfTime) / 1000)
        }
      }

      currentTimeRef.current = liveTime

      // Direct DOM update for timer display (zero React re-renders!)
      if (timeDisplayRef.current) {
        timeDisplayRef.current.textContent = `${liveTime.toFixed(1)} сек`
      }

      const effTime = Math.max(0, liveTime + timingOffsetRef.current)
      const firstStart = currentSong.subtitles[0].startSeconds
      const nowInIntro = effTime < firstStart

      if (nowInIntro !== isInIntroRef.current) {
        isInIntroRef.current = nowInIntro
        setIsInIntro(nowInIntro)
      }

      if (nowInIntro && introCountdownRef.current) {
        introCountdownRef.current.textContent = `${Math.max(0, firstStart - effTime).toFixed(1)}с`
      }

      const match = currentSong.subtitles.find(s => effTime >= s.startSeconds && effTime <= s.endSeconds)

      if (match) {
        if (match.id !== activeSubIdRef.current) {
          activeSubIdRef.current = match.id
          setActiveSubtitleId(match.id)
        }

        let nextWordIdx = -1
        if (match.words && match.words.length > 0) {
          nextWordIdx = match.words.findIndex(w => effTime >= w.start && effTime <= w.end)
          if (nextWordIdx === -1) {
            for (let i = match.words.length - 1; i >= 0; i--) {
              if (effTime >= match.words[i].start) {
                nextWordIdx = i
                break
              }
            }
          }
        } else {
          const wordsCount = match.textEn.split(' ').length
          const dur = Math.max(0.1, match.endSeconds - match.startSeconds)
          const progress = Math.max(0, Math.min(1, (effTime - match.startSeconds) / dur))
          nextWordIdx = Math.min(wordsCount - 1, Math.floor(progress * wordsCount))
        }

        if (nextWordIdx !== activeWordIdxRef.current) {
          activeWordIdxRef.current = nextWordIdx
          setActiveWordIdx(nextWordIdx)
        }

        const dur = Math.max(0.1, match.endSeconds - match.startSeconds)
        const pct = `${Math.max(0, Math.min(100, ((effTime - match.startSeconds) / dur) * 100)).toFixed(1)}%`
        if (activeProgressBarRef.current) activeProgressBarRef.current.style.width = pct
        if (spotlightProgressRef.current) spotlightProgressRef.current.style.width = pct
      } else if (activeWordIdxRef.current !== -1) {
        activeWordIdxRef.current = -1
        setActiveWordIdx(-1)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [isKaraokePlaying, currentSong])

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
  }, [activeSubtitleId])

  const executeSeekAndPlay = useCallback((targetTime: number, subId?: number) => {
    seekingUntilRef.current = Date.now() + 500
    currentTimeRef.current = targetTime
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = `${targetTime.toFixed(1)} сек`
    }
    if (subId !== undefined) {
      activeSubIdRef.current = subId
      setActiveSubtitleId(subId)
    }

    if (ytPlayerRef.current?.seekTo && ytPlayerReadyRef.current) {
      try {
        ytPlayerRef.current.seekTo(targetTime, true)
        ytPlayerRef.current.playVideo?.()
      } catch {
        // ignore
      }
    }
    setIsKaraokePlaying(true)
  }, [])

  const handlePlayWord = (e: React.MouseEvent, wordStart: number, subId: number) => {
    e.stopPropagation()
    executeSeekAndPlay(Math.max(0, wordStart - timingOffsetRef.current), subId)
  }

  const handleSkipIntro = () => {
    if (!currentSong || currentSong.subtitles.length === 0) return
    const firstVocalStart = Math.max(0, currentSong.subtitles[0].startSeconds - timingOffsetRef.current)
    executeSeekAndPlay(firstVocalStart, currentSong.subtitles[0].id)
  }

  const handleToggleKaraoke = () => {
    if (isKaraokePlaying) {
      try {
        ytPlayerRef.current?.pauseVideo?.()
      } catch {
        // ignore
      }
      setIsKaraokePlaying(false)
    } else {
      try {
        ytPlayerRef.current?.playVideo?.()
      } catch {
        // ignore
      }
      setIsKaraokePlaying(true)
    }
  }

  const handlePlayLine = (text: string, id: number, startSec: number) => {
    executeSeekAndPlay(Math.max(0, startSec - timingOffsetRef.current), id)
    soundService.speakText(text, 1.0)
  }

  // Smart Live Sync Lock: aligns the entire song's lyrics to the exact millisecond you hear this line
  const handleSyncToThisLine = (e: React.MouseEvent, subStartSeconds: number, subId: number) => {
    e.stopPropagation()
    let rawTime = currentTimeRef.current
    if (ytPlayerRef.current?.getCurrentTime && ytPlayerReadyRef.current) {
      try {
        const yt = ytPlayerRef.current.getCurrentTime()
        if (typeof yt === 'number' && !isNaN(yt)) rawTime = yt
      } catch {
        // use ref time
      }
    }
    const newOffset = Math.round((subStartSeconds - rawTime) * 10) / 10
    setTimingOffset(newOffset)
    activeSubIdRef.current = subId
    setActiveSubtitleId(subId)
    setSyncFlashMsg(`Синхронизировано (${newOffset >= 0 ? '+' : ''}${newOffset}с)`)
    setTimeout(() => setSyncFlashMsg(null), 2200)
  }

  const handleResetToStart = () => {
    seekingUntilRef.current = Date.now() + 500
    currentTimeRef.current = 0
    if (timeDisplayRef.current) {
      timeDisplayRef.current.textContent = '0.0 сек'
    }
    try {
      ytPlayerRef.current?.seekTo?.(0, true)
      ytPlayerRef.current?.pauseVideo?.()
    } catch {
      // ignore
    }
    setIsKaraokePlaying(false)
    setActiveWordIdx(-1)
    setIsInIntro(false)
    setActiveSubtitleId(currentSong?.subtitles[0]?.id || 1)
  }

  const handleStartTypingLesson = () => {
    if (!currentSong) return

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
              onClick={onBack}
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
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-sky-300 border border-white/[0.08] font-mono">
                YouTube Clip Sync
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Включайте клип — слова идут по темпу песни! Выделяйте любое слово для перевода и разбора.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: YouTube Clip + Live Karaoke Spotlight + Synchronized Subtitles */}
          <div className="lg:col-span-7 space-y-4">
            {/* Video Player Card */}
            <div className="rounded-3xl bg-[#090d16] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/80">
              <div className="relative aspect-video w-full bg-[#050810] flex items-center justify-center">
                <div ref={ytHostRef} className="w-full h-full" />
              </div>

              {/* Player Header bar & Karaoke Controls */}
              <div className="p-3.5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06]">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>
                      {currentSong.artist} — {currentSong.title}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-normal border flex items-center gap-1 ${
                        isYtConnected
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/25'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/20'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isYtConnected ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-sky-400 animate-pulse'
                        }`}
                      />
                      {isYtConnected ? 'YouTube Sync Active' : 'Clip Sync'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-sky-400 font-mono mt-0.5">{currentSong.grammarFocus}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleKaraoke}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-sky-500/20 transition cursor-pointer active:scale-[0.98]"
                    data-testid="karaoke-toggle-btn"
                  >
                    {isKaraokePlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Пауза</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Включить клип</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSkipIntro}
                    className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono transition cursor-pointer"
                    title="Перемотать клип сразу к первому слову вокала"
                  >
                    К вокалу ⏩
                  </button>

                  <button
                    onClick={handleResetToStart}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                    title="С начала клипа (0:00)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Karaoke Teleprompter synced directly to YouTube Clip Tempo */}
              {(() => {
                const activeIdx = currentSong.subtitles.findIndex(s => s.id === activeSubtitleId)
                const activeSub = currentSong.subtitles[activeIdx] || currentSong.subtitles[0]
                const nextSub = activeIdx >= 0 ? currentSong.subtitles[activeIdx + 1] : currentSong.subtitles[1]
                if (!activeSub) return null
                const spotlightWords = activeSub.textEn.split(' ')
                return (
                  <div className="relative px-5 py-4 bg-gradient-to-b from-[#070b14] to-[#050810] border-t border-white/[0.06] space-y-2">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-base sm:text-lg leading-snug select-text">
                      {spotlightWords.map((w, idx) => {
                        const isCur = isKaraokePlaying && !isInIntro && idx === activeWordIdx
                        const isPast = isKaraokePlaying && !isInIntro && activeWordIdx > -1 && idx < activeWordIdx
                        return (
                          <span
                            key={idx}
                            onClick={() => selectWord(w)}
                            className={`cursor-pointer ${
                              isCur
                                ? 'text-white font-black bg-sky-500/30 px-2 py-0.5 rounded-lg border border-sky-400/60 shadow-[0_0_16px_rgba(56,189,248,0.45)]'
                                : isPast
                                  ? 'text-sky-300 font-bold'
                                  : 'text-slate-400 hover:text-sky-200 font-medium'
                            }`}
                            title="Нажмите на слово для перевода"
                          >
                            {w}
                          </span>
                        )
                      })}
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="text-slate-400">{activeSub.textRu}</span>
                      {nextSub && (
                        <span className="text-[11px] font-mono text-slate-600 truncate max-w-[45%] hidden sm:inline">
                          Далее: {nextSub.textEn}
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1 bg-white/[0.05] rounded-full overflow-hidden">
                      <div
                        ref={spotlightProgressRef}
                        className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-500 rounded-full"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Synchronized Karaoke Subtitles + Word Translation Popover */}
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
                  <span>Караоке-субтитры</span>
                  {syncFlashMsg && (
                    <span className="text-[10px] text-emerald-300 font-mono font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/30 animate-fade-in">
                      ✓ {syncFlashMsg}
                    </span>
                  )}
                </h4>

                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <button
                    onClick={() => setTranslateOnClick(t => !t)}
                    className={`px-2 py-0.5 rounded-xl text-[11px] border transition cursor-pointer flex items-center gap-1 ${
                      translateOnClick
                        ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 font-semibold'
                        : 'bg-white/[0.03] text-slate-400 border-white/[0.07] hover:text-white'
                    }`}
                    data-testid="lyrics-translate-mode-btn"
                    title="Клик по любому слову открывает перевод и сохранение в словарь"
                  >
                    <Languages className="w-3 h-3" />
                    <span>Перевод: {translateOnClick ? 'ВКЛ' : 'ВЫКЛ'}</span>
                  </button>

                  {/* Calibration offset controls */}
                  <div
                    className="flex items-center space-x-1 bg-white/[0.02] px-2 py-0.5 rounded-xl border border-white/[0.06] text-[11px]"
                    title="Точная подстройка сдвига субтитров под звук клипа"
                  >
                    <span className="text-slate-500 text-[10px]">Сдвиг:</span>
                    <button
                      onClick={() => setTimingOffset(prev => Math.round((prev - 0.2) * 10) / 10)}
                      className="px-1 py-0.5 rounded hover:bg-sky-500/20 text-sky-300 transition cursor-pointer"
                    >
                      -0.2s
                    </button>
                    <button
                      onClick={() => setTimingOffset(0)}
                      className={`px-1 py-0.5 rounded transition cursor-pointer ${
                        timingOffset === 0 ? 'text-slate-400' : 'text-sky-400 font-bold bg-sky-500/20'
                      }`}
                    >
                      {timingOffset === 0 ? '0.0s' : `${timingOffset > 0 ? '+' : ''}${timingOffset}s`}
                    </button>
                    <button
                      onClick={() => setTimingOffset(prev => Math.round((prev + 0.2) * 10) / 10)}
                      className="px-1 py-0.5 rounded hover:bg-sky-500/20 text-sky-300 transition cursor-pointer"
                    >
                      +0.2s
                    </button>
                  </div>

                  <span ref={timeDisplayRef} className="text-sky-400 font-bold min-w-[50px] text-right">
                    0.0 сек
                  </span>
                </div>
              </div>

              {/* Instrumental Intro Live Banner */}
              {isKaraokePlaying && isInIntro && currentSong.subtitles[0] && (
                <div className="p-3 rounded-2xl bg-sky-500/[0.07] border border-sky-400/30 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-sky-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                    <span>Вступление (инструментал) • Вокал через:</span>
                    <span ref={introCountdownRef} className="font-bold text-white text-sm">
                      {currentSong.subtitles[0].startSeconds.toFixed(1)}с
                    </span>
                  </div>
                  <button
                    onClick={handleSkipIntro}
                    className="px-3 py-1 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold font-mono text-[11px] transition shadow-md shadow-sky-500/20 cursor-pointer flex items-center space-x-1"
                  >
                    <span>Пропустить к пению</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div
                ref={subtitlesScrollContainerRef}
                className="space-y-2.5 max-h-64 overflow-y-auto pr-1.5 scroll-smooth"
                data-testid="subtitles-scroll-container"
              >
                {currentSong.subtitles.map(sub => {
                  const isActive = activeSubtitleId === sub.id
                  const words = sub.textEn.split(' ')

                  return (
                    <div
                      key={sub.id}
                      ref={isActive ? activeSubtitleRef : null}
                      onClick={() => {
                        if (!translateOnClick) handlePlayLine(sub.textEn, sub.id, sub.startSeconds)
                      }}
                      className={`p-3.5 rounded-2xl border transition-colors cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? 'bg-white/[0.07] border-sky-400/50 text-white shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/30'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          <div className="font-mono text-sm sm:text-base leading-relaxed flex flex-wrap gap-1.5 select-text">
                            {words.map((w, wIdx) => {
                              const cleaned = normalizeEnglishWord(w)
                              const isCurrentWord = isActive && isKaraokePlaying && !isInIntro && wIdx === activeWordIdx
                              const isPastWord =
                                isActive && isKaraokePlaying && !isInIntro && activeWordIdx > -1 && wIdx < activeWordIdx
                              const wordTiming = sub.words?.[wIdx]

                              let wordStyle = 'text-slate-400 hover:text-sky-300 px-0.5'
                              if (isCurrentWord) {
                                wordStyle =
                                  'text-white font-extrabold bg-sky-500/30 px-2 py-0.5 rounded-lg border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.35)] inline-block'
                              } else if (selectedWord === cleaned) {
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
                                    } else if (wordTiming) {
                                      handlePlayWord(e, wordTiming.start, sub.id)
                                    }
                                  }}
                                  className={`${wordStyle} cursor-pointer`}
                                  data-testid={`lyric-word-${sub.id}-${cleaned}`}
                                  title={
                                    translateOnClick
                                      ? 'Нажмите для перевода'
                                      : wordTiming
                                        ? `Перейти к ${wordTiming.start}с`
                                        : undefined
                                  }
                                >
                                  {w}
                                </span>
                              )
                            })}
                          </div>

                          <div className="text-xs text-slate-400">{sub.textRu}</div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {isKaraokePlaying && (
                            <button
                              onClick={e => handleSyncToThisLine(e, sub.startSeconds, sub.id)}
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-sky-500/20 text-slate-400 hover:text-sky-300 transition cursor-pointer"
                              title="Поймать ритм: нажмите в момент, когда звучит начало этой строки"
                            >
                              <Crosshair className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              handlePlayLine(sub.textEn, sub.id, sub.startSeconds)
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-sky-400 transition cursor-pointer"
                            title="Перемотать клип к этой строке"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {isActive && isKaraokePlaying && !isInIntro && (
                        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                          <div
                            ref={activeProgressBarRef}
                            className="h-full bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-500 rounded-full"
                            style={{ width: '0%' }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Expanded Grammar Breakdown vs AI Meaning Analysis Tabs */}
          <div className="lg:col-span-5 space-y-3">
            <div className="p-5 rounded-3xl bg-[#090d16] border border-white/[0.08] space-y-4 shadow-2xl">
              {/* Tab Switcher: Grammar vs AI Meaning */}
              <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] rounded-xl border border-white/[0.06] text-xs font-mono">
                <button
                  onClick={() => setActiveTab('grammar')}
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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
                  className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
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

              {/* TAB 1: EXPANDED GRAMMAR BREAKDOWN (Spacious, matches AI Meaning height!) */}
              {activeTab === 'grammar' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-transparent to-indigo-500/10 border border-white/[0.08] flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                        <span>Грамматический фокус трека</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{currentSong.grammarFocus}</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1.5">
                    {currentSong.grammarBreakdown.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2.5 hover:border-sky-400/30 transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-sky-300">{rule.ruleTitle}</span>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/25 shrink-0">
                            {rule.grammarTag}
                          </span>
                        </div>

                        <div className="font-mono text-xs sm:text-sm text-white bg-[#050810] p-3 rounded-xl border border-white/[0.07] select-text">
                          «{rule.lyricQuote}»
                        </div>

                        <div className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
                          {rule.explanation}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: AI DEEP MEANING & CULTURAL CONTEXT */}
              {activeTab === 'ai-meaning' && (
                <div className="space-y-3 animate-fade-in" data-testid="ai-meaning-content">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-transparent to-sky-500/10 border border-white/[0.08] space-y-2">
                    <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Главный философский посыл</span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">{aiAnalysis.mainTheme}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-2">
                    <div className="flex items-center space-x-1.5 text-sky-400 text-xs font-bold">
                      <Flame className="w-4 h-4" />
                      <span>Культурный и исторический контекст</span>
                    </div>
                    <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">{aiAnalysis.culturalContext}</p>
                  </div>

                  {/* Metaphor Breakdown */}
                  <div className="space-y-2.5">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                      <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]"></span>
                      <span>Скрытый подтекст ключевых метафор:</span>
                    </div>
                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1.5">
                      {aiAnalysis.metaphors.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-white/[0.025] border border-white/[0.07] space-y-1.5 hover:border-white/[0.14] transition-all"
                        >
                          <div className="text-xs sm:text-sm font-mono font-semibold text-sky-300 flex items-center space-x-1.5 select-text">
                            <span className="text-sky-400 font-serif text-sm">“</span>
                            <span>{m.quote}</span>
                            <span className="text-sky-400 font-serif text-sm">”</span>
                          </div>
                          <div className="text-xs sm:text-[13px] text-slate-300 leading-relaxed pl-1">{m.meaning}</div>
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
