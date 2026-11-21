import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoadingState } from '../components/states/LoadingState'
import { EmptyState } from '../components/states/EmptyState'
import { ErrorState } from '../components/states/ErrorState'
import { SuccessResult } from '../components/states/SuccessResult'

describe('Criterion 10: 4 UI States with Mocked Data (Loading, Empty, Success, Error)', () => {
  it('renders Loading State with custom spinner and message', () => {
    render(<LoadingState message="Синхронизация данных с сервером..." />)

    expect(screen.getByTestId('loading-state')).toBeInTheDocument()
    expect(screen.getByText('Синхронизация данных с сервером...')).toBeInTheDocument()
  })

  it('renders Empty State with placeholder and action button', () => {
    const handleAction = vi.fn()
    render(
      <EmptyState
        title="Темы не найдены"
        description="По вашему фильтру нет доступных уроков."
        actionText="Сбросить фильтры"
        onAction={handleAction}
      />
    )

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('Темы не найдены')).toBeInTheDocument()
    expect(screen.getByText('По вашему фильтру нет доступных уроков.')).toBeInTheDocument()

    // Click action button
    const actionBtn = screen.getByRole('button', { name: /Сбросить фильтры/i })
    fireEvent.click(actionBtn)
    expect(handleAction).toHaveBeenCalled()
  })

  it('renders Error State and executes retry callback', () => {
    const handleRetry = vi.fn()
    render(
      <ErrorState
        title="Ошибка соединения"
        message="Сервер временно недоступен."
        onRetry={handleRetry}
      />
    )

    expect(screen.getByTestId('error-state')).toBeInTheDocument()
    expect(screen.getByText('Ошибка соединения')).toBeInTheDocument()
    expect(screen.getByText('Сервер временно недоступен.')).toBeInTheDocument()

    const retryBtn = screen.getByTestId('retry-button')
    fireEvent.click(retryBtn)
    expect(handleRetry).toHaveBeenCalledTimes(1)
  })

  it('renders Success State with metrics scoreboard and weak keys review', () => {
    const mockStats = {
      topicId: 'cond-2',
      wpm: 82,
      accuracy: 99.1,
      errors: 1,
      durationSeconds: 38,
      weakKeys: ['p', 'r']
    }

    render(
      <SuccessResult
        stats={mockStats}
        onRepeat={vi.fn()}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByTestId('success-result')).toBeInTheDocument()
    expect(screen.getByTestId('result-wpm')).toHaveTextContent('82')
    expect(screen.getByTestId('result-accuracy')).toHaveTextContent('99.1%')
    expect(screen.getByTestId('result-duration')).toHaveTextContent('38')

    // Check weak keys
    expect(screen.getByText('P')).toBeInTheDocument()
    expect(screen.getByText('R')).toBeInTheDocument()
  })
})
