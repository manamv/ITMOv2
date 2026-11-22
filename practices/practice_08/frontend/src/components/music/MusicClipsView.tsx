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
  Crosshair
} from 'lucide-react'
import type { MusicLesson, LessonData } from '../../types'
import { api } from '../../services/api'
import { soundService } from '../../services/sound'

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

  // Minimal reactive karaoke state (only updates on line/word transitions — zero per-frame lag!)
  const [isKaraokePlaying, setIsKaraokePlaying] = useState<boolean>(false)
  const [activeSubtitleId, setActiveSubtitleId] = useState<number>(1)
  const [activeWordIdx, setActiveWordIdx] = useState<number>(-1)
  const [isInIntro, setIsInIntro] = useState<boolean>(false)
  const [timingOffset, setTimingOffset] = useState<number>(0.0)
  const [syncFlashMsg, setSyncFlashMsg] = useState<string | null>(null)

  // Direct DOM refs for buttery 60-FPS updates without React re-renders
  const ytHostRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<YTPlayerInstance | null>(null)
  const ytPlayerReadyRef = useRef<boolean>(false)
  const activeSubtitleRef = useRef<HTMLDivElement>(null)
  const subtitlesScrollContainerRef = useRef<HTMLDivElement>(null)
  const activeProgressBarRef = useRef<HTMLDivElement>(null)
  const timeDisplayRef = useRef<HTMLSpanElement>(null)
  const introCountdownRef = useRef<HTMLSpanElement>(null)

  // Mutable high-precision clock refs
  const currentTimeRef = useRef<number>(0)
  const seekingUntilRef = useRef<number>(0)
  const activeSubIdRef = useRef<number>(1)
  const activeWordIdxRef = useRef<number>(-1)
  const isInIntroRef = useRef<boolean>(false)
  const timingOffsetRef = useRef<number>(0)
  timingOffsetRef.current = timingOffset

  // Keep refs synced with React state
  activeSubIdRef.current = activeSubtitleId
  activeWordIdxRef.current = activeWordIdx
  isInIntroRef.current = isInIntro

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
    const loadSong = async () => {
      try {
        const song = await api.getMusicLesson(selectedSongId)
        if (!isMounted) return

        setCurrentSong(song)
        currentTimeRef.current = 0
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
  }, [selectedSongId])

  // Initialize official YouTube IFrame Player API cleanly once
  useEffect(() => {
    if (typeof window === 'undefined' || !currentSong) return

    let cancelled = false
    const videoId = extractYouTubeId(currentSong.videoUrl)

    const mountPlayer = () => {
      if (cancelled || !window.YT?.Player || !ytHostRef.current || ytPlayerRef.current) return

      try {
        ytPlayerRef.current = new window.YT.Player(ytHostRef.current, {
          width: '100%',
          height: '100%',
          videoId,
          playerVars: {
            enablejsapi: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            origin: window.location.origin
          },
          events: {
            onReady: () => {
              ytPlayerReadyRef.current = true
            },
            onStateChange: (event) => {
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

    return () => {
      cancelled = true
    }
  }, [currentSong !== null])

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

  // 60-FPS Zero-Lag requestAnimationFrame Karaoke Sync Loop with Sub-Tick Interpolation
  useEffect(() => {
    if (!isKaraokePlaying || !currentSong || currentSong.subtitles.length === 0) return

    let rafId = 0
    let lastYtReading = -1
    let anchorYtTime = currentTimeRef.current
    let anchorPerfTime = performance.now()
    let lastFallbackPerf = performance.now()

    const tick = (now: number) => {
      if (Date.now() < seekingUntilRef.current) {
        rafId = requestAnimationFrame(tick)
        return
      }

      let liveTime = currentTimeRef.current

      // 1. Read exact YouTube playback time & smoothly interpolate between YouTube's ~250ms clock ticks
      if (ytPlayerRef.current && ytPlayerReadyRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const ytTime = ytPlayerRef.current.getCurrentTime()
          if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime >= 0) {
            if (Math.abs(ytTime - lastYtReading) > 0.005) {
              lastYtReading = ytTime
              anchorYtTime = ytTime
              anchorPerfTime = now
              liveTime = ytTime
            } else {
              // Smoothly interpolate up to 0.35s between YT API ticks for silky 60fps progress
              const elapsed = Math.min(0.35, (now - anchorPerfTime) / 1000)
              liveTime = anchorYtTime + elapsed
            }
          }
        } catch {
          // fallback below
        }
      } else {
        // 2. Wall-clock fallback (offline / tests)
        const deltaSec = (now - lastFallbackPerf) / 1000
        lastFallbackPerf = now
        liveTime = currentTimeRef.current + deltaSec
        const maxTime = currentSong.subtitles[currentSong.subtitles.length - 1].endSeconds
        if (liveTime > maxTime + 5.0) {
          setIsKaraokePlaying(false)
          currentTimeRef.current = 0
          return
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

      // Find active subtitle line
      const match = currentSong.subtitles.find(
        s => effTime >= s.startSeconds && effTime <= s.endSeconds
      )

      if (match) {
        if (match.id !== activeSubIdRef.current) {
          activeSubIdRef.current = match.id
          setActiveSubtitleId(match.id)
        }

        // Compute exact active word index
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

        // Direct DOM update for silky 60fps progress bar (zero React re-renders!)
        if (activeProgressBarRef.current) {
          const dur = Math.max(0.1, match.endSeconds - match.startSeconds)
          const pct = Math.max(0, Math.min(100, ((effTime - match.startSeconds) / dur) * 100))
          activeProgressBarRef.current.style.width = `${pct.toFixed(1)}%`
        }
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

  // Smart Live Sync Lock: aligns the entire song's lyrics to the exact millisecond you hear this line!
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
    <div className="space-y-6 max-w-5xl mx-auto w-full animate-fade-in" data-testid="music-clips-view">
      {/* Header Banner - Linear Midnight Navy */}
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
                60fps Studio Sync
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Смотрите клип с пословной синхронизацией караоке, изучайте смысл от AI и тренируйте скоропечатание!
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
          {/* LEFT COLUMN: Video Player & Synchronized Word-by-Word Karaoke Subtitles */}
          <div className="lg:col-span-7 space-y-4">
            {/* Video Player Card */}
            <div className="rounded-3xl bg-[#090d16] border border-white/[0.08] overflow-hidden shadow-2xl shadow-black/80">
              <div className="relative aspect-video w-full bg-[#050810] flex items-center justify-center">
                {/* Official YouTube IFrame API stable mount container */}
                <div ref={ytHostRef} className="w-full h-full" />
              </div>

              {/* Player Header bar & Karaoke Controls */}
              <div className="p-3.5 bg-white/[0.02] flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06]">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>
                      {currentSong.artist} — {currentSong.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-mono font-normal border border-sky-500/20">
                      Studio Karaoke Sync
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
                        <span>Включить караоке</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleSkipIntro}
                    className="px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-mono transition cursor-pointer"
                    title="Перейти сразу к первому слову песни (без вступления)"
                  >
                    К вокалу ⏩
                  </button>

                  <button
                    onClick={handleResetToStart}
                    className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.08] transition cursor-pointer"
                    title="С начала видео (0:00)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Synchronized Karaoke Subtitles with 60fps Direct DOM Progress & Live Sync Lock */}
            <div className="p-5 rounded-3xl bg-[#090d16] border border-white/[0.08] space-y-3 shadow-2xl shadow-black/60">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-sky-400" />
                  <span>Караоке-субтитры</span>
                  {syncFlashMsg ? (
                    <span className="text-[10px] text-emerald-300 font-mono font-semibold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-400/30 animate-fade-in">
                      ✓ {syncFlashMsg}
                    </span>
                  ) : (
                    <span className="text-[10px] text-sky-300 font-mono font-normal lowercase bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      пословная синхронизация
                    </span>
                  )}
                </h4>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  {/* Calibration offset controls */}
                  <div
                    className="flex items-center space-x-1 bg-white/[0.02] px-2 py-0.5 rounded-xl border border-white/[0.06] text-[11px]"
                    title="Точная подстройка сдвига субтитров под звук"
                  >
                    <span className="text-slate-500 text-[10px]">Сдвиг:</span>
                    <button
                      onClick={() => setTimingOffset(prev => Math.round((prev - 0.2) * 10) / 10)}
                      className="px-1.5 py-0.5 rounded hover:bg-sky-500/20 text-sky-300 transition cursor-pointer"
                      title="-0.2с"
                    >
                      -0.2s
                    </button>
                    <button
                      onClick={() => setTimingOffset(0)}
                      className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                        timingOffset === 0 ? 'text-slate-400' : 'text-sky-400 font-bold bg-sky-500/20'
                      }`}
                      title="Сбросить сдвиг"
                    >
                      {timingOffset === 0 ? '0.0s' : `${timingOffset > 0 ? '+' : ''}${timingOffset}s`}
                    </button>
                    <button
                      onClick={() => setTimingOffset(prev => Math.round((prev + 0.2) * 10) / 10)}
                      className="px-1.5 py-0.5 rounded hover:bg-sky-500/20 text-sky-300 transition cursor-pointer"
                      title="+0.2с"
                    >
                      +0.2s
                    </button>
                  </div>

                  <span ref={timeDisplayRef} className="text-sky-400 font-bold min-w-[54px] text-right">
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
                      onClick={() => handlePlayLine(sub.textEn, sub.id, sub.startSeconds)}
                      className={`p-4 rounded-2xl border transition-colors cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? 'bg-white/[0.07] border-sky-400/50 text-white shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/30'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Word-by-word karaoke highlighting with clickable jump */}
                          <div className="font-mono text-sm sm:text-base leading-relaxed flex flex-wrap gap-1.5">
                            {words.map((w, wIdx) => {
                              const isCurrentWord = isActive && isKaraokePlaying && wIdx === activeWordIdx
                              const isPastWord =
                                isActive && isKaraokePlaying && activeWordIdx > -1 && wIdx < activeWordIdx
                              const wordTiming = sub.words?.[wIdx]

                              let wordStyle = 'text-slate-400 hover:text-sky-300 px-0.5'
                              if (isCurrentWord) {
                                wordStyle =
                                  'text-white font-extrabold bg-sky-500/30 px-2 py-0.5 rounded-lg border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.35)] inline-block'
                              } else if (isPastWord) {
                                wordStyle = 'text-sky-300 font-medium px-0.5'
                              }

                              return (
                                <span
                                  key={wIdx}
                                  onClick={e =>
                                    wordTiming ? handlePlayWord(e, wordTiming.start, sub.id) : undefined
                                  }
                                  className={`${wordStyle} cursor-pointer`}
                                  title={wordTiming ? `Перейти к ${wordTiming.start}с` : undefined}
                                >
                                  {w}
                                </span>
                              )
                            })}
                          </div>

                          <div className="text-xs text-slate-400">{sub.textRu}</div>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Smart Live Sync Button: tap when you hear this line start */}
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
                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-sky-400 transition cursor-pointer"
                            title="Прослушать строку"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 60-FPS Direct DOM Progress Fill Bar */}
                      {isActive && isKaraokePlaying && (
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
