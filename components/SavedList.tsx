import React from 'react';
import { Palette } from '../types';
import { Trash2 } from 'lucide-react';

interface SavedListProps {
  palettes: Palette[];
  onLoad: (p: Palette) => void;
  onDelete: (id: string) => void;
}

const SavedList: React.FC<SavedListProps> = ({ palettes, onLoad, onDelete }) => {
  if (palettes.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400 text-sm">保存されたパレットはありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {palettes.map((palette) => (
        <div 
          key={palette.id} 
          className="group relative bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
        >
          <div 
            className="h-16 w-full rounded-md mb-3 flex items-center justify-center text-sm font-bold shadow-inner cursor-pointer"
            style={{ backgroundColor: palette.bgColor, color: palette.textColor }}
            onClick={() => onLoad(palette)}
          >
            プレビュー
          </div>
          
          <div className="flex justify-between items-center px-1">
            <div className="flex flex-col">
               <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full border border-slate-200" style={{backgroundColor: palette.bgColor}}></span>
                  <span className="text-xs font-mono text-slate-600">{palette.bgColor}</span>
               </div>
               <div className="flex items-center gap-1 mt-1">
                  <span className="w-3 h-3 rounded-full border border-slate-200" style={{backgroundColor: palette.textColor}}></span>
                  <span className="text-xs font-mono text-slate-600">{palette.textColor}</span>
               </div>
            </div>
            
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(palette.id); }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
              title="削除"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedList;
