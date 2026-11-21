import type { Achievement } from '../types'

const STORAGE_KEY = 'linguatype_achievements_v1'

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-step',
    title: 'Первый шаг',
    description: 'Завершите вашу первую тренировку набора текста',
    icon: 'Rocket',
    category: 'special',
    unlocked: false
  },
  {
    id: 'speed-demon',
    title: 'Сверхзвуковой',
    description: 'Наберите текст со скоростью более 60 WPM',
    icon: 'Zap',
    category: 'speed',
    unlocked: false
  },
  {
    id: 'supersonic',
    title: 'Мастер клавиатуры',
    description: 'Превысьте гроссмейстерскую скорость 85 WPM',
    icon: 'Flame',
    category: 'speed',
    unlocked: false
  },
  {
    id: 'sniper',
    title: 'Снайпер точности',
    description: 'Завершите тренировку с точностью 98% или выше',
    icon: 'Target',
    category: 'accuracy',
    unlocked: false
  },
  {
    id: 'flawless',
    title: 'Абсолютный идеал',
    description: 'Наберите текст с точностью 100% без единой ошибки',
    icon: 'Award',
    category: 'accuracy',
    unlocked: false
  },
  {
    id: 'blind-ear',
    title: 'Слепой диктант',
    description: 'Завершите тренировку с полностью скрытым текстом на слух',
    icon: 'Headphones',
    category: 'special',
    unlocked: false
  },
  {
    id: 'rock-star',
    title: 'Меломан-лингвист',
    description: 'Пройдите слепую печать по тексту музыкального клипа',
    icon: 'Music',
    category: 'grammar',
    unlocked: false
  },
  {
    id: 'polyglot',
    title: 'Полиглот',
    description: 'Освойте упражнения по 3 разным грамматическим темам',
    icon: 'BookOpen',
    category: 'grammar',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'vocab-builder',
    title: 'Словарный запас',
    description: 'Сохраните 3 или более слов в личный словарь',
    icon: 'Star',
    category: 'special',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'hall-of-fame',
    title: 'В зале славы',
    description: 'Опубликуйте свой рекорд в общем Лидерборде',
    icon: 'Trophy',
    category: 'special',
    unlocked: false
  }
]

class AchievementsService {
  private completedTopics = new Set<string>()

  getAchievements(): Achievement[] {
    if (typeof window === 'undefined') return DEFAULT_ACHIEVEMENTS

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ACHIEVEMENTS))
        return DEFAULT_ACHIEVEMENTS
      }
      const parsed: Achievement[] = JSON.parse(stored)
      // Merge with default in case new ones were added
      return DEFAULT_ACHIEVEMENTS.map(def => {
        const found = parsed.find(p => p.id === def.id)
        return found ? { ...def, ...found } : def
      })
    } catch {
      return DEFAULT_ACHIEVEMENTS
    }
  }

  private saveAchievements(list: Achievement[]) {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch {
      // Ignore storage errors
    }
  }

  checkAndUnlock(context: {
    wpm?: number
    accuracy?: number
    errors?: number
    topicId?: string
    isBlindAudio?: boolean
    isMusic?: boolean
    vocabCount?: number
    isLeaderboard?: boolean
  }): Achievement[] {
    const all = this.getAchievements()
    const newlyUnlocked: Achievement[] = []

    if (context.topicId) {
      this.completedTopics.add(context.topicId)
    }

    const updated = all.map(ach => {
      if (ach.unlocked) return ach

      let shouldUnlock = false

      if (ach.id === 'first-step' && context.wpm !== undefined) {
        shouldUnlock = true
      } else if (ach.id === 'speed-demon' && context.wpm && context.wpm >= 60) {
        shouldUnlock = true
      } else if (ach.id === 'supersonic' && context.wpm && context.wpm >= 85) {
        shouldUnlock = true
      } else if (ach.id === 'sniper' && context.accuracy && context.accuracy >= 98) {
        shouldUnlock = true
      } else if (ach.id === 'flawless' && context.accuracy && context.accuracy === 100 && context.errors === 0) {
        shouldUnlock = true
      } else if (ach.id === 'blind-ear' && context.isBlindAudio) {
        shouldUnlock = true
      } else if (ach.id === 'rock-star' && context.isMusic) {
        shouldUnlock = true
      } else if (ach.id === 'polyglot') {
        const count = this.completedTopics.size
        ach.progress = count
        if (count >= 3) shouldUnlock = true
      } else if (ach.id === 'vocab-builder' && context.vocabCount !== undefined) {
        ach.progress = context.vocabCount
        if (context.vocabCount >= 3) shouldUnlock = true
      } else if (ach.id === 'hall-of-fame' && context.isLeaderboard) {
        shouldUnlock = true
      }

      if (shouldUnlock) {
        const item: Achievement = {
          ...ach,
          unlocked: true,
          unlockedAt: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
        }
        newlyUnlocked.push(item)
        return item
      }

      return ach
    })

    if (newlyUnlocked.length > 0) {
      this.saveAchievements(updated)
    }

    return newlyUnlocked
  }

  getUnlockedCount(): number {
    return this.getAchievements().filter(a => a.unlocked).length
  }
}

export const achievementsService = new AchievementsService()
