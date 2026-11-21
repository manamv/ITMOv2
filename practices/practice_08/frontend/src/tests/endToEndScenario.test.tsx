import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { App } from '../App'
import { api } from '../services/api'

describe('Criterion 11: Full End-to-End User Scenario', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('completes the full flow: select topic -> type sentence -> view victory scoreboard', async () => {
    // 1. Mock API responses
    const mockTopics = [
      {
        id: 'pres-perf',
        title: 'Present Perfect vs Past Simple',
        level: 'B1',
        description: 'Разница между результатом в настоящем и завершённым действием.',
        sentenceCount: 1
      }
    ]

    const mockLesson = {
      id: 'pres-perf',
      title: 'Present Perfect vs Past Simple',
      level: 'B1',
      description: 'Test lesson',
      sentences: [
        {
          id: 's1',
          english: 'Hi.',
          russian: 'Привет.',
          grammarTip: 'Тестовое короткое предложение'
        }
      ]
    }

    vi.spyOn(api, 'getTopics').mockResolvedValue(mockTopics)
    vi.spyOn(api, 'getLesson').mockResolvedValue(mockLesson)
    vi.spyOn(api, 'saveStats').mockResolvedValue({ success: true, recordId: 'rec-123' })
    vi.spyOn(api, 'getVocabulary').mockResolvedValue([])
    vi.spyOn(api, 'getStatsSummary').mockResolvedValue({
      totalSessions: 1,
      avgWpm: 60,
      avgAccuracy: 98,
      totalErrors: 0,
      weakKeysFrequency: {}
    })

    // 2. Render App
    render(<App />)

    // Wait for initial load to finish and topic card to appear
    await waitFor(() => {
      expect(screen.getByTestId('topic-card-pres-perf')).toBeInTheDocument()
    })

    // 3. User clicks on the topic card to start practice
    const topicCard = screen.getByTestId('topic-card-pres-perf')
    fireEvent.click(topicCard)

    // 4. Verify typing session is displayed
    await waitFor(() => {
      expect(screen.getByTestId('typing-engine')).toBeInTheDocument()
    })

    expect(screen.getByText(/Привет./i)).toBeInTheDocument()

    // 5. User types the sentence: 'H', 'i', '.'
    fireEvent.keyDown(window, { key: 'H' })
    fireEvent.keyDown(window, { key: 'i' })
    fireEvent.keyDown(window, { key: '.' })

    // 6. User reaches victory result scoreboard!
    await waitFor(() => {
      expect(screen.getByTestId('success-result')).toBeInTheDocument()
    })

    expect(screen.getByText('Отличная работа!')).toBeInTheDocument()
    expect(screen.getByTestId('result-wpm')).toBeInTheDocument()
    expect(screen.getByTestId('result-accuracy')).toBeInTheDocument()

    // 7. Click button to return to topics
    const backBtn = screen.getByTestId('next-lesson-btn')
    fireEvent.click(backBtn)

    await waitFor(() => {
      expect(screen.getByTestId('topic-selector')).toBeInTheDocument()
    })
  })
})
