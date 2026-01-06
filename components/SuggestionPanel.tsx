import React from 'react';
import { Suggestion } from '../utils/colorUtils';
import { Check, RotateCcw } from 'lucide-react';

interface SuggestionPanelProps {
  suggestions: Suggestion[];
  onPreview: (bg: string, text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isPreviewing: boolean;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({ suggestions, onPreview, onConfirm, onCancel, isPreviewing }) => {
  if (suggestions.length === 0) return null;

  return (
    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
      <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">AI提案</span>
        {isPreviewing ? '変更の確認' : '読みやすい色の候補'}
      </h3>

      {isPreviewing ? (
        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm text-center">
            <p className="text-sm text-slate-700 font-bold mb-1">
                プレビュー中の色に変更しますか？
            </p>
            <p className="text-xs text-slate-500 mb-4">
                上のプレビュー画面で実際の見え方を確認できます。
            </p>
            <div className="flex gap-3 justify-center">
                <button 
                    onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 text-sm font-bold transition-colors"
                >
                    <RotateCcw size={16} />
                    戻る
                </button>
                <button 
                    onClick={onConfirm}
                    className="flex-[1.5] flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold transition-colors shadow-sm"
                >
                    <Check size={16} />
                    適用する
                </button>
            </div>
        </div>
      ) : (
        <div className="grid gap-3">
            {suggestions.map((s, idx) => (
            <button
                key={idx}
                onClick={() => onPreview(s.bgColor, s.textColor)}
                className="group flex items-center justify-between w-full p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition-all text-left"
            >
                <div className="flex items-center gap-3 flex-1">
                {/* Preview Circle */}
                <div 
                    className="w-12 h-12 rounded-full border border-slate-200 shadow-inner flex items-center justify-center shrink-0"
                    style={{ backgroundColor: s.bgColor }}
                >
                    <span 
                    className="font-bold text-lg"
                    style={{ color: s.textColor }}
                    >
                    Aa
                    </span>
                </div>
                
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">{s.label}</span>
                    </div>
                    <div className="flex gap-2 text-[10px] font-mono mt-0.5">
                        <span className="bg-slate-100 px-1 rounded text-slate-500">BG: {s.bgColor}</span>
                        <span className="bg-slate-100 px-1 rounded text-slate-500">Txt: {s.textColor}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.description}</p>
                </div>
                </div>

                <div className="flex flex-col items-end pl-3 border-l border-slate-100 ml-2">
                <span className={`text-sm font-bold ${s.ratio >= 7 ? 'text-green-600' : s.ratio >= 4.5 ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {s.ratio.toFixed(2)}
                </span>
                <span className="text-[10px] text-slate-400">Contrast</span>
                </div>
            </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionPanel;
