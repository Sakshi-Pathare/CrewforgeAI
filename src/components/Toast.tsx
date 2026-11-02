import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white rounded-2xl p-4 shadow-2xl border border-[#EAEFF8] flex items-start gap-3.5 animate-fade-in-up transition-all hover:shadow-card-hover"
          style={{
            borderLeft: toast.type === 'warning' 
              ? '4px solid #F59E0B' 
              : toast.type === 'info' 
              ? '4px solid #563CF0' 
              : '4px solid #10B981'
          }}
        >
          {toast.type === 'warning' ? (
            <div className="w-8 h-8 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          ) : toast.type === 'info' ? (
            <div className="w-8 h-8 rounded-xl bg-[#F0EEFF] text-[#563CF0] flex items-center justify-center shrink-0">
              <Info className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 pr-1">
            <h5 className="text-[13.5px] font-bold text-[#142653] leading-tight">
              {toast.title}
            </h5>
            {toast.message && (
              <p className="text-[12px] text-[#5F6D82] mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-[#8A95A5] hover:text-[#142653] p-1 rounded-lg hover:bg-[#F3F5FA] transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
