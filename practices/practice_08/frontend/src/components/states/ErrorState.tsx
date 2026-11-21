import React from 'react'
import { AlertOctagon, RotateCcw } from 'lucide-react'
import { Button } from '../ui/Button'

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Произошла ошибка загрузки',
  message = 'Не удалось связаться с сервером. Проверьте подключение к сети или повторите попытку.',
  onRetry
}) => {
  return (
    <div 
      className="max-w-md mx-auto p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4 my-12 shadow-2xl animate-fade-in"
      role="alert"
      data-testid="error-state"
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-2xl mx-auto">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <div className="pt-2 flex justify-center">
          <Button
            onClick={onRetry}
            variant="danger"
            size="md"
            data-testid="retry-button"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Повторить попытку</span>
          </Button>
        </div>
      )}
    </div>
  )
}
