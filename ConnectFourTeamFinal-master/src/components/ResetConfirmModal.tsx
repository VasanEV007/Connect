import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="relative w-full max-w-md bg-[#0D1017] rounded-2xl shadow-2xl border border-[#1E2433] p-6 space-y-4 text-slate-100">
        
        <div className="flex items-start justify-between">
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#131722] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h2 id="reset-modal-title" className="text-base sm:text-lg font-bold text-white">
            Reset Demo Data to Amrita Defaults?
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            This action will clear local temporary changes and restore the pristine seed catalog of Amrita opportunities, student/faculty personas, registrations, and official OD slips.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-[#07090E] border border-[#1E2433] text-[11px] text-slate-300 space-y-1">
          <p className="font-semibold text-white">What will be restored:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
            <li>Original student & faculty personas (Arjun, Dr. Radhika, etc.)</li>
            <li>Default research calls, workshops, hackathons & carpool listings</li>
            <li>Initial verified OD certificates and notifications</li>
          </ul>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Confirm & Reset Data
          </Button>
        </div>

      </div>
    </div>
  );
};
