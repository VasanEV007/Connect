import React from 'react';
import { parseAmritaRollNumber } from '../utils/rollNumberParser';
import { CheckCircle2, AlertCircle, Building2, GraduationCap, Calendar, Compass } from 'lucide-react';

interface Props {
  rollNumber: string;
  onChange: (val: string) => void;
  onParsed?: (dept: string, year: number) => void;
  readOnly?: boolean;
}

export const RollNumberParserWidget: React.FC<Props> = ({
  rollNumber,
  onChange,
  onParsed,
  readOnly = false,
}) => {
  const parsed = parseAmritaRollNumber(rollNumber);

  React.useEffect(() => {
    if (parsed.isValid && onParsed) {
      onParsed(parsed.deptName, parsed.joiningYear);
    }
  }, [parsed.isValid, parsed.deptName, parsed.joiningYear, onParsed]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
          Amrita Roll Number (e.g. CB.EN.U4ARE24001)
        </label>
        <div className="relative">
          <input
            type="text"
            value={rollNumber}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="CB.EN.U4ARE24001"
            readOnly={readOnly}
            className={`w-full font-mono text-sm uppercase px-3.5 py-2.5 rounded-xl border bg-[#07090E] transition-all ${
              rollNumber.length > 0
                ? parsed.isValid
                  ? 'border-[#22C55E] ring-1 ring-[#22C55E]/30 text-white'
                  : 'border-amber-500 ring-1 ring-amber-500/30 text-white'
                : 'border-[#1E2433] text-slate-100 hover:border-[#2D3748]'
            } focus:outline-none focus:border-[#22C55E]`}
          />
          {rollNumber.length > 0 && (
            <div className="absolute right-3 top-2.5">
              {parsed.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-400" />
              )}
            </div>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Auto-parses Campus, School, Degree, Department, and Joining Year.
        </p>
      </div>

      {/* Parser Visual Breakdown */}
      {rollNumber.length > 0 && (
        <div className={`p-3.5 rounded-xl border text-xs transition-all ${
          parsed.isValid 
            ? 'bg-[#07090E] border-[#1E2433]' 
            : 'bg-[#07090E] border-amber-500/30'
        }`}>
          {parsed.isValid ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#22C55E] font-semibold border-b border-[#1E2433] pb-1.5">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  Verified Identity Matrix
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-mono">
                  {parsed.rollId ? `Student #${parsed.rollId}` : 'Valid'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span className="truncate"><strong>Campus:</strong> {parsed.campusName} ({parsed.campusCode})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span className="truncate"><strong>Degree:</strong> {parsed.degreeName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span className="truncate"><strong>Dept:</strong> {parsed.deptCode} ({parsed.deptName})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                  <span><strong>Batch:</strong> {parsed.joiningYear} • Year {parsed.currentYearStudy}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Roll format expecting: [CAMPUS].[SCHOOL].[DEGREE+DEPT+YEAR+ROLL]</p>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  Example: <code className="bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">CB.EN.U4ARE24001</code>
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
