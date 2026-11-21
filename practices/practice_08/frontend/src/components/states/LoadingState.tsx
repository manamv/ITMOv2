import React from 'react'

export interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Загрузка данных...'
}) => {
  return (
    <div 
      className="max-w-md mx-auto text-center space-y-6 p-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl animate-fade-in my-12"
      role="status"
      data-testid="loading-state"
    >
      <div className="relative w-16 h-16 mx-auto">
        <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-emerald-400 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-emerald-400 font-bold">
          LT
        </div>
      </div>
      <div>
        <h3 className="text-lg font-bold text-white mb-2">{message}</h3>
        <p className="text-xs text-slate-400">
          Синхронизация с сервером и подготовка упражнений...
        </p>
      </div>
      {/* Skeleton bar */}
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-1.5 rounded-full w-2/3 animate-pulse"></div>
      </div>
    </div>
  )
}
