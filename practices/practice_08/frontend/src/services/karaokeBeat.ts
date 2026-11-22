// Lightweight Web Audio API Ambient Chord Pad for Studio Karaoke Mode

const SONG_CHORDS: Record<string, number[][]> = {
  // Queen - We Are The Champions (C minor / Eb major feel)
  'queen-champions': [
    [261.63, 311.13, 392.0], // Cm
    [233.08, 293.66, 349.23], // Bb
    [207.65, 261.63, 311.13], // Ab
    [196.0, 246.94, 293.66] // G
  ],
  // Coldplay - The Scientist (Dm7 -> Bb -> F -> C)
  'coldplay-scientist': [
    [293.66, 349.23, 440.0], // Dm
    [233.08, 293.66, 349.23], // Bb
    [174.61, 220.0, 261.63], // F
    [261.63, 329.63, 392.0] // C
  ],
  // The Beatles - Yesterday (F -> Em -> A7 -> Dm)
  'beatles-yesterday': [
    [174.61, 220.0, 261.63], // F
    [164.81, 196.0, 246.94], // Em
    [220.0, 277.18, 329.63], // A
    [293.66, 349.23, 440.0] // Dm
  ]
}

class KaraokeBeatEngine {
  private ctx: AudioContext | null = null
  private timerId: number | null = null
  private chordIndex = 0

  start(songId: string) {
    this.stop()
    if (typeof window === 'undefined') return
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!this.ctx) {
        this.ctx = new AudioCtx()
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume()
      }

      const progression = SONG_CHORDS[songId] || SONG_CHORDS['coldplay-scientist']
      this.chordIndex = 0

      const playChord = () => {
        if (!this.ctx) return
        const freqs = progression[this.chordIndex % progression.length]
        this.chordIndex++

        const now = this.ctx.currentTime
        freqs.forEach(freq => {
          if (!this.ctx) return
          const osc = this.ctx.createOscillator()
          const gain = this.ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, now)

          gain.gain.setValueAtTime(0.0001, now)
          gain.gain.linearRampToValueAtTime(0.022, now + 0.35)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4)

          osc.connect(gain)
          gain.connect(this.ctx.destination)
          osc.start(now)
          osc.stop(now + 2.5)
        })
      }

      playChord()
      this.timerId = window.setInterval(playChord, 2400)
    } catch {
      // AudioContext might be unavailable in tests
    }
  }

  stop() {
    if (this.timerId !== null) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }
}

export const karaokeBeat = new KaraokeBeatEngine()
