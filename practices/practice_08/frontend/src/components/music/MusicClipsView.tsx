import React, { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause, Volume2, BookOpen, Sparkles, ChevronRight, Headphones, Bot, Flame, RotateCcw, ArrowLeft } from 'lucide-react'
import type { MusicLesson, LessonData } from '../../types'
import { api } from '../../services/api'
import { soundService } from '../../services/sound'

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void
    YT?: any
  }
}

interface MusicClipsViewProps {
  onStartTyping: (lesson: LessonData) => void
  onBack?: () => void
}

// Deep AI Meaning Analysis for famous tracks
const AI_SONG_ANALYSES: Record<string, {
  mainTheme: string
  culturalContext: string
  metaphors: Array<{ quote: string; meaning: string }>
  emotionalTone: string
}> = {
  'queen-champions': {
    mainTheme: 'Триумф несгибаемой воли через преодоление боли, несправедливости и сомнений.',
    culturalContext: 'Написанная Фредди Меркьюри в 1977 году, песня создавалась как стадионный манифест единства. Меркьюри подчеркивал, что это гимн не элитарных победителей, а каждого простого человека, выдержавшего удары судьбы.',
    metaphors: [
      {
        quote: 'i have paid my dues time after time',
        meaning: 'Метафора «оплаты членских взносов» в контексте жизни: тяжелый труд, жертвы и испытания, которые человек прошел, чтобы заслужить свое место.'
      },
      {
        quote: 'sand kicked in my face but i have come through',
        meaning: 'Отсылка к американской идиоме о слабаке на пляже, которому хулиганы сыплют песок в лицо. Символизирует унижение и насмешки завистников, преодоленные с достоинством.'
      },
      {
        quote: 'no time for losers because we are the champions',
        meaning: 'Фредди отвергает позицию жертвы: в борьбе за свою мечту нельзя опускать руки и застревать в поражениях.'
      }
    ],
    emotionalTone: 'Героический, монументальный, вдохновляющий.'
  },
  'coldplay-scientist': {
    mainTheme: 'Парадокс рационализма: попытка просчитать любовь законами науки и невозможность отмотать время назад.',
    culturalContext: 'Клип, снятый задом наперед (in reverse), идеально визуализирует главную идею песни: отчаянное желание вернуть всё к моменту до роковой ошибки («let us go back to the start»).',
    metaphors: [
      {
        quote: 'running in circles coming up tails heads on a science apart',
        meaning: 'Метафора подбрасывания монетки и бега по кругу: попытка применить холодную теорию вероятностей к иррациональным чувствам.'
      },
      {
        quote: 'i had to find you tell you i set you apart',
        meaning: '«Set apart» — выделить среди всей вселенной, признать единственной ценностью перед лицом пустоты.'
      },
      {
        quote: 'nobody said it was easy it is such a shame for us to part',
        meaning: 'Принятие горькой правды: отношения требуют душевной работы, а расставание оставляет незаживающий след.'
      }
    ],
    emotionalTone: 'Меланхоличный, интимный, исповедальный.'
  },
  'beatles-yesterday': {
    mainTheme: 'Ностальгия по утраченной юношеской невинности и внезапное столкновение со взрослой уязвимостью.',
    culturalContext: 'Мелодия пришла Полу Маккартни во сне. Песня стала одной из самых исполняемых в истории музыки благодаря универсальности чувства внезапной потери опоры под ногами.',
    metaphors: [
      {
        quote: 'yesterday all my troubles seemed so far away',
        meaning: '«Вчера» здесь — не просто прошлые сутки, а целая эпоха безмятежности и душевного покоя до роковой ошибки.'
      },
      {
        quote: 'suddenly i am not half the man i used to be',
        meaning: 'Метафора потери целостности личности: без любимого человека герой чувствует себя лишь тенью прежнего себя.'
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
  const [songsList, setSongsList] = useState<Array<{ id: string; title: string; artist: string; level: string; thumbnailUrl: string; grammarFocus: string; sentenceCount: number }>>([])
  const [selectedSongId, setSelectedSongId] = useState<string>('queen-champions')
  const [currentSong, setCurrentSong] = useState<MusicLesson | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeSubtitleId, setActiveSubtitleId] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'grammar' | 'ai-meaning'>('grammar')

  // Real-time Karaoke Playback State
  const [isKaraokePlaying, setIsKaraokePlaying] = useState<boolean>(false)
  const [playbackTime, setPlaybackTime] = useState<number>(0.0)
  const [timingOffset, setTimingOffset] = useState<number>(0.0)

  const activeSubtitleRef = useRef<HTMLDivElement>(null)
  const subtitlesScrollContainerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const seekingUntilRef = useRef<number>(0)
  const seekTargetTimeRef = useRef<number>(0)
  const activeSubtitleIdRef = useRef(activeSubtitleId)
  activeSubtitleIdRef.current = activeSubtitleId
  const timingOffsetRef = useRef(timingOffset)
  timingOffsetRef.current = timingOffset

  // Direct postMessage command to YouTube iframe with handshake
  const sendYtCommand = (func: string, args: any[] = []) => {
    if (typeof window === 'undefined') return
    const iframe = document.getElementById('youtube-karaoke-iframe') as HTMLIFrameElement | null
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.postMessage('{"event":"listening"}', '*')
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: func,
            args: args
          }),
          '*'
        )
      } catch {}
    }
  }

  // Safe seek and play helper that prevents postMessage race conditions and frame lag
  const executeSeekAndPlay = (targetTime: number, subId?: number) => {
    seekingUntilRef.current = Date.now() + 600
    seekTargetTimeRef.current = targetTime
    setPlaybackTime(targetTime)
    if (subId !== undefined) {
      setActiveSubtitleId(subId)
    }

    if (ytPlayerRef.current?.seekTo) {
      try {
        ytPlayerRef.current.seekTo(targetTime, true)
        ytPlayerRef.current.playVideo()
      } catch {}
    } else {
      sendYtCommand('seekTo', [targetTime, true])
      sendYtCommand('playVideo')
    }
    setIsKaraokePlaying(true)
  }

  // Jump to specific word in the video
  const handlePlayWord = (e: React.MouseEvent, wordStart: number, subId: number) => {
    e.stopPropagation()
    executeSeekAndPlay(wordStart, subId)
  }

  // Skip instrumental intro directly to the first singing word
  const handleSkipIntro = () => {
    if (!currentSong || currentSong.subtitles.length === 0) return
    const firstVocalStart = currentSong.subtitles[0].startSeconds || 0.0
    executeSeekAndPlay(firstVocalStart, currentSong.subtitles[0].id)
  }

  // Dynamically load YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      } else {
        document.body.appendChild(tag)
      }
    }
  }, [])

  // Listen to real-time YouTube postMessage playback notifications (ONLY for state changes to avoid race conditions)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (data && data.event === 'infoDelivery' && data.info) {
          if (data.info.playerState === 1) {
            setIsKaraokePlaying(true)
          } else if (data.info.playerState === 2 || data.info.playerState === 0) {
            setIsKaraokePlaying(false)
          }
        }
      } catch {
        // ignore non-json messages
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Attach YouTube Player as soon as currentSong and iframe are rendered
  useEffect(() => {
    if (typeof window === 'undefined' || !currentSong) return

    let cancelled = false

    const tryInitPlayer = () => {
      if (cancelled) return
      if (!window.YT || !window.YT.Player) return
      const iframeEl = document.getElementById('youtube-karaoke-iframe')
      if (!iframeEl) return

      try {
        if (!ytPlayerRef.current) {
          ytPlayerRef.current = new window.YT.Player('youtube-karaoke-iframe', {
            events: {
              onReady: () => {
                sendYtCommand('listening')
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (event.data === 1) {
                  setIsKaraokePlaying(true)
                } else if (event.data === 2 || event.data === 0) {
                  setIsKaraokePlaying(false)
                }
              }
            }
          })
        }
      } catch {
        // safe fallback
      }
    }

    if (window.YT && window.YT.Player) {
      tryInitPlayer()
    } else {
      window.onYouTubeIframeAPIReady = tryInitPlayer
    }

    const timer = setTimeout(tryInitPlayer, 400)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [currentSong?.id])

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
    return () => { isMounted = false }
  }, [])

  // Load selected song details
  useEffect(() => {
    let isMounted = true
    const loadSong = async () => {
      try {
        const song = await api.getMusicLesson(selectedSongId)
        if (isMounted) {
          setCurrentSong(song)
          setPlaybackTime(0)
          setIsKaraokePlaying(false)
          if (song.subtitles.length > 0) {
            setActiveSubtitleId(song.subtitles[0].id)
          }

          // If YT player exists, update video
          if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
            const match = song.videoUrl.match(/embed\/([a-zA-Z0-9_-]+)/)
            if (match && match[1]) {
              ytPlayerRef.current.loadVideoById(match[1])
            }
          }
        }
      } catch {
        // Fallback
      }
    }
    loadSong()
    return () => { isMounted = false }
  }, [selectedSongId])

  // Real-time karaoke sync loop connected directly with YouTube video timestamp
  useEffect(() => {
    if (!isKaraokePlaying || !currentSong || currentSong.subtitles.length === 0) return

    let lastTimestamp = performance.now()

    const interval = setInterval(() => {
      // If we recently executed a seek, wait for YouTube to settle without rubber-banding
      if (Date.now() < seekingUntilRef.current) {
        return
      }

      let currentTime = -1

      // 1. Prioritize YouTube player's exact real-time playback position
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const ytTime = ytPlayerRef.current.getCurrentTime()
          if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime >= 0) {
            currentTime = ytTime
          }
        } catch {
          // fallback to high-precision wall clock ticker below
        }
      }

      if (currentTime >= 0) {
        lastTimestamp = performance.now()
        setPlaybackTime(currentTime)

        // Find matching subtitle line taking timing offset into account
        const effTime = currentTime + timingOffsetRef.current
        const match = currentSong.subtitles.find(s => effTime >= s.startSeconds && effTime <= s.endSeconds)
        if (match && match.id !== activeSubtitleIdRef.current) {
          setActiveSubtitleId(match.id)
        }
      } else {
        // 2. High-precision wall-clock fallback if YouTube player is unavailable (tests or offline)
        const now = performance.now()
        const deltaSec = (now - lastTimestamp) / 1000
        lastTimestamp = now

        setPlaybackTime(prev => {
          const next = Math.round((prev + deltaSec) * 100) / 100
          const maxTime = currentSong.subtitles[currentSong.subtitles.length - 1].endSeconds
          if (next > maxTime + 5.0) {
            setIsKaraokePlaying(false)
            return 0
          }

          const effNext = next + timingOffsetRef.current
          const match = currentSong.subtitles.find(s => effNext >= s.startSeconds && effNext <= s.endSeconds)
          if (match && match.id !== activeSubtitleIdRef.current) {
            setActiveSubtitleId(match.id)
          }
          return next
        })
      }
    }, 100)

    return () => clearInterval(interval)
  }, [isKaraokePlaying, currentSong])

  // Auto-scroll active subtitle line smoothly inside container
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

  // Toggle video playback and karaoke synchronization simultaneously
  const handleToggleKaraoke = () => {
    if (isKaraokePlaying) {
      if (ytPlayerRef.current?.pauseVideo) {
        try { ytPlayerRef.current.pauseVideo() } catch {}
      } else {
        sendYtCommand('pauseVideo')
      }
      setIsKaraokePlaying(false)
    } else {
      if (ytPlayerRef.current?.playVideo) {
        try { ytPlayerRef.current.playVideo() } catch {}
      } else {
        sendYtCommand('playVideo')
      }
      setIsKaraokePlaying(true)
    }
  }

  // Jump to subtitle line and start video playback from that second
  const handlePlayLine = (text: string, id: number, startSec: number) => {
    executeSeekAndPlay(startSec, id)
    soundService.speakText(text, 1.0)
  }

  // Reset video and karaoke to beginning
  const handleResetToStart = () => {
    seekingUntilRef.current = Date.now() + 600
    seekTargetTimeRef.current = 0
    if (ytPlayerRef.current?.seekTo) {
      try {
        ytPlayerRef.current.seekTo(0, true)
        ytPlayerRef.current.pauseVideo()
      } catch {}
    } else {
      sendYtCommand('seekTo', [0, true])
      sendYtCommand('pauseVideo')
    }
    setPlaybackTime(0)
    setIsKaraokePlaying(false)
    setActiveSubtitleId(currentSong?.subtitles[0]?.id || 1)
  }

  // Handle start typing session
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
                AI Cultural Lyrics + Touch Typing
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Смотрите клип с автопрокруткой караоке, изучайте смысл от AI и тренируйте скоропечатание!
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
              <div className="relative aspect-video w-full bg-[#050811] flex items-center justify-center">
                <iframe
                  id="youtube-karaoke-iframe"
                  className="w-full h-full"
                  src={`${currentSong.videoUrl}?enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  title={`${currentSong.artist} - ${currentSong.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Player Header bar & Karaoke Controls */}
              <div className="p-3.5 bg-white/[0.02] flex items-center justify-between border-t border-white/[0.06]">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{currentSong.artist} — {currentSong.title}</span>
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

            {/* Synchronized Karaoke Subtitles with Real-time Word-by-Word Highlighting & Calibration */}
            <div className="p-5 rounded-3xl bg-[#090d16] border border-white/[0.08] space-y-3 shadow-2xl shadow-black/60">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-sky-400" />
                  <span>Караоке-субтитры</span>
                  <span className="text-[10px] text-sky-300 font-mono font-normal lowercase bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    пословная синхронизация
                  </span>
                </h4>

                <div className="flex items-center space-x-3 font-mono text-xs">
                  {/* Calibration offset controls */}
                  <div className="flex items-center space-x-1 bg-white/[0.02] px-2 py-0.5 rounded-xl border border-white/[0.06] text-[11px]" title="Калибровка сдвига тайминга под ваше аудио">
                    <span className="text-slate-500 text-[10px]">Сдвиг:</span>
                    <button
                      onClick={() => setTimingOffset(prev => Math.round((prev - 0.2) * 10) / 10)}
                      className="px-1.5 py-0.2 rounded hover:bg-sky-500/20 text-sky-300 transition cursor-pointer"
                      title="-0.2с"
                    >
                      -0.2s
                    </button>
                    <button
                      onClick={() => setTimingOffset(0)}
                      className={`px-1.5 py-0.2 rounded transition cursor-pointer ${timingOffset === 0 ? 'text-slate-400' : 'text-sky-400 font-bold bg-sky-500/20'}`}
                      title="Сбросить сдвиг"
                    >
                      {timingOffset === 0 ? '0.0s' : `${timingOffset > 0 ? '+' : ''}${timingOffset}s`}
                    </button>
                    <button
                      onClick={() => setTimingOffset(prev => Math.round((prev + 0.2) * 10) / 10)}
                      className="px-1.5 py-0.2 rounded hover:bg-sky-500/20 text-sky-300 transition cursor-pointer"
                      title="+0.2с"
                    >
                      +0.2s
                    </button>
                  </div>

                  <span className="text-sky-400 font-bold">
                    {playbackTime.toFixed(1)} сек
                  </span>
                </div>
              </div>

              {/* Instrumental Intro Live Banner */}
              {isKaraokePlaying && currentSong.subtitles[0] && (playbackTime + timingOffset) < currentSong.subtitles[0].startSeconds && (
                <div className="p-3 rounded-2xl bg-sky-500/[0.06] border border-sky-400/30 flex items-center justify-between text-xs animate-pulse">
                  <div className="flex items-center space-x-2 text-sky-300 font-mono">
                    <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
                    <span>Вступление (инструментал) • Вокал через:</span>
                    <span className="font-bold text-white text-sm">
                      {Math.max(0, currentSong.subtitles[0].startSeconds - (playbackTime + timingOffset)).toFixed(1)}с
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
                  const effectiveTime = Math.max(0, playbackTime + timingOffset)

                  // Determine active word index accurately using per-word intervals if available
                  let activeWordIdx = -1
                  if (isActive && isKaraokePlaying) {
                    if (sub.words && sub.words.length > 0) {
                      activeWordIdx = sub.words.findIndex(w => effectiveTime >= w.start && effectiveTime <= w.end)
                      if (activeWordIdx === -1) {
                        for (let i = sub.words.length - 1; i >= 0; i--) {
                          if (effectiveTime >= sub.words[i].start) {
                            activeWordIdx = i
                            break
                          }
                        }
                      }
                    } else {
                      const lineDuration = Math.max(0.1, sub.endSeconds - sub.startSeconds)
                      const lineProgress = Math.max(0, Math.min(1, (effectiveTime - sub.startSeconds) / lineDuration))
                      activeWordIdx = Math.min(words.length - 1, Math.floor(lineProgress * words.length))
                    }
                  }

                  const lineDuration = Math.max(0.1, sub.endSeconds - sub.startSeconds)
                  const lineProgress = Math.max(0, Math.min(1, (effectiveTime - sub.startSeconds) / lineDuration))

                  return (
                    <div
                      key={sub.id}
                      ref={isActive ? activeSubtitleRef : null}
                      onClick={() => handlePlayLine(sub.textEn, sub.id, sub.startSeconds)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isActive
                          ? 'bg-white/[0.07] border-sky-400/50 text-white shadow-xl shadow-sky-500/10 ring-1 ring-sky-400/30'
                          : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1.5 flex-1">
                          {/* Word-by-word karaoke highlighting with clickable jump */}
                          <div className="font-mono text-sm sm:text-base leading-relaxed flex flex-wrap gap-2">
                            {words.map((w, wIdx) => {
                              const isCurrentWord = isActive && wIdx === activeWordIdx
                              const isPastWord = isActive && (activeWordIdx > -1 ? wIdx < activeWordIdx : false)
                              const wordTiming = sub.words?.[wIdx]

                              let wordStyle = 'text-slate-400 hover:text-sky-300'
                              if (isCurrentWord) {
                                wordStyle = 'text-white font-extrabold bg-sky-500/30 px-2 py-0.5 rounded-lg border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.35)] inline-block'
                              } else if (isPastWord) {
                                wordStyle = 'text-sky-300 font-medium'
                              }

                              return (
                                <span
                                  key={wIdx}
                                  onClick={(e) => wordTiming ? handlePlayWord(e, wordTiming.start, sub.id) : undefined}
                                  className={`${wordStyle} cursor-pointer`}
                                  title={wordTiming ? `Перейти к ${wordTiming.start}с` : undefined}
                                >
                                  {w}
                                </span>
                              )
                            })}
                          </div>

                          <div className="text-xs text-slate-400">
                            {sub.textRu}
                          </div>
                        </div>

                        <button
                          className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-sky-400 shrink-0 transition"
                          title="Прослушать строку"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Progress Fill Bar */}
                      {isActive && isKaraokePlaying && (
                        <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full"
                            style={{ width: `${lineProgress * 100}%` }}
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
                  <p className="text-xs text-slate-400">
                    Грамматические конструкции из текста трека:
                  </p>

                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {currentSong.grammarBreakdown.map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 hover:border-white/[0.12] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-sky-400">
                            {rule.ruleTitle}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-sky-300 border border-white/[0.08]">
                            {rule.grammarTag}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-slate-200 bg-white/[0.03] p-2.5 rounded-xl border border-white/[0.06]">
                          «{rule.lyricQuote}»
                        </div>

                        <div className="text-xs text-slate-400 leading-relaxed">
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
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-transparent to-sky-500/10 border border-white/[0.08] space-y-2">
                    <div className="flex items-center space-x-1.5 text-indigo-300 text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-sky-400" />
                      <span>Главный философский посыл</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {aiAnalysis.mainTheme}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                    <div className="flex items-center space-x-1.5 text-sky-400 text-xs font-bold">
                      <Flame className="w-4 h-4" />
                      <span>Культурный и исторический контекст</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {aiAnalysis.culturalContext}
                    </p>
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
                          <div className="text-xs text-slate-300 leading-relaxed pl-1">
                            {m.meaning}
                          </div>
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
