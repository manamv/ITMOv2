import React, { useState, useEffect, useRef } from 'react'
import { Music, Play, Pause, Volume2, BookOpen, Sparkles, ChevronRight, Headphones, Bot, Flame, RotateCcw } from 'lucide-react'
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

export const MusicClipsView: React.FC<MusicClipsViewProps> = ({ onStartTyping }) => {
  const [songsList, setSongsList] = useState<Array<{ id: string; title: string; artist: string; level: string; thumbnailUrl: string; grammarFocus: string; sentenceCount: number }>>([])
  const [selectedSongId, setSelectedSongId] = useState<string>('queen-champions')
  const [currentSong, setCurrentSong] = useState<MusicLesson | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeSubtitleId, setActiveSubtitleId] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'grammar' | 'ai-meaning'>('grammar')

  // Real-time Karaoke Playback State
  const [isKaraokePlaying, setIsKaraokePlaying] = useState<boolean>(false)
  const [playbackTime, setPlaybackTime] = useState<number>(0.0)

  const activeSubtitleRef = useRef<HTMLDivElement>(null)
  const subtitlesScrollContainerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)

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

  // Initialize YouTube Player attached to the iframe
  useEffect(() => {
    if (typeof window === 'undefined') return

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return
      try {
        if (!ytPlayerRef.current) {
          ytPlayerRef.current = new window.YT.Player('youtube-karaoke-iframe', {
            events: {
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
        // Safe fallback for test environments
      }
    }

    if (window.YT && window.YT.Player) {
      initPlayer()
    } else {
      window.onYouTubeIframeAPIReady = initPlayer
    }
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

    const interval = setInterval(() => {
      // 1. Prioritize YouTube player's exact real-time playback position
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const ytTime = ytPlayerRef.current.getCurrentTime()
          if (typeof ytTime === 'number' && !isNaN(ytTime) && ytTime >= 0) {
            setPlaybackTime(ytTime)

            // Find matching subtitle line
            const match = currentSong.subtitles.find(s => ytTime >= s.startSeconds && ytTime <= s.endSeconds)
            if (match && match.id !== activeSubtitleId) {
              setActiveSubtitleId(match.id)
            }
            return
          }
        } catch {
          // fallback to internal ticker below
        }
      }

      // 2. Fallback internal ticker if YouTube player is unavailable (tests or offline)
      setPlaybackTime(prev => {
        const next = Math.round((prev + 0.15) * 100) / 100
        const maxTime = currentSong.subtitles[currentSong.subtitles.length - 1].endSeconds
        if (next > maxTime) {
          setIsKaraokePlaying(false)
          return 0
        }

        const match = currentSong.subtitles.find(s => next >= s.startSeconds && next <= s.endSeconds)
        if (match && match.id !== activeSubtitleId) {
          setActiveSubtitleId(match.id)
        }
        return next
      })
    }, 120)

    return () => clearInterval(interval)
  }, [isKaraokePlaying, currentSong, activeSubtitleId])

  // Auto-scroll active subtitle line into view smoothly
  useEffect(() => {
    if (activeSubtitleRef.current) {
      activeSubtitleRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }
  }, [activeSubtitleId])

  // Toggle video playback and karaoke synchronization simultaneously
  const handleToggleKaraoke = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try {
        if (isKaraokePlaying) {
          ytPlayerRef.current.pauseVideo()
          setIsKaraokePlaying(false)
        } else {
          ytPlayerRef.current.playVideo()
          setIsKaraokePlaying(true)
        }
        return
      } catch {
        // Fallback below
      }
    }
    setIsKaraokePlaying(p => !p)
  }

  // Jump to subtitle line and start video playback from that second
  const handlePlayLine = (text: string, id: number, startSec: number) => {
    setActiveSubtitleId(id)
    setPlaybackTime(startSec)

    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(startSec, true)
        ytPlayerRef.current.playVideo()
        setIsKaraokePlaying(true)
        return
      } catch {
        // Fallback
      }
    }
    soundService.speakText(text, 1.0)
  }

  // Reset video and karaoke to beginning
  const handleResetToStart = () => {
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try {
        ytPlayerRef.current.seekTo(0, true)
        ytPlayerRef.current.pauseVideo()
      } catch {
        // ignore
      }
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
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              Музыкальные клипы & Разбор грамматики
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
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
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/25 transition-all flex items-center space-x-2 cursor-pointer"
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
              className={`flex items-center space-x-3 px-3.5 py-2 rounded-2xl border transition-all cursor-pointer shrink-0 text-left ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-500/10 text-white font-semibold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              data-testid={`song-tab-${song.id}`}
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 border border-slate-700">
                {song.level}
              </div>
              <div>
                <div className="text-xs font-bold">{song.title}</div>
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
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
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
              <div className="p-3 bg-slate-900 flex items-center justify-between border-t border-slate-800/80">
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-2">
                    <span>{currentSong.artist} — {currentSong.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-normal">
                      YouTube Sync
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-400 font-mono mt-0.5">{currentSong.grammarFocus}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleKaraoke}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-mono font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                    data-testid="karaoke-toggle-btn"
                  >
                    {isKaraokePlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Пауза клипа</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Включить клип & Караоке</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetToStart}
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
                    title="В начало клипа и караоке"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Synchronized Karaoke Subtitles with Real-time Word-by-Word Highlighting & Auto-scroll */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  Караоке-субтитры (автопрокрутка и подсветка слова)
                </h4>
                <span className="text-[11px] text-amber-400 font-mono">
                  {playbackTime.toFixed(1)} сек
                </span>
              </div>

              <div
                ref={subtitlesScrollContainerRef}
                className="space-y-2 max-h-60 overflow-y-auto pr-1 scroll-smooth"
                data-testid="subtitles-scroll-container"
              >
                {currentSong.subtitles.map(sub => {
                  const isActive = activeSubtitleId === sub.id
                  const words = sub.textEn.split(' ')

                  // Calculate active word index within current line duration
                  const lineDuration = Math.max(0.1, sub.endSeconds - sub.startSeconds)
                  const lineProgress = Math.max(0, Math.min(1, (playbackTime - sub.startSeconds) / lineDuration))
                  const activeWordIdx = isActive && isKaraokePlaying
                    ? Math.min(words.length - 1, Math.floor(lineProgress * words.length))
                    : -1

                  return (
                    <div
                      key={sub.id}
                      ref={isActive ? activeSubtitleRef : null}
                      onClick={() => handlePlayLine(sub.textEn, sub.id, sub.startSeconds)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        {/* Word-by-word karaoke highlighting */}
                        <div className="font-mono text-xs sm:text-sm leading-relaxed flex flex-wrap gap-1.5">
                          {words.map((w, wIdx) => {
                            const isCurrentWord = isActive && wIdx === activeWordIdx
                            const isPastWord = isActive && wIdx < activeWordIdx

                            let wordStyle = 'text-slate-300'
                            if (isCurrentWord) {
                              wordStyle = 'text-amber-300 font-black bg-amber-500/25 px-1 py-0.5 rounded shadow-lg shadow-amber-500/30 ring-1 ring-amber-400/80 scale-105 inline-block transition-transform'
                            } else if (isPastWord) {
                              wordStyle = 'text-emerald-400 font-semibold'
                            }

                            return (
                              <span key={wIdx} className={wordStyle}>
                                {w}
                              </span>
                            )
                          })}
                        </div>

                        <div className="text-[11px] text-slate-400">
                          {sub.textRu}
                        </div>
                      </div>

                      <button
                        className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 shrink-0 transition"
                        title="Прослушать строку"
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
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-2xl">
              {/* Tab Switcher: Grammar vs AI Meaning */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
                <button
                  onClick={() => setActiveTab('grammar')}
                  className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    activeTab === 'grammar'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow'
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
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold shadow'
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
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 hover:border-emerald-500/30 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400">
                            {rule.ruleTitle}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            {rule.grammarTag}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-slate-200 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
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
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/5 border border-amber-500/25 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-400 text-xs font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>Главный философский посыл</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {aiAnalysis.mainTheme}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center space-x-1.5 text-cyan-400 text-xs font-bold">
                      <Flame className="w-4 h-4" />
                      <span>Культурный и исторический контекст</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {aiAnalysis.culturalContext}
                    </p>
                  </div>

                  {/* Metaphor Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300">
                      Скрытый подтекст ключевых метафор:
                    </span>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {aiAnalysis.metaphors.map((m, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1">
                          <div className="text-xs font-mono font-semibold text-amber-300">
                            «{m.quote}»
                          </div>
                          <div className="text-[11px] text-slate-400 leading-relaxed">
                            {m.meaning}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Start Typing Call to Action */}
              <div className="pt-2 border-t border-slate-800/80">
                <button
                  onClick={handleStartTypingLesson}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
