// Sound & Speech Synthesis Service

const SOUND_PREF_KEY = 'linguatype_key_sound_enabled'

class SoundService {
  private audioContext: AudioContext | null = null
  private selectedVoice: SpeechSynthesisVoice | null = null
  private keySoundEnabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(SOUND_PREF_KEY)
        if (stored !== null) {
          this.keySoundEnabled = stored === 'true'
        }
      } catch {
        // ignore storage restrictions
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = () => {
          this.initVoice()
        }
        this.initVoice()
      }
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()

    const preferred =
      voices.find(
        v =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google US English') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel'))
      ) || voices.find(v => v.lang.startsWith('en'))

    this.selectedVoice = preferred || null
  }

  isKeySoundEnabled(): boolean {
    return this.keySoundEnabled
  }

  setKeySoundEnabled(enabled: boolean) {
    this.keySoundEnabled = enabled
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(SOUND_PREF_KEY, String(enabled))
      }
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Speak English sentence with natural cadence
   */
  speakText(text: string, rate: number = 0.95) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    if (!this.selectedVoice) {
      this.initVoice()
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice
    }
    utterance.lang = 'en-US'
    utterance.rate = rate
    utterance.pitch = 1.0

    window.speechSynthesis.speak(utterance)
  }

  /**
   * Speak an individual word promptly for real-time word-by-word dictation
   */
  speakWord(word: string, rate: number = 1.0) {
    if (!word || typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    if (!this.selectedVoice) {
      this.initVoice()
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice
    }
    utterance.lang = 'en-US'
    utterance.rate = rate
    utterance.pitch = 1.05

    window.speechSynthesis.speak(utterance)
  }

  /**
   * Play studio MP3 pronunciation if available, otherwise fallback to speech synthesis
   */
  async playWordAudio(word: string, audioUrl?: string) {
    if (audioUrl) {
      try {
        const audio = new Audio(audioUrl)
        await audio.play()
        return
      } catch {
        // Fallback to speech synthesis if audio fails to load
      }
    }
    this.speakText(word, 0.85)
  }

  /**
   * Tactile mechanical keyboard switch "thock" click via Web Audio API synth
   */
  playKeyClick(isError: boolean = false) {
    if (!this.keySoundEnabled) return
    try {
      if (typeof window === 'undefined') return
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!this.audioContext) {
        this.audioContext = new AudioCtx()
      }

      const ctx = this.audioContext
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      if (isError) {
        // Gentle, unobtrusive muted low-mid error tap (soft two-tone wooden dip)
        osc.type = 'sine'
        osc.frequency.setValueAtTime(220, now)
        osc.frequency.exponentialRampToValueAtTime(135, now + 0.085)
        gain.gain.setValueAtTime(0.001, now)
        gain.gain.linearRampToValueAtTime(0.065, now + 0.008)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.095)
      } else {
        // Crisp tactile mechanical "thock"
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(420, now)
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.028)
        gain.gain.setValueAtTime(0.032, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.028)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.028)
      }
    } catch {
      // AudioContext might be blocked before user gesture; safe to ignore
    }
  }

  /**
   * Pleasant gentle completion chime after finishing a typing exercise
   */
  playCompletionChime() {
    this.playNotes([
      { freq: 523.25, delay: 0, dur: 0.22, type: 'sine', vol: 0.055 }, // C5
      { freq: 659.25, delay: 0.09, dur: 0.24, type: 'sine', vol: 0.055 }, // E5
      { freq: 783.99, delay: 0.18, dur: 0.42, type: 'triangle', vol: 0.06 } // G5
    ])
  }

  /**
   * Crisp uplifting chime for a correct quiz answer
   */
  playQuizCorrect() {
    this.playNotes([
      { freq: 659.25, delay: 0, dur: 0.14, type: 'sine', vol: 0.06 }, // E5
      { freq: 880.0, delay: 0.075, dur: 0.26, type: 'sine', vol: 0.065 } // A5
    ])
  }

  /**
   * Soft distinct descending tone for an incorrect quiz answer
   */
  playQuizWrong() {
    this.playNotes([
      { freq: 277.18, delay: 0, dur: 0.14, type: 'triangle', vol: 0.055 }, // C#4
      { freq: 196.0, delay: 0.1, dur: 0.22, type: 'sine', vol: 0.06 } // G3
    ])
  }

  private playNotes(
    notes: Array<{ freq: number; delay: number; dur: number; type: OscillatorType; vol: number }>
  ) {
    try {
      if (typeof window === 'undefined') return
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!this.audioContext) {
        this.audioContext = new AudioCtx()
      }
      const ctx = this.audioContext
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime
      notes.forEach(n => {
        const start = now + n.delay
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = n.type
        osc.frequency.setValueAtTime(n.freq, start)

        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.linearRampToValueAtTime(n.vol, start + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + n.dur + 0.02)
      })
    } catch {
      // Safe fallback in environments without Web Audio API
    }
  }

  /**
   * Pleasant sparkling chime arpeggio when the user beats their personal WPM record
   */
  playNewRecordFanfare() {
    try {
      if (typeof window === 'undefined') return
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!this.audioContext) {
        this.audioContext = new AudioCtx()
      }
      const ctx = this.audioContext
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const now = ctx.currentTime
      // Bright uplifting Cmaj9 ascending chime notes (C5, E5, G5, B5, D6, C6)
      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66, 1046.5]
      notes.forEach((freq, idx) => {
        const start = now + idx * 0.085
        const duration = idx === notes.length - 1 ? 0.65 : 0.28

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, start)

        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.linearRampToValueAtTime(0.075, start + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(start)
        osc.stop(start + duration + 0.02)
      })
    } catch {
      // Safe fallback in environments without Web Audio API
    }
  }
}

export const soundService = new SoundService()
