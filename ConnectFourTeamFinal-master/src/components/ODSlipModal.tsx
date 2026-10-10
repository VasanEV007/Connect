import React, { useEffect } from 'react';
import { ODSlip } from '../types';
import { 
  X, 
  Printer, 
  CheckCircle, 
  ShieldCheck, 
  QrCode, 
  Building2 
} from 'lucide-react';

interface Props {
  slip: ODSlip | null;
  onClose: () => void;
}

export const ODSlipModal: React.FC<Props> = ({ slip, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!slip) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden text-slate-900">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-3.5 bg-[var(--color-surface-card)] text-[var(--color-text-main)] border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[var(--color-burgundy)]" />
            <span className="font-semibold text-sm">Official Institutional On-Duty (OD) Certificate</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[var(--color-burgundy)] hover:opacity-95 text-[#E5DED2] text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable OD Certificate Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white">
          <div 
            id="printable-od-slip" 
            className="border-4 border-double border-indigo-950 p-6 sm:p-8 rounded-xl bg-gradient-to-b from-indigo-50/20 via-white to-amber-50/15 relative shadow-sm"
          >
            
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <Building2 className="w-96 h-96 text-indigo-950" />
            </div>

            {/* University Header */}
            <div className="text-center border-b-2 border-indigo-900/30 pb-5 mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-1">
                <div className="w-10 h-10 rounded-full bg-indigo-900 text-amber-300 flex items-center justify-center text-xl font-bold shadow-sm">
                  ॐ
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-wide text-indigo-950 uppercase">
                    Amrita Vishwa Vidyapeetham
                  </h1>
                  <p className="text-[11px] uppercase tracking-widest text-slate-600 font-medium">
                    Ettimadai Campus • Coimbatore - 641112, Tamil Nadu, India
                  </p>
                </div>
              </div>
              <div className="mt-2 inline-block px-4 py-1 bg-indigo-950 text-amber-200 text-xs font-bold tracking-widest uppercase rounded">
                Official Attendance Regularization (On-Duty) Slip
              </div>
            </div>

            {/* Verification Reference & Timestamp */}
            <div className="flex items-center justify-between text-xs text-slate-600 border-b border-slate-200 pb-3 mb-6 font-mono">
              <div>
                <span className="font-semibold text-slate-500">REF NO:</span> {slip.verification_hash}
              </div>
              <div>
                <span className="font-semibold text-slate-500">DATE ISSUED:</span> {new Date(slip.issued_at).toLocaleDateString()}
              </div>
            </div>

            {/* Statement of Certification */}
            <p className="text-xs text-slate-700 leading-relaxed mb-6">
              This is to certify that the student listed below has officially participated and rendered authorized academic/technical service. Their attendance for the specified duration is recommended for sanction of <strong>Institutional On-Duty (OD)</strong> privileges.
            </p>

            {/* Student & Event Data Table */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mb-6 text-xs">
              <div className="grid grid-cols-3 p-3 border-b border-slate-200">
                <span className="font-bold text-slate-500">Student Name</span>
                <span className="col-span-2 font-bold text-slate-900 text-sm">{slip.student_name}</span>
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-slate-200 bg-white">
                <span className="font-bold text-slate-500">Amrita Roll Number</span>
                <span className="col-span-2 font-mono font-bold text-indigo-900 text-sm">{slip.student_roll}</span>
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-slate-200">
                <span className="font-bold text-slate-500">Department / Batch</span>
                <span className="col-span-2 text-slate-800">{slip.student_dept} ({slip.student_year} Batch)</span>
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-slate-200 bg-white">
                <span className="font-bold text-slate-500">Activity / Event</span>
                <span className="col-span-2 font-semibold text-slate-900">{slip.event_title}</span>
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-slate-200">
                <span className="font-bold text-slate-500">Event Date</span>
                <span className="col-span-2 text-slate-800">{new Date(slip.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="grid grid-cols-3 p-3 bg-indigo-50/60 font-semibold text-indigo-950">
                <span className="font-bold">Sanctioned OD Duration</span>
                <span className="col-span-2 text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {slip.od_hours} Official Hours (Full Day Equivalent)
                </span>
              </div>
            </div>

            {/* Faculty Coordinator Endorsement & Seal Block */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex items-end justify-between">
              
              {/* QR Verification preview */}
              <div className="flex items-center gap-3">
                <div className="p-2 border-2 border-slate-800 rounded bg-white shadow-xs">
                  <QrCode className="w-14 h-14 text-slate-900" />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  <p className="font-bold text-slate-700">Digital Seal Verified</p>
                  <p className="truncate max-w-[130px]">{slip.verification_hash}</p>
                  <p className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                    <CheckCircle className="w-3 h-3" /> Validated by Connect Platform
                  </p>
                </div>
              </div>

              {/* Signature Block */}
              <div className="text-right">
                <div className="italic text-base text-indigo-900 font-semibold mb-1">
                  {slip.faculty_name}
                </div>
                <div className="h-0.5 w-40 bg-indigo-950 ml-auto mb-1.5"></div>
                <p className="text-xs font-bold text-slate-900">{slip.faculty_name}</p>
                <p className="text-[10px] text-slate-600">{slip.faculty_designation}</p>
                <p className="text-[10px] text-slate-500">{slip.faculty_dept}</p>
                <p className="text-[9px] text-slate-500 italic mt-0.5">Faculty Coordinator Signature</p>
              </div>

            </div>

            {/* Footer note */}
            <div className="mt-6 pt-3 border-t border-dashed border-slate-300 text-[10px] text-center text-slate-400">
              Generated via Connect Collaboration Platform. Submit to Department Administrative Office for official portal ERP attendance adjustment.
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
