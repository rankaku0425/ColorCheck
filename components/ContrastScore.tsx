import React from 'react';
import { WCAGResult } from '../types';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface ContrastScoreProps {
  result: WCAGResult;
}

const ContrastScore: React.FC<ContrastScoreProps> = ({ result }) => {
  const getScoreColor = (ratio: number) => {
    if (ratio >= 7) return 'text-green-600';
    if (ratio >= 4.5) return 'text-emerald-500';
    if (ratio >= 3) return 'text-amber-500';
    return 'text-red-500';
  };

  const Badge = ({ label, passed }: { label: string; passed: boolean }) => (
    <div className={`flex items-center justify-between px-3 py-2 rounded-md border ${passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <span className={`text-xs font-bold ${passed ? 'text-green-800' : 'text-red-800'}`}>{label}</span>
      {passed ? (
        <CheckCircle2 className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-500" />
      )}
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">コントラスト比 (WCAG 2.1)</h3>
      
      <div className="flex items-baseline mb-6">
        <span className={`text-5xl font-bold tracking-tight ${getScoreColor(result.ratio)}`}>
          {result.ratio.toFixed(2)}
        </span>
        <span className="text-2xl font-medium text-slate-400 ml-1">/ 21</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Badge label="AA (通常文字)" passed={result.aaNormal} />
        <Badge label="AA (大文字)" passed={result.aaLarge} />
        <Badge label="AAA (通常文字)" passed={result.aaaNormal} />
        <Badge label="AAA (大文字)" passed={result.aaaLarge} />
      </div>

      <div className="mt-4 text-xs text-slate-500 leading-relaxed">
        <p className="flex items-start gap-1.5">
          <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>WCAG基準: 通常文字は 4.5:1 以上、大文字(18pt+ または太字14pt+)は 3:1 以上が必要です。</span>
        </p>
      </div>
    </div>
  );
};

export default ContrastScore;
