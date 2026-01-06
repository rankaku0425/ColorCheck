import React from 'react';
import { User, Heart, MessageCircle, Share2 } from 'lucide-react';

interface PreviewSimulatorProps {
  bgColor: string;
  textColor: string;
}

const PreviewSimulator: React.FC<PreviewSimulatorProps> = ({ bgColor, textColor }) => {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">プレビュー</span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
        </div>
      </div>
      
      <div className="p-6 bg-slate-100 flex justify-center items-center min-h-[300px]">
        {/* SNS Card Simulator */}
        <div 
            style={{ backgroundColor: bgColor, color: textColor }} 
            className="w-full max-w-sm rounded-2xl shadow-lg overflow-hidden transition-colors duration-300"
        >
          <div className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: textColor, opacity: 0.1 }} // Subtle background for avatar
              >
                  <User size={20} style={{ color: textColor }} />
              </div>
              <div>
                <div className="font-bold text-sm leading-tight">ユーザー名</div>
                <div className="text-xs opacity-70">@user_id • 2時間前</div>
              </div>
            </div>
            
            <p className="text-base leading-relaxed mb-4 font-medium">
              推し色で作る画面デザインのプレビューです。
              背景色と文字色のコントラスト比を確認して、誰にでも読みやすい投稿を目指しましょう！✨
            </p>
            
            <div 
              className="rounded-xl p-3 mb-4 border border-current"
              style={{ borderColor: textColor, opacity: 0.8 }}
            >
               <p className="text-sm font-bold opacity-90">重要なお知らせ</p>
               <p className="text-xs opacity-75 mt-1">
                 情報のアクセシビリティはとても大切です。
               </p>
            </div>

            <div className="flex items-center justify-between opacity-80 pt-2 border-t border-current" style={{ borderColor: textColor }}>
                <div className="flex gap-4">
                    <MessageCircle size={18} />
                    <Heart size={18} />
                    <Share2 size={18} />
                </div>
                <span className="text-xs">10:42 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewSimulator;
