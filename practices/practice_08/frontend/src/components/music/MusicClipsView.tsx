import React, { useState, useEffect } from 'react'
import { Music, Pause, Volume2, BookOpen, Sparkles, ChevronRight, Headphones } from 'lucide-react'
import type { MusicLesson, LessonData } from '../../types'
import { api } from '../../services/api'
import { soundService } from '../../services/sound'

interface MusicClipsViewProps {
  onStartTyping: (lesson: LessonData) => void
}

export const MusicClipsView: React.FC<MusicClipsViewProps> = ({ onStartTyping }) => {
  const [songsList, setSongsList] = useState<Array<{ id: string; title: string; artist: string; level: string; thumbnailUrl: string; grammarFocus: string; sentenceCount: number }>>([])
  const [selectedSongId, setSelectedSongId] = useState<string>('queen-champions')
  const [currentSong, setCurrentSong] = useState<MusicLesson | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [activeSubtitleId, setActiveSubtitleId] = useState<number>(1)
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false)

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
          if (song.subtitles.length > 0) {
            setActiveSubtitleId(song.subtitles[0].id)
          }
        }
      } catch {
        // Fallback
      }
    }
    loadSong()
    return () => { isMounted = false }
  }, [selectedSongId])

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

  // Play line audio
  const handlePlayLine = (text: string, id: number) => {
    setActiveSubtitleId(id)
    setIsPlayingAudio(true)
    soundService.speakText(text, 1.0)
    setTimeout(() => setIsPlayingAudio(false), 2500)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full animate-fade-in" data-testid="music-clips-view">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/60 border border-emerald-500/20 shadow-2xl">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Музыкальные клипы & Разбор грамматики
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                Interactive Music Video
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Смотрите клип с синхронными субтитрами, изучайте правила из текста, а затем тренируйте скоропечатание!
            </p>
          </div>
        </div>

        {currentSong && (
          <button
            onClick={handleStartTypingLesson}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center space-x-2 cursor-pointer"
            data-testid="start-music-typing-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>Начать печать песни</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Song Selector Carousel / Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
        {songsList.map(song => {
          const isSelected = song.id === selectedSongId
          return (
            <button
              key={song.id}
              onClick={() => setSelectedSongId(song.id)}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-2xl border transition-all cursor-pointer shrink-0 text-left ${
                isSelected
                  ? 'bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-500/10 text-white font-semibold'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              data-testid={`song-tab-${song.id}`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-emerald-400 border border-slate-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Video Player & Interactive Subtitles */}
          <div className="lg:col-span-7 space-y-4">
            {/* Video Player Card */}
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-2xl">
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
                <iframe
                  className="w-full h-full"
                  src={currentSong.videoUrl}
                  title={`${currentSong.artist} - ${currentSong.title}`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Player Header bar */}
              <div className="p-4 bg-slate-900 flex items-center justify-between border-t border-slate-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white">{currentSong.artist} — {currentSong.title}</h3>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">{currentSong.grammarFocus}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    Уровень {currentSong.level}
                  </span>
                </div>
              </div>
            </div>

            {/* Synchronized Subtitles Stream */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-cyan-400" />
                  Синхронные субтитры к клипу (нажмите для прослушивания)
                </h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  {currentSong.subtitles.length} строк
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {currentSong.subtitles.map(sub => {
                  const isActive = activeSubtitleId === sub.id
                  return (
                    <div
                      key={sub.id}
                      onClick={() => handlePlayLine(sub.textEn, sub.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isActive
                          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-mono text-xs sm:text-sm font-semibold text-white">
                          {sub.textEn}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.textRu}
                        </div>
                      </div>

                      <button
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 shrink-0 transition"
                        title="Прослушать строку"
                      >
                        {isActive && isPlayingAudio ? (
                          <Pause className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Grammar & Linguistic Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-2xl">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Разбор правил песни</h3>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                В этой песне исполнитель использует живые грамматические конструкции. Изучите их перед переходом к набору текста:
              </p>

              <div className="space-y-3">
                {currentSong.grammarBreakdown.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        {rule.ruleTitle}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {rule.grammarTag}
                      </span>
                    </div>

                    <div className="font-mono text-xs text-slate-200 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                      «{rule.lyricQuote}»
                    </div>

                    <div className="text-xs text-slate-400 leading-relaxed">
                      {rule.explanation}
                    </div>
                  </div>
                ))}
              </div>

              {/* Start Typing Call to Action */}
              <div className="pt-2">
                <button
                  onClick={handleStartTypingLesson}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
