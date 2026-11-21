// Sound & Speech Synthesis Service

class SoundService {
  private audioContext: AudioContext | null = null
  private selectedVoice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.initVoice()
      }
      this.initVoice()
    }
  }

  private initVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const voices = window.speechSynthesis.getVoices()
    
    // Priority: Natural English voices
    const preferred = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Natural') || v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Daniel'))
    ) || voices.find(v => v.lang.startsWith('en'))

    this.selectedVoice = preferred || null
  }

  /**
   * Speak English sentence with natural cadence
   */
  speakText(text: string, rate: number = 0.95) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    window.speechSynthesis.cancel() // Stop any current speech

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
   * Subtle mechanical keypress click sound via Web Audio API synth
   */
  playKeyClick(isError: boolean = false) {
    try {
      if (typeof window === 'undefined') return
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!this.audioContext) {
        this.audioContext = new AudioCtx()
      }

      const ctx = this.audioContext
      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = isError ? 'sawtooth' : 'sine'
      osc.frequency.setValueAtTime(isError ? 120 : 650, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(isError ? 60 : 250, ctx.currentTime + 0.04)

      gain.gain.setValueAtTime(isError ? 0.08 : 0.03, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.04)
    } catch {
      // AudioContext might be blocked before user gesture; safe to ignore
    }
  }
}

export const soundService = new SoundService()
