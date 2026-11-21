// Weak Keys and Keyboard Heatmap Tracker

export interface KeyStats {
  hits: number
  errors: number
}

const STORAGE_KEY = 'linguatype_key_stats'

class WeakKeysService {
  private stats: Record<string, KeyStats> = {}

  constructor() {
    this.load()
  }

  private load() {
    if (typeof window === 'undefined') return
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (data) {
        this.stats = JSON.parse(data)
      }
    } catch {
      this.stats = {}
    }
  }

  private save() {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.stats))
    } catch {
      // Ignore storage errors
    }
  }

  recordKey(key: string, isError: boolean) {
    const k = key.toLowerCase()
    if (!k || k.length > 1) return // only track single printable characters

    if (!this.stats[k]) {
      this.stats[k] = { hits: 0, errors: 0 }
    }

    this.stats[k].hits += 1
    if (isError) {
      this.stats[k].errors += 1
    }

    this.save()
  }

  /**
   * Returns list of keys with error rate > 12% (minimum 3 hits)
   */
  getWeakKeys(): string[] {
    return Object.entries(this.stats)
      .filter(([_, data]) => data.hits >= 3 && data.errors / data.hits >= 0.12)
      .sort((a, b) => b[1].errors / b[1].hits - a[1].errors / a[1].hits)
      .map(([key]) => key)
  }

  /**
   * Returns key error rate from 0 (perfect) to 1.0 (all errors), or null if not enough data
   */
  getKeyHeatmap(): Record<string, number> {
    const result: Record<string, number> = {}
    for (const [key, data] of Object.entries(this.stats)) {
      if (data.hits >= 2) {
        result[key] = Math.min(1.0, data.errors / data.hits)
      }
    }
    return result
  }

  clear() {
    this.stats = {}
    this.save()
  }
}

export const weakKeysService = new WeakKeysService()
