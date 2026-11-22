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
        // Soft low muted thud for error
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(145, now)
        osc.frequency.exponentialRampToValueAtTime(68, now + 0.065)
        gain.gain.setValueAtTime(0.075, now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.065)
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
}

export const soundService = new SoundService()
