import React from 'react'
import { Inbox } from 'lucide-react'
import { Button } from '../ui/Button'

export interface EmptyStateProps {
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Данные не найдены',
  description = 'По выбранным критериям или фильтрам ничего не найдено.',
  actionText = 'Сбросить фильтры',
  onAction
}) => {
  return (
    <div 
      className="max-w-md mx-auto text-center space-y-4 p-8 rounded-3xl bg-slate-900 border border-dashed border-slate-800 shadow-xl my-12 animate-fade-in"
      data-testid="empty-state"
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
        <Inbox className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-white mb-1">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
      {onAction && (
        <div className="pt-2">
          <Button onClick={onAction} variant="secondary" size="sm">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  )
}
